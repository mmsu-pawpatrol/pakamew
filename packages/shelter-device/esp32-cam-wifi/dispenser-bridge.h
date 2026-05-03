#pragma once

#include "../esp32-cam/config.h"

namespace pakamew {
namespace shelter_device {
namespace esp32_cam_wifi_dispenser_bridge {

inline int clampAngle(int angle) {
  if (angle < esp32_cam_config::kMinDispenseAngle) {
    return esp32_cam_config::kMinDispenseAngle;
  }

  if (angle > esp32_cam_config::kMaxDispenseAngle) {
    return esp32_cam_config::kMaxDispenseAngle;
  }

  return angle;
}

inline unsigned long clampOpenDurationMs(unsigned long durationMs) {
  if (durationMs < esp32_cam_config::kMinOpenDurationMs) {
    return esp32_cam_config::kMinOpenDurationMs;
  }

  if (durationMs > esp32_cam_config::kMaxOpenDurationMs) {
    return esp32_cam_config::kMaxOpenDurationMs;
  }

  return durationMs;
}

inline void sendAngleToGizduino(HardwareSerial &gizduinoSerial, int angle) {
  gizduinoSerial.print("A");
  gizduinoSerial.println(angle);
}

inline void sendOpenDurationToGizduino(HardwareSerial &gizduinoSerial, unsigned long openDurationMs) {
  gizduinoSerial.print("T");
  gizduinoSerial.println(openDurationMs);
}

} // namespace esp32_cam_wifi_dispenser_bridge
} // namespace shelter_device
} // namespace pakamew
