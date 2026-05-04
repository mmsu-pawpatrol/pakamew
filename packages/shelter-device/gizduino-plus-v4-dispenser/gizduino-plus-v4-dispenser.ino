#include "config.h"
#include "pinmap.h"

namespace gizduino_dispenser_config = pakamew::shelter_device::gizduino_plus_v4_dispenser_config;
namespace gizduino_dispenser_pinmap = pakamew::shelter_device::gizduino_plus_v4_dispenser_pinmap;

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

char commandBuffer[gizduino_dispenser_config::kCommandBufferSize] = {};
int commandLength = 0;
int currentSequenceIndex = 0;

int clampAngle(int angle) {
	if (angle < gizduino_dispenser_config::kMinDispenseAngle) {
		return gizduino_dispenser_config::kMinDispenseAngle;
	}

	if (angle > gizduino_dispenser_config::kMaxDispenseAngle) {
		return gizduino_dispenser_config::kMaxDispenseAngle;
	}

	return angle;
}

unsigned long clampOpenDurationMs(unsigned long durationMs) {
	if (durationMs < gizduino_dispenser_config::kMinOpenDurationMs) {
		return gizduino_dispenser_config::kMinOpenDurationMs;
	}

	if (durationMs > gizduino_dispenser_config::kMaxOpenDurationMs) {
		return gizduino_dispenser_config::kMaxOpenDurationMs;
	}

	return durationMs;
}

long angleToSteps(int angle) {
	const long safeAngle = static_cast<long>(clampAngle(angle));
	return (safeAngle * gizduino_dispenser_config::kStepsPerRevolution + 180L) / 360L;
}

void applyStep(int sequenceIndex) {
	digitalWrite(gizduino_dispenser_pinmap::kMotorIn1Pin, kHalfStepSequence[sequenceIndex][0]);
	digitalWrite(gizduino_dispenser_pinmap::kMotorIn2Pin, kHalfStepSequence[sequenceIndex][1]);
	digitalWrite(gizduino_dispenser_pinmap::kMotorIn3Pin, kHalfStepSequence[sequenceIndex][2]);
	digitalWrite(gizduino_dispenser_pinmap::kMotorIn4Pin, kHalfStepSequence[sequenceIndex][3]);
}

void releaseCoils() {
	digitalWrite(gizduino_dispenser_pinmap::kMotorIn1Pin, LOW);
	digitalWrite(gizduino_dispenser_pinmap::kMotorIn2Pin, LOW);
	digitalWrite(gizduino_dispenser_pinmap::kMotorIn3Pin, LOW);
	digitalWrite(gizduino_dispenser_pinmap::kMotorIn4Pin, LOW);
}

void stepMotor(bool clockwise) {
	if (clockwise) {
		currentSequenceIndex = (currentSequenceIndex + 1) & 0x07;
	} else {
		currentSequenceIndex = (currentSequenceIndex + 7) & 0x07;
	}

	applyStep(currentSequenceIndex);
}

void rotateSteps(long steps, bool clockwise, bool releaseAfterMove) {
	for (long step = 0; step < steps; ++step) {
		stepMotor(clockwise);
		delay(gizduino_dispenser_config::kStepDelayMs);
	}

	if (releaseAfterMove) {
		releaseCoils();
	}
}

void runDispenseCycle(int angle) {
	const int safeAngle = clampAngle(angle);
	const long stepCount = angleToSteps(safeAngle);

	Serial.print("DISPENSE angle=");
	Serial.print(safeAngle);
	Serial.print(" steps=");
	Serial.println(stepCount);

	rotateSteps(stepCount, true, false);
	delay(gizduino_dispenser_config::kAngleCommandReturnDelayMs);
	rotateSteps(stepCount, false, true);
}

void runTimedGateCycle(unsigned long openDurationMs) {
	const unsigned long safeOpenDurationMs = clampOpenDurationMs(openDurationMs);
	const long openStepCount = angleToSteps(gizduino_dispenser_config::kDefaultGateOpenAngle);

	Serial.print("GATE durationMs=");
	Serial.print(safeOpenDurationMs);
	Serial.print(" openAngle=");
	Serial.println(gizduino_dispenser_config::kDefaultGateOpenAngle);

	rotateSteps(openStepCount, true, false);
	delay(safeOpenDurationMs);
	rotateSteps(openStepCount, false, true);
}

void handleCommand(const char *command) {
	if (command[0] == '\0') {
		return;
	}

	char commandType = command[0];
	long parsedValue = 0;

	if (commandType == 'A' || commandType == 'a' || commandType == 'T' || commandType == 't') {
		parsedValue = atol(command + 1);
	} else {
		commandType = 'A';
		parsedValue = atol(command);
	}

	if (commandType == 'A' || commandType == 'a') {
		const int angle = parsedValue > 0 ? static_cast<int>(parsedValue) : gizduino_dispenser_config::kDefaultDispenseAngle;
		runDispenseCycle(angle);
		return;
	}

	if (commandType == 'T' || commandType == 't') {
		const unsigned long openDurationMs = parsedValue > 0
			? static_cast<unsigned long>(parsedValue)
			: gizduino_dispenser_config::kDefaultOpenDurationMs;
		runTimedGateCycle(openDurationMs);
		return;
	}

	Serial.print("IGNORED unknown command: ");
	Serial.println(command);
}

void processIncomingByte(char nextChar) {
	if (nextChar == '\r') {
		return;
	}

	if (nextChar == '\n') {
		commandBuffer[commandLength] = '\0';
		handleCommand(commandBuffer);
		commandLength = 0;
		return;
	}

	if (commandLength >= gizduino_dispenser_config::kCommandBufferSize - 1) {
		commandLength = 0;
		Serial.println("IGNORED oversized command");
		return;
	}

	commandBuffer[commandLength++] = nextChar;
}

void readSerialCommands() {
	while (Serial.available() > 0) {
		processIncomingByte(static_cast<char>(Serial.read()));
	}
}

} // namespace

void setup() {
	pinMode(gizduino_dispenser_pinmap::kMotorIn1Pin, OUTPUT);
	pinMode(gizduino_dispenser_pinmap::kMotorIn2Pin, OUTPUT);
	pinMode(gizduino_dispenser_pinmap::kMotorIn3Pin, OUTPUT);
	pinMode(gizduino_dispenser_pinmap::kMotorIn4Pin, OUTPUT);
	releaseCoils();

	Serial.begin(gizduino_dispenser_config::kSerialBaud);
	delay(gizduino_dispenser_config::kSerialBootDelayMs);

	Serial.println("Pakamew Gizduino Plus V4 dispenser ready");
	Serial.println("Commands: A<angle> or T<duration_ms>");
}

void loop() {
	readSerialCommands();
}
