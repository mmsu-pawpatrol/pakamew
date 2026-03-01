# Technology Stack

This document expands the technologies used in Pakamew.

## Backend

### Runtime

- **[Node.js](https://nodejs.org/)** - JavaScript runtime used to execute backend services and workspace scripts. In Pakamew, the server app and supporting tooling run on Node.

### API & Contracts

- **[Hono](https://hono.dev/)** - Lightweight, runtime-agnostic HTTP framework for building APIs. Pakamew uses Hono as the backend app and routing foundation for REST and RPC endpoints.
- **[oRPC](https://orpc.unnoq.com/)** - Type-safe RPC framework that can produce OpenAPI-compatible contracts. Pakamew uses it for strongly typed procedure handlers and client/server contract consistency.
- **[OpenAPI](https://www.openapis.org/)** - Standard specification format for HTTP API contracts. Pakamew exposes OpenAPI artifacts so API surfaces are inspectable and machine-readable.
- **[Scalar](https://scalar.com/)** - API reference UI for OpenAPI definitions. Pakamew uses Scalar to present interactive API documentation.

### Authentication

- **[Better Auth](https://www.better-auth.com/)** - Authentication framework for sessions and auth workflows. Pakamew uses it for session auth, anonymous access, admin capabilities, and API key flows.

### Database

- **[Prisma](https://www.prisma.io/)** - Type-safe ORM for relational databases. Pakamew uses Prisma for schema-managed models, typed data access, and generated client usage in the backend.
- **[PostgreSQL](https://www.postgresql.org/)** - Open-source relational database. Pakamew uses PostgreSQL as the system-of-record database for backend persistence.

### Observability

- **[OpenTelemetry](https://opentelemetry.io/)** - Vendor-neutral observability standard for traces, metrics, and logs. Pakamew instruments backend requests, RPC calls, and DB boundaries using OpenTelemetry.
- **[Pino](https://getpino.io/)** - High-performance structured logger for Node.js. Pakamew uses Pino for consistent JSON logs and operational debugging context.
- **[OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)** - Telemetry ingestion and processing pipeline. Pakamew routes application telemetry through the Collector before export/storage.
- **[Grafana](https://grafana.com/)** - Visualization and dashboard platform. Pakamew uses Grafana for local telemetry exploration and observability views.
- **[Loki](https://grafana.com/oss/loki/)** - Log aggregation and query backend. Pakamew stores and searches structured backend logs in Loki.
- **[Tempo](https://grafana.com/oss/tempo/)** - Distributed tracing backend. Pakamew stores and explores trace spans in Tempo.
- **[Prometheus](https://prometheus.io/)** - Metrics scraping and query system. Pakamew uses Prometheus for metric collection and querying.

### Livestream Node

- **[Express](https://expressjs.com/)** - Minimal web framework for Node.js services. Pakamew uses Express in `livestream-node` to host stream-related HTTP endpoints.
- **[ws](https://github.com/websockets/ws)** - WebSocket implementation for Node.js. Pakamew uses `ws` in `livestream-node` to stream camera frame data in real time.
- **[SerialPort](https://serialport.io/)** - Serial communication library for Node.js. Pakamew uses it in wired mode to read and process data from ESP32-connected devices.

## Shelter

### Hardware & Firmware

- **[ESP32](https://www.espressif.com/en/products/socs/esp32)** - Low-cost microcontroller family with wireless capabilities. Pakamew uses ESP32 boards for shelter-side camera and feeder control firmware.
- **[Arduino Core for ESP32](https://github.com/espressif/arduino-esp32)** - Arduino-compatible framework and board support for ESP32. Pakamew uses it to build and flash the shelter `.ino` programs.

### Capture & Streaming

- **[esp32-camera](https://github.com/espressif/esp32-camera)** - Camera driver stack for ESP32-CAM modules. Pakamew uses it to capture JPEG frames from shelter camera hardware.
- **[arduinoWebSockets](https://github.com/Links2004/arduinoWebSockets)** - WebSocket client/server library for Arduino environments. Pakamew uses it on-device to push captured frames to the livestream server.
- **[WiFi (Arduino ESP32)](https://github.com/espressif/arduino-esp32/tree/master/libraries/WiFi)** - ESP32 Wi-Fi networking library. Pakamew uses it in wireless shelter mode to connect devices to the streaming host.

### Device I/O

- **[Serial (Arduino)](https://docs.arduino.cc/language-reference/en/functions/communication/serial/)** - UART serial API for Arduino-based firmware. Pakamew uses serial I/O in wired mode for frame transfer and feeder-trigger commands.
