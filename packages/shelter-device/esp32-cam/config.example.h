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
} // namespace esp32_cam_config
} // namespace shelter_device
} // namespace pakamew
