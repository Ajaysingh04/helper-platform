# Helper Crew / Worker App (Field Technician Platform)

Standalone Android mobile app for field technicians, mechanics, and electricians to execute doorstep orders, navigate with Google Maps, verify customer start OTPs, and track daily earnings.

## Key Features

1. **Duty Toggle (On Duty / Off Duty):**
   - Active status sync with Indore Multi-Specialist Hub.
   - Pulsing emerald glow indicator.

2. **Ringing Bell Audio & Vibration Alert:**
   - Real-time sound notification chime when a task is dispatched by the hub manager.
   - Silence button and auto-stop on task acceptance.

3. **Active Job Execution Stages:**
   - **Assigned:** Task details, scope checklist, and customer contact.
   - **On the Way:** Direct Google Maps turn-by-turn route navigation.
   - **Reached Doorstep:** Customer arrival notification.
   - **Customer Start OTP Verification:** 4-digit security code match before beginning work.
   - **Live Service Stopwatch:** Real-time on-site timer.
   - **Photo Proof Upload:** Work inspection photo attachment.
   - **Complete & Collect Payment:** Instant UPI QR Code generator.

4. **Safety & Toolkit Inspection:**
   - Daily checklist for safety gear, voltage clamp, pressure pumps, and uniform.

5. **Digital Crew ID Card:**
   - Official credentials with scannable QR verification for customers.

## Android App ID
- **Package Name:** `com.helper.worker`
- **Launcher Name:** `Helper Crew`
- **Build Mode:** `npx react-native run-android --mode=workerDebug`
