# 🔧 Network Connection Fix

## **Current Status**: Backend is running ✅, Frontend can't connect ❌

### **Backend Status**: ✅ WORKING
- Running on: `http://localhost:5001`
- Health check: ✅ `{"status":"OK","message":"Campus Crush API is running"}`
- Endpoints working: `/api/health`, `/api/auth/*`, `/api/users/*`

### **Issue**: React Native can't connect to backend

## **🚀 IMMEDIATE FIX - Try These Steps:**

### **Step 1: Find Your Computer's IP Address**
```bash
# Windows
ipconfig | findstr IPv4

# Mac/Linux  
ifconfig | grep inet
```

### **Step 2: Update API URL in React Native**
Open `campusCrush/services/api.js` and replace the IP address:

```javascript
const API_URLS = __DEV__ ? [
    Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api',
    'http://127.0.0.1:5001/api',
    'http://YOUR_ACTUAL_IP:5001/api', // <-- Replace with your IP
    'http://192.168.1.100:5001/api',
] : ['https://your-production-api.com/api'];
```

### **Step 3: Test Connection**
1. Open the app
2. Go to Login screen  
3. Click "Test API Connection" button
4. Check console logs

## **🔍 Alternative Solutions:**

### **Option A: Use Expo Tunnel**
```bash
cd Date
npx expo start --tunnel
```
This creates a public URL that works from any device.

### **Option B: Use ngrok (Recommended)**
1. Install ngrok: https://ngrok.com/
2. Run: `ngrok http 5001`
3. Copy the https URL (e.g., `https://abc123.ngrok.io`)
4. Update API_BASE_URL to: `https://abc123.ngrok.io/api`

### **Option C: Use Your Phone's Hotspot**
1. Connect your computer to your phone's hotspot
2. Find the new IP address
3. Update the API URL with the new IP

## **🧪 Debug Steps:**

### **1. Check React Native Logs**
Look for these messages:
- `🔗 API Service initialized with URL: http://...`
- `📱 Platform: ios/android`
- `🧪 Testing connection with multiple URLs...`

### **2. Test Each URL Manually**
Try these URLs in your browser:
- `http://localhost:5001/api/health`
- `http://127.0.0.1:5001/api/health`  
- `http://YOUR_IP:5001/api/health`

### **3. Check Firewall**
Make sure Windows Firewall allows Node.js connections on port 5001.

## **📱 Expected Behavior After Fix:**

1. **Debug Connection Test**: Should show "✅ Connection successful!"
2. **Login/Register**: Should work without "Network request failed"
3. **Console Logs**: Should show successful API calls

## **🎯 Quick Test Commands:**

**Test backend from command line:**
```bash
curl http://localhost:5001/api/health
```

**Test registration:**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@uni.edu","password":"Test123"}'
```

---

**The backend is working perfectly. The issue is just the network connection between React Native and the backend. Try the IP address fix first!**