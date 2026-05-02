#include "esp_camera.h"
#include <WiFi.h>
#include <WebSocketsClient.h>

#include "../esp32-cam/config.h"
#include "../esp32-cam/pinmap.h"

// Disable brownout resets during camera + WiFi current spikes.
#include "soc/rtc_cntl_reg.h"
#include "soc/soc.h"

namespace esp32_cam_config = pakamew::shelter_device::esp32_cam_config;
namespace esp32_cam_pinmap = pakamew::shelter_device::esp32_cam_pinmap;

WebSocketsClient webSocket;
bool isConnected = false;
unsigned long lastFrameTime = 0;

void webSocketEvent(WStype_t type, uint8_t *payload, size_t length) {
  (void)length;

  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("[WS] Disconnected from Cloud Server!");
      isConnected = false;
      break;
    case WStype_CONNECTED:
      Serial.printf("[WS] Connected to url: %s\n", payload);
      isConnected = true;
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

void setup() {
#if CONFIG_IDF_TARGET_ESP32
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
#endif

  // Match the ROM boot log baud so reset and sketch logs are readable together.
  Serial.begin(115200);
  Serial.println();

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
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();

  if (!isConnected) {
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
