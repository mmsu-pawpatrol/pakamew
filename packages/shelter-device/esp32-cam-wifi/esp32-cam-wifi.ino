#include "esp_camera.h"
#include <PubSubClient.h>
#include <WiFi.h>
#include <WebSocketsClient.h>

#include "../esp32-cam/config.h"
#include "../esp32-cam/pinmap.h"
#include "dispenser-bridge.h"
#include "mqtt-bridge-state.h"
#include "mqtt-json.h"

// Disable brownout resets during camera + WiFi current spikes.
#include "soc/rtc_cntl_reg.h"
#include "soc/soc.h"

namespace esp32_cam_config = pakamew::shelter_device::esp32_cam_config;
namespace esp32_cam_pinmap = pakamew::shelter_device::esp32_cam_pinmap;
namespace mqtt_bridge_state = pakamew::shelter_device::esp32_cam_wifi_mqtt_bridge_state;
namespace mqtt_json = pakamew::shelter_device::esp32_cam_wifi_mqtt_json;
namespace dispenser_bridge = pakamew::shelter_device::esp32_cam_wifi_dispenser_bridge;

namespace {

WebSocketsClient webSocket;
WiFiClient mqttTransport;
PubSubClient mqttClient(mqttTransport);
HardwareSerial gizduinoSerial(1);

bool isWebSocketConnected = false;
unsigned long lastFrameTime = 0;
mqtt_bridge_state::MqttBridgeState bridgeState;

String buildStatePayload(
  const char *state,
  bool busy,
  const String &requestId,
  const char *mode,
  int angle,
  unsigned long openDurationMs,
  const char *message
) {
  return mqtt_bridge_state::buildStatePayload(state, busy, requestId, mode, angle, openDurationMs, message);
}

void publishState(
  const char *state,
  bool busy,
  const String &requestId,
  const char *mode,
  int angle,
  unsigned long openDurationMs,
  const char *message
) {
  if (!mqttClient.connected()) {
    return;
  }

  const String payload = buildStatePayload(state, busy, requestId, mode, angle, openDurationMs, message);
  mqttClient.publish(esp32_cam_config::kMqttStatusTopic, payload.c_str(), true);
  mqttClient.publish(esp32_cam_config::kMqttEventsTopic, payload.c_str(), false);
}

String buildOfflinePayload() {
  return mqtt_bridge_state::buildOfflinePayload();
}

void clearBusyState() {
  mqtt_bridge_state::clearBusyState(bridgeState);
}

void armBusyState(const String &requestId, const char *mode, int angle, unsigned long openDurationMs) {
  mqtt_bridge_state::armBusyState(bridgeState, requestId, mode, angle, openDurationMs);
}

void maybePublishCompletion() {
  if (!bridgeState.isCommandInFlight) {
    return;
  }

  if ((long)(millis() - bridgeState.busyUntilMs) < 0) {
    return;
  }

  publishState(
    "completed",
    false,
    bridgeState.activeRequestId,
    bridgeState.activeCommandMode.c_str(),
    bridgeState.activeAngle,
    bridgeState.activeOpenDurationMs,
    "command cycle completed"
  );
  clearBusyState();
}

void handleCommandMessage(const String &payload) {
  const String requestId = mqtt_json::jsonStringField(payload, "requestId");
  const String mode = mqtt_json::jsonStringField(payload, "mode");

  if (requestId.length() == 0 || mode.length() == 0) {
    publishState("failed", false, requestId, mode.c_str(), 0, 0, "invalid command payload");
    return;
  }

  if (bridgeState.isCommandInFlight) {
    publishState("busy", true, requestId, mode.c_str(), bridgeState.activeAngle, bridgeState.activeOpenDurationMs, "device is busy");
    return;
  }

  if (mode == "angle") {
    const int angle = dispenser_bridge::clampAngle(
      (int)mqtt_json::jsonLongField(payload, "angle", esp32_cam_config::kDefaultDispenseAngle)
    );
    dispenser_bridge::sendAngleToGizduino(gizduinoSerial, angle);
    armBusyState(requestId, "angle", angle, 0);
    publishState("accepted", true, requestId, "angle", angle, 0, "angle command accepted");
    return;
  }

  if (mode == "duration") {
    const unsigned long openDurationMs = dispenser_bridge::clampOpenDurationMs(
      (unsigned long)mqtt_json::jsonLongField(payload, "openDurationMs", esp32_cam_config::kDefaultOpenDurationMs)
    );
    dispenser_bridge::sendOpenDurationToGizduino(gizduinoSerial, openDurationMs);
    armBusyState(requestId, "duration", 0, openDurationMs);
    publishState("accepted", true, requestId, "duration", 0, openDurationMs, "duration command accepted");
    return;
  }

  publishState("failed", false, requestId, mode.c_str(), 0, 0, "unsupported mode");
}

void mqttMessageReceived(char *topic, uint8_t *payload, unsigned int length) {
  (void)topic;

  String text;
  text.reserve(length);
  for (unsigned int index = 0; index < length; index++) {
    text += (char)payload[index];
  }

  handleCommandMessage(text);
}

bool connectMqtt() {
  if (strlen(esp32_cam_config::kMqttBrokerHost) == 0) {
    return false;
  }

  if (mqttClient.connected()) {
    return true;
  }

  const String offlinePayload = buildOfflinePayload();
  const String clientId = String("esp32-cam-") + esp32_cam_config::kMqttDeviceId + "-" +
    String((uint32_t)(ESP.getEfuseMac() & 0xFFFFFFFF), HEX);

  bool connected = mqttClient.connect(
    clientId.c_str(),
    esp32_cam_config::kMqttUsername,
    esp32_cam_config::kMqttPassword,
    esp32_cam_config::kMqttStatusTopic,
    0,
    true,
    offlinePayload.c_str()
  );
  if (!connected) {
    return false;
  }

  mqttClient.subscribe(esp32_cam_config::kMqttCommandTopic);
  publishState("booted", false, "", "", 0, 0, "device connected to broker");
  return true;
}

void webSocketEvent(WStype_t type, uint8_t *payload, size_t length) {
  (void)length;

  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("[WS] Disconnected from Cloud Server!");
      isWebSocketConnected = false;
      break;
    case WStype_CONNECTED:
      Serial.printf("[WS] Connected to url: %s\n", payload);
      isWebSocketConnected = true;
      break;
    case WStype_TEXT:
    case WStype_BIN:
    case WStype_ERROR:
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
      break;
  }
}

} // namespace

