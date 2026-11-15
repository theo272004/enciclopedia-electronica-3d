/*
 * ============================================================================
 * Control de Carga DC y PWM con Transistor NPN 2N2222A (TO-92) / MMBT2222A (SOT-23)
 * Plataformas: Arduino UNO/Nano (5V) | ESP32 / STM32 / RP2040 (3.3V)
 * ============================================================================
 *
 * REGLA DE INGENIERIA (Datasheet 2N2222A):
 * 1. Para operar como INTERRUPTOR FRIO (Saturacion, V_CE(sat) <= 0.3 V),
 *    el datasheet exige forzar una relacion: I_B >= I_C / 10 (Beta forzado = 10).
 * 2. Si queremos conmutar una carga de I_C = 150 mA desde un GPIO de 3.3V (ESP32):
 *    - I_B(sat) requerida = 150 mA / 10 = 15 mA
 *    - Caida Base-Emisor en saturacion: V_BE(sat) ≈ 0.7 V
 *    - R_B = (V_GPIO - V_BE) / I_B = (3.3 V - 0.7 V) / 0.015 A = 173 Ohm -> Usar 180 Ohm o 220 Ohm.
 *    - Para un LED de 20 mA: I_B >= 2 mA -> Con R_B = 1 kOhm tenemos I_B = (3.3 - 0.7)/1k = 2.6 mA (Saturacion garantizada).
 * 3. IMPORTANTE: Si la carga es inductiva (rele, motor, solenoide), coloca SIEMPRE
 *    un diodo flyback (1N4007 o 1N5819) en antiparalelo con la carga para evitar que
 *    el pico inductivo supere V_CEO(max) = 40 V y destruya el colector.
 */

const int PIN_BASE_Q1 = 9; // Pin con soporte PWM

void setup() {
  pinMode(PIN_BASE_Q1, OUTPUT);
  digitalWrite(PIN_BASE_Q1, LOW); // Transistor en CORTE (I_B = 0, I_C = 0)
}

void loop() {
  // 1. Modo Conmutacion Pura: Corte -> Saturacion
  digitalWrite(PIN_BASE_Q1, HIGH); // Saturacion: V_CE(sat) ≈ 0.2 - 0.3 V
  delay(1500);

  digitalWrite(PIN_BASE_Q1, LOW);  // Corte: Interruptor abierto
  delay(1000);

  // 2. Control de Potencia eficiente por PWM (alterna solo entre Corte y Saturacion
  //    para no recalentar el 2N2222A en la Region Activa, respetando P_D < 625 mW)
  for (int duty = 0; duty <= 255; duty += 5) {
    analogWrite(PIN_BASE_Q1, duty);
    delay(25);
  }
  for (int duty = 255; duty >= 0; duty -= 5) {
    analogWrite(PIN_BASE_Q1, duty);
    delay(25);
  }
}
