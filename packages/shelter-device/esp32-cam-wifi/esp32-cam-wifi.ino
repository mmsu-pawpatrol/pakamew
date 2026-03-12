#include "esp_camera.h"
#include <WiFi.h>
#include <WebSocketsClient.h>

// this part to disable brownout detector to prevent ESP32-CAM from restarting during high power draw (WiFi + Camera)
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"


const char* ssid     = "PLDTHOMEFIBRNKkSG";
const char* password = "PLDTWIFIMEzTW"; 

//type ip address
const char* websocket_host = "192.168.1.74"; 

// mUST be 443 for secure cloud connections (https). If going back to Local PC, use 3000.
const int websocket_port = 3000; 

// The endpoint we defined in our Node.js server
const char* websocket_path = "/esp32-stream"; 


#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

WebSocketsClient webSocket;
bool isConnected = false;
unsigned long lastFrameTime = 0;

// WEBSOCKET EVENT HANDLER

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("[WS] Disconnected from Cloud Server!");
      isConnected = false;
      break;
    case WStype_CONNECTED:
      Serial.printf("[WS] Connected to url: %s\n", payload);
      isConnected = true;
      break;
    case WStype_TEXT:
    case WStype_BIN:
    case WStype_ERROR:      
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
      break; // We only send data, we don't need to handle incoming data here
  }
}

// ==========================================
// SETUP
// ==========================================
void setup() {
  // Disable brownout detector
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); 
  
  Serial.begin(2000000);
  Serial.println();

  // ======================================================
  // 1. CONNECT TO WIFI FIRST (Prevents FB-OVF errors)
  // ======================================================
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi connected successfully!");
  Serial.print("ESP32-CAM IP address: ");
  Serial.println(WiFi.localIP());

  // ======================================================
  // 2. INITIALIZE CAMERA SECOND
  // ======================================================
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // Frame size & quality config
  // Smaller frames = higher FPS and less lag over the internet.
  if(psramFound()){
    config.frame_size = FRAMESIZE_QVGA;
    config.jpeg_quality = 5; // 0-63 lower number means higher quality
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_QVGA;
    config.jpeg_quality = 5;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
  Serial.println("Camera initialized successfully.");

  // ======================================================
  // 3. CONNECT TO WEBSOCKET CLOUD SERVER
  // ======================================================
  
  // USE THIS for Secure Cloud connections (Cloudflare, Render, etc.)
  webSocket.begin(websocket_host, websocket_port, websocket_path);

  // If you ever want to go back to local testing on your laptop, comment out the line above
  // and uncomment the line below (and change port back to 3000 at the top of the file):
  // webSocket.begin(websocket_host, websocket_port, websocket_path);

  webSocket.onEvent(webSocketEvent);
  
  // Reconnect automatically if connection to the Node.js server is lost
  webSocket.setReconnectInterval(5000); 

  sensor_t * s = esp_camera_sensor_get();
  s->set_vflip(s, 1);
  s->set_hmirror(s, 0);

  
}
    
// ==========================================
// MAIN LOOP
// ==========================================
void loop() {
  webSocket.loop();

  // If connected to the Node.js server, grab a frame and send it!
  if (isConnected) {
    // Limit to roughly ~15-16 frames per second
    if (millis() - lastFrameTime > 60) {
      
      camera_fb_t * fb = esp_camera_fb_get();
      if (!fb) {
        Serial.println("Camera capture failed");
        return;
      }

      // Send the JPEG image as a binary payload over WebSocket
      webSocket.sendBIN(fb->buf, fb->len);

      // CRITICAL: Return the frame buffer to prevent memory leaks!
      esp_camera_fb_return(fb);

      lastFrameTime = millis();
    }
  }
}