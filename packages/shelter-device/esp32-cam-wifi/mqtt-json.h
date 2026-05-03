#pragma once

namespace pakamew {
namespace shelter_device {
namespace esp32_cam_wifi_mqtt_json {

inline String jsonStringField(const String &payload, const char *key) {
  String token = "\"" + String(key) + "\"";
  int keyPos = payload.indexOf(token);
  if (keyPos < 0) return "";

  int colonPos = payload.indexOf(':', keyPos + token.length());
  if (colonPos < 0) return "";

  int firstQuote = payload.indexOf('"', colonPos + 1);
  if (firstQuote < 0) return "";

  int secondQuote = payload.indexOf('"', firstQuote + 1);
  if (secondQuote < 0) return "";

  return payload.substring(firstQuote + 1, secondQuote);
}

inline long jsonLongField(const String &payload, const char *key, long fallback) {
  String token = "\"" + String(key) + "\"";
  int keyPos = payload.indexOf(token);
  if (keyPos < 0) return fallback;

  int colonPos = payload.indexOf(':', keyPos + token.length());
  if (colonPos < 0) return fallback;

  int valueStart = colonPos + 1;
  while (valueStart < (int)payload.length() && (payload[valueStart] == ' ' || payload[valueStart] == '"')) {
    valueStart++;
  }

  int valueEnd = valueStart;
  while (valueEnd < (int)payload.length() && (payload[valueEnd] == '-' || isDigit(payload[valueEnd]))) {
    valueEnd++;
  }

  if (valueEnd <= valueStart) return fallback;
  return payload.substring(valueStart, valueEnd).toInt();
}

} // namespace esp32_cam_wifi_mqtt_json
} // namespace shelter_device
} // namespace pakamew
