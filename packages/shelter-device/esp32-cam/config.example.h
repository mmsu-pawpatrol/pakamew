#pragma once

namespace pakamew {
namespace shelter_device {
namespace esp32_cam_config {

static constexpr const char kWifiSsid[] = "YOUR_WIFI_SSID";
static constexpr const char kWifiPassword[] = "YOUR_WIFI_PASSWORD";
static constexpr const char kWebSocketHost[] = "YOUR_WEBSOCKET_HOST";
static constexpr int kWebSocketPort = 3000;
static constexpr const char kWebSocketPath[] = "/esp32-stream";
static constexpr unsigned long kWifiFrameIntervalMs = 60;
static constexpr unsigned long kWebSocketReconnectIntervalMs = 5000;

static constexpr const char kMqttBrokerHost[] = "broker.hivemq.com";
static constexpr uint16_t kMqttBrokerPort = 1883;
static constexpr const char kMqttUsername[] = "";
static constexpr const char kMqttPassword[] = "";
static constexpr const char kMqttDeviceId[] = "feeder-1";
static constexpr const char kMqttCommandTopic[] = "pakamew/demo/feeder-1/commands";
static constexpr const char kMqttStatusTopic[] = "pakamew/demo/feeder-1/status";
static constexpr const char kMqttEventsTopic[] = "pakamew/demo/feeder-1/events";
static constexpr uint16_t kMqttKeepAliveSeconds = 30;
static constexpr uint16_t kMqttSocketTimeoutSeconds = 3;
static constexpr unsigned long kMqttReconnectIntervalMs = 5000;

static constexpr unsigned long kLogSerialBaud = 115200;
static constexpr unsigned long kGizduinoSerialBaud = 115200;
static constexpr int kGizduinoSerialRxPin = -1;
static constexpr int kGizduinoSerialTxPin = 14;

static constexpr int kDefaultDispenseAngle = 180;
static constexpr unsigned long kDefaultOpenDurationMs = 1000;
static constexpr int kMinDispenseAngle = 1;
static constexpr int kMaxDispenseAngle = 360;
static constexpr unsigned long kMinOpenDurationMs = 200;
static constexpr unsigned long kMaxOpenDurationMs = 30000;
static constexpr unsigned long kAngleCommandBusyMs = 2200;
static constexpr unsigned long kCommandCompletionOverheadMs = 2500;
} // namespace esp32_cam_config
} // namespace shelter_device
} // namespace pakamew
