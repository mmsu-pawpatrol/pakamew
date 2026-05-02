#pragma once

namespace pakamew {
namespace shelter_device {
namespace arduino_uno_dispenser_config {

static constexpr unsigned long kSerialBaud = 115200;
static constexpr unsigned long kSerialBootDelayMs = 500;

static constexpr int kDefaultDispenseAngle = 180;
static constexpr int kMinDispenseAngle = 1;
static constexpr int kMaxDispenseAngle = 360;

static constexpr unsigned long kDefaultOpenDurationMs = 1000;
static constexpr unsigned long kMinOpenDurationMs = 200;
static constexpr unsigned long kMaxOpenDurationMs = 30000;

static constexpr long kStepsPerRevolution = 4096;
static constexpr unsigned long kStepDelayMs = 2;
static constexpr unsigned long kAngleCommandHoldMs = 250;
static constexpr int kCommandBufferSize = 32;

} // namespace arduino_uno_dispenser_config
} // namespace shelter_device
} // namespace pakamew
