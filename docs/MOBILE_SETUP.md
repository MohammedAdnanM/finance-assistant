# Mobile App API Setup Guide

This guide explains how to connect the **Finance Assistant Mobile App** (Expo Go) to your local **Flask Backend**.

## Prerequisites
- Your Computer and Mobile Phone must be on the **same Wi-Fi network**.
- The Backend server must be running.

---

## 1. Configure the Backend
The backend must be configured to listen on all network interfaces (not just localhost).

1. Open `Backend/app.py`.
2. Ensure the last lines look like this:
   ```python
   if __name__ == "__main__":
       app.run(debug=True, host='0.0.0.0')
   ```
3. Restart the backend: `python app.py`.

---

## 2. Find your Computer's LAN IP
Your phone needs to know your computer's address on the local network.

1. Open **Command Prompt** (cmd) on your computer.
2. Type `ipconfig` and press Enter.
3. Look for **IPv4 Address** under your active connection (Wi-Fi or Ethernet).
   - Example: `192.168.0.100`

---

## 3. Configure the Mobile App
1. Open `frontend/finance-app-mobile/services/api.ts`.
2. Find the `LAN_IP` constant at the top.
3. Update it with the IP you found in the previous step:
   ```typescript
   const LAN_IP = '192.168.0.100'; // Replace with YOUR IP
   ```

---

## 4. Troubleshooting "Network Request Failed"
If you still can't connect, check these common issues:

### A. Windows Firewall
Windows often blocks incoming connections to Python.
1. Open **Windows Defender Firewall** settings.
2. Click **"Allow an app or feature through Windows Defender Firewall"**.
3. Find **python.exe** and ensure both **Private** and **Public** are checked.
4. Alternatively, temporarily disable the firewall for testing.

### B. Network Profile
Ensure your Wi-Fi network on your computer is set to **"Private"** instead of "Public". Windows blocks most local connections on Public networks.

### C. Cleartext Traffic (Android)
Android blocks `http://` (non-secure) connections by default. I have already enabled this in `app.json`:
```json
"android": {
  "usesCleartextTraffic": true
}
```

---

## 5. Running the App
1. Start the Expo server: `npm start` (in the mobile folder).
2. Scan the QR code using the **Expo Go** app on your Android/iOS device.
3. Login using your credentials.
