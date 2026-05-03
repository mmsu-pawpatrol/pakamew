#pragma once

namespace pakamew {
namespace shelter_device {
namespace esp32_cam_pinmap {

static constexpr int kCamPinPwdn = -1;
static constexpr int kCamPinReset = -1;
static constexpr int kCamPinXclk = 15;
static constexpr int kCamPinSiod = 4;
static constexpr int kCamPinSioc = 5;
static constexpr int kCamPinY9 = 16;
static constexpr int kCamPinY8 = 17;
static constexpr int kCamPinY7 = 18;
static constexpr int kCamPinY6 = 12;
static constexpr int kCamPinY5 = 10;
static constexpr int kCamPinY4 = 8;
static constexpr int kCamPinY3 = 9;
static constexpr int kCamPinY2 = 11;
static constexpr int kCamPinVsync = 6;
static constexpr int kCamPinHref = 7;
static constexpr int kCamPinPclk = 13;
static constexpr int kCameraXclkFrequencyHz = 10000000;
static constexpr int kCameraVerticalFlip = 0;
static constexpr int kCameraHorizontalMirror = 0;

} // namespace esp32_cam_pinmap
} // namespace shelter_device
} // namespace pakamew
