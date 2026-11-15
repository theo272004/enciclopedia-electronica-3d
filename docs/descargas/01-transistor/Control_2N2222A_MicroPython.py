# ============================================================================
# Control de Transistor NPN 2N2222A por PWM en MicroPython (ESP32 / Raspberry Pi Pico)
# ============================================================================
from machine import Pin, PWM
import time

# Frecuencia de 20 kHz (fuera del rango audible para evitar zumbido en bobinas/motores)
pwm_base = PWM(Pin(15), freq=20000, duty_u16=0)

print("Iniciando control en Saturacion / Corte por PWM (2N2222A)...")

while True:
    # Rampa de encendido suave (0% a 100% de ciclo util)
    for pulso in range(0, 65536, 1024):
        pwm_base.duty_u16(pulso)
        time.sleep_ms(15)
    time.sleep_ms(500)

    # Apagado en Corte (duty = 0 -> I_B = 0 mA)
    pwm_base.duty_u16(0)
    time.sleep_ms(800)
