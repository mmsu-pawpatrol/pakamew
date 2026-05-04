#pragma once

#include "../esp32-cam/config.h"

namespace pakamew {
namespace shelter_device {
namespace esp32_cam_wifi_mqtt_bridge_state {

struct MqttBridgeState {
  bool isCommandInFlight = false;
  unsigned long busyUntilMs = 0;
  unsigned long lastMqttReconnectAttemptMs = 0;
  String activeRequestId = "";
  String activeCommandMode = "";
  int activeAngle = 0;
  unsigned long activeOpenDurationMs = 0;
};

inline String buildStatePayload(
  const char *state,
  bool busy,
  const String &requestId,
  const char *mode,
  int angle,
  unsigned long openDurationMs,
  const char *message
) {
  String payload = "{\"deviceId\":\"" + String(esp32_cam_config::kMqttDeviceId) + "\"";
  payload += ",\"state\":\"" + String(state) + "\"";
  payload += ",\"busy\":" + String(busy ? "true" : "false");
  payload += ",\"timestamp\":" + String(millis());

  if (requestId.length() > 0) {
    payload += ",\"requestId\":\"" + requestId + "\"";
  }

  if (mode != nullptr && mode[0] != '\0') {
    payload += ",\"mode\":\"" + String(mode) + "\"";
  }

  if (angle > 0) {
    payload += ",\"angle\":" + String(angle);
  }

  if (openDurationMs > 0) {
    payload += ",\"openDurationMs\":" + String(openDurationMs);
  }

  if (message != nullptr && message[0] != '\0') {
    payload += ",\"message\":\"" + String(message) + "\"";
  }

  payload += "}";
  return payload;
}

inline String buildOfflinePayload() {
  return String("{\"deviceId\":\"") + esp32_cam_config::kMqttDeviceId +
    "\",\"state\":\"offline\",\"busy\":false,\"timestamp\":0}";
}

inline void clearBusyState(MqttBridgeState &bridgeState) {
  bridgeState.isCommandInFlight = false;
  bridgeState.activeRequestId = "";
  bridgeState.activeCommandMode = "";
  bridgeState.activeAngle = 0;
  bridgeState.activeOpenDurationMs = 0;
  bridgeState.busyUntilMs = 0;
}

inline void armBusyState(
  MqttBridgeState &bridgeState,
  const String &requestId,
  const char *mode,
  int angle,
  unsigned long openDurationMs
) {
  bridgeState.isCommandInFlight = true;
  bridgeState.activeRequestId = requestId;
  bridgeState.activeCommandMode = mode;
  bridgeState.activeAngle = angle;
  bridgeState.activeOpenDurationMs = openDurationMs;

  const unsigned long busyWindowMs = bridgeState.activeCommandMode == "duration"
    ? openDurationMs + esp32_cam_config::kCommandCompletionOverheadMs
    : esp32_cam_config::kAngleCommandBusyMs;
  bridgeState.busyUntilMs = millis() + busyWindowMs;
}

} // namespace esp32_cam_wifi_mqtt_bridge_state
} // namespace shelter_device
} // namespace pakamew
