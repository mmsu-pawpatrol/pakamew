#include "config.h"
#include "pinmap.h"

namespace arduino_dispenser_config = pakamew::shelter_device::arduino_uno_dispenser_config;
namespace arduino_dispenser_pinmap = pakamew::shelter_device::arduino_uno_dispenser_pinmap;

namespace {

constexpr uint8_t kHalfStepSequence[8][4] = {
	{1, 0, 0, 0},
	{1, 1, 0, 0},
	{0, 1, 0, 0},
	{0, 1, 1, 0},
	{0, 0, 1, 0},
	{0, 0, 1, 1},
	{0, 0, 0, 1},
	{1, 0, 0, 1},
};

char commandBuffer[arduino_dispenser_config::kCommandBufferSize] = {};
int commandLength = 0;
int currentSequenceIndex = 0;

int clampAngle(int angle) {
	if (angle < arduino_dispenser_config::kMinDispenseAngle) {
		return arduino_dispenser_config::kMinDispenseAngle;
	}

	if (angle > arduino_dispenser_config::kMaxDispenseAngle) {
		return arduino_dispenser_config::kMaxDispenseAngle;
	}

	return angle;
}

unsigned long clampOpenDurationMs(unsigned long durationMs) {
	if (durationMs < arduino_dispenser_config::kMinOpenDurationMs) {
		return arduino_dispenser_config::kMinOpenDurationMs;
	}

	if (durationMs > arduino_dispenser_config::kMaxOpenDurationMs) {
		return arduino_dispenser_config::kMaxOpenDurationMs;
	}

	return durationMs;
}

long angleToSteps(int angle) {
	const double ratio = static_cast<double>(clampAngle(angle)) /
		static_cast<double>(arduino_dispenser_config::kMaxDispenseAngle);

	return lround(ratio * static_cast<double>(arduino_dispenser_config::kStepsPerRevolution));
}

void applyStep(int sequenceIndex) {
	digitalWrite(arduino_dispenser_pinmap::kMotorIn1Pin, kHalfStepSequence[sequenceIndex][0]);
	digitalWrite(arduino_dispenser_pinmap::kMotorIn2Pin, kHalfStepSequence[sequenceIndex][1]);
	digitalWrite(arduino_dispenser_pinmap::kMotorIn3Pin, kHalfStepSequence[sequenceIndex][2]);
	digitalWrite(arduino_dispenser_pinmap::kMotorIn4Pin, kHalfStepSequence[sequenceIndex][3]);
}

void releaseCoils() {
	digitalWrite(arduino_dispenser_pinmap::kMotorIn1Pin, LOW);
	digitalWrite(arduino_dispenser_pinmap::kMotorIn2Pin, LOW);
	digitalWrite(arduino_dispenser_pinmap::kMotorIn3Pin, LOW);
	digitalWrite(arduino_dispenser_pinmap::kMotorIn4Pin, LOW);
}

void stepMotor(long steps, int direction) {
	for (long step = 0; step < steps; ++step) {
		currentSequenceIndex = (currentSequenceIndex + direction + 8) % 8;
		applyStep(currentSequenceIndex);
		delay(arduino_dispenser_config::kStepDelayMs);
	}
}

void runSpinAndReturnCycle(long forwardSteps, unsigned long holdMs) {
	if (forwardSteps <= 0) {
		releaseCoils();
		return;
	}

	stepMotor(forwardSteps, 1);
	delay(holdMs);
	stepMotor(forwardSteps, -1);
	releaseCoils();
}

void runAngleCycle(int angle) {
	const int safeAngle = clampAngle(angle);
	const long forwardSteps = angleToSteps(safeAngle);

	Serial.print("Executing A");
	Serial.println(safeAngle);

	runSpinAndReturnCycle(
		forwardSteps,
		arduino_dispenser_config::kAngleCommandHoldMs
	);

	Serial.print("OK A");
	Serial.println(safeAngle);
}

void runTimedCycle(unsigned long openDurationMs) {
	const unsigned long safeOpenDurationMs = clampOpenDurationMs(openDurationMs);
	const long forwardSteps = angleToSteps(arduino_dispenser_config::kDefaultDispenseAngle);

	Serial.print("Executing T");
	Serial.println(safeOpenDurationMs);

	runSpinAndReturnCycle(forwardSteps, safeOpenDurationMs);

	Serial.print("OK T");
	Serial.println(safeOpenDurationMs);
}

void handleCommand(const String &command) {
	if (command.length() == 0) {
		return;
	}

	const char mode = command.charAt(0);
	if (mode == 'A') {
		const int angle = command.substring(1).toInt();
		runAngleCycle(angle == 0 ? arduino_dispenser_config::kDefaultDispenseAngle : angle);
		return;
	}

	if (mode == 'T') {
		const unsigned long durationMs = static_cast<unsigned long>(command.substring(1).toInt());
		runTimedCycle(durationMs == 0 ? arduino_dispenser_config::kDefaultOpenDurationMs : durationMs);
		return;
	}

	Serial.print("ERR Unsupported command: ");
	Serial.println(command);
}

void readSerialCommands() {
	while (Serial.available() > 0) {
		const char nextChar = static_cast<char>(Serial.read());

		if (nextChar == '\n' || nextChar == '\r') {
			if (commandLength == 0) {
				continue;
			}

			commandBuffer[commandLength] = '\0';
			handleCommand(String(commandBuffer));
			commandLength = 0;
			continue;
		}

		if (commandLength >= arduino_dispenser_config::kCommandBufferSize - 1) {
			commandLength = 0;
			Serial.println("ERR Command too long");
			continue;
		}

		commandBuffer[commandLength++] = nextChar;
	}
}

} // namespace

void setup() {
	pinMode(arduino_dispenser_pinmap::kMotorIn1Pin, OUTPUT);
	pinMode(arduino_dispenser_pinmap::kMotorIn2Pin, OUTPUT);
	pinMode(arduino_dispenser_pinmap::kMotorIn3Pin, OUTPUT);
	pinMode(arduino_dispenser_pinmap::kMotorIn4Pin, OUTPUT);
	releaseCoils();

	Serial.begin(arduino_dispenser_config::kSerialBaud);
	delay(arduino_dispenser_config::kSerialBootDelayMs);

	Serial.println("Pakamew GizDuino dispenser ready");
	Serial.println("Commands: A<angle> or T<duration_ms>");
}

void loop() {
	readSerialCommands();
}