void setup() {
#if CONFIG_IDF_TARGET_ESP32
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
#endif

  // Match the ROM boot log baud so reset and sketch logs are readable together.
  Serial.begin(esp32_cam_config::kLogSerialBaud);
  Serial.println();

  gizduinoSerial.begin(
    esp32_cam_config::kGizduinoSerialBaud,
    SERIAL_8N1,
    esp32_cam_config::kGizduinoSerialRxPin,
    esp32_cam_config::kGizduinoSerialTxPin
  );

  WiFi.mode(WIFI_STA);
  WiFi.begin(esp32_cam_config::kWifiSsid, esp32_cam_config::kWifiPassword);
  WiFi.setSleep(false);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected successfully!");
  Serial.print("ESP32-CAM IP address: ");
  Serial.println(WiFi.localIP());

  camera_config_t config = {};
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = esp32_cam_pinmap::kCamPinY2;
  config.pin_d1 = esp32_cam_pinmap::kCamPinY3;
  config.pin_d2 = esp32_cam_pinmap::kCamPinY4;
  config.pin_d3 = esp32_cam_pinmap::kCamPinY5;
  config.pin_d4 = esp32_cam_pinmap::kCamPinY6;
  config.pin_d5 = esp32_cam_pinmap::kCamPinY7;
  config.pin_d6 = esp32_cam_pinmap::kCamPinY8;
  config.pin_d7 = esp32_cam_pinmap::kCamPinY9;
  config.pin_xclk = esp32_cam_pinmap::kCamPinXclk;
  config.pin_pclk = esp32_cam_pinmap::kCamPinPclk;
  config.pin_vsync = esp32_cam_pinmap::kCamPinVsync;
  config.pin_href = esp32_cam_pinmap::kCamPinHref;
  config.pin_sccb_sda = esp32_cam_pinmap::kCamPinSiod;
  config.pin_sccb_scl = esp32_cam_pinmap::kCamPinSioc;
  config.pin_pwdn = esp32_cam_pinmap::kCamPinPwdn;
  config.pin_reset = esp32_cam_pinmap::kCamPinReset;
  config.xclk_freq_hz = esp32_cam_pinmap::kCameraXclkFrequencyHz;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_QVGA;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_DRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  if (psramFound()) {
    config.fb_location = CAMERA_FB_IN_PSRAM;
    config.jpeg_quality = 10;
    config.fb_count = 2;
    config.grab_mode = CAMERA_GRAB_LATEST;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    return;
  }

  Serial.println("Camera initialized successfully.");

  sensor_t *sensor = esp_camera_sensor_get();
  if (sensor != nullptr) {
    sensor->set_vflip(sensor, esp32_cam_pinmap::kCameraVerticalFlip);
    sensor->set_hmirror(sensor, esp32_cam_pinmap::kCameraHorizontalMirror);
  }

  webSocket.begin(
    esp32_cam_config::kWebSocketHost,
    esp32_cam_config::kWebSocketPort,
    esp32_cam_config::kWebSocketPath
  );
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(esp32_cam_config::kWebSocketReconnectIntervalMs);

  mqttClient.setServer(esp32_cam_config::kMqttBrokerHost, esp32_cam_config::kMqttBrokerPort);
  mqttClient.setKeepAlive(esp32_cam_config::kMqttKeepAliveSeconds);
  mqttClient.setSocketTimeout(esp32_cam_config::kMqttSocketTimeoutSeconds);
  mqttClient.setCallback(mqttMessageReceived);
}

void loop() {
  webSocket.loop();
  maybePublishCompletion();

  mqttClient.loop();
  if (!mqttClient.connected()) {
    unsigned long now = millis();
    if (now - bridgeState.lastMqttReconnectAttemptMs >= esp32_cam_config::kMqttReconnectIntervalMs) {
      bridgeState.lastMqttReconnectAttemptMs = now;
      connectMqtt();
    }
  }

  if (!isWebSocketConnected) {
    delay(10);
    return;
  }

  if (millis() - lastFrameTime <= esp32_cam_config::kWifiFrameIntervalMs) {
    delay(1);
    return;
  }

  camera_fb_t *fb = esp_camera_fb_get();
  if (fb == nullptr) {
    Serial.println("Camera capture failed");
    return;
  }

  webSocket.sendBIN(fb->buf, fb->len);
  esp_camera_fb_return(fb);

  lastFrameTime = millis();
  delay(1);
}
