# 🚀 Campus Crush - Quick Startup Guide

## **Current Status**: ✅ Ready to Test!

### **Step 1: Start Backend** 
```bash
cd Date/backend
node server-simple.js
```
**Expected Output:**
```
🚀 Campus Crush API server running on port 5000
📱 Environment: development
🌐 Server accessible at: http://localhost:5000 and http://0.0.0.0:5000
✅ Ready for React Native connections!
```

### **Step 2: Start Frontend**
```bash
cd Date
npm start
```

### **Step 3: Test the App**

1. **Open the app** in Expo Go or simulator
2. **Navigate to Auth screen** 
3. **Try to register** with:
   - Name: `Test User`
   - Email: `test@university.edu` (must end with .edu)
   - Password: `Test123456`
4. **Try to login** with the same credentials

## **🔧 What I Fixed**

### **Network Connection Issues:**
- ✅ **API URL Configuration**: Updated for React Native compatibility
  - Android Emulator: `http://10.0.2.2:5000/api`
  - iOS/Physical Device: `http://10.156.157.133:5000/api`
- ✅ **CORS Configuration**: Added proper origins for React Native
- ✅ **Simple Backend**: Created `server-simple.js` without database dependency
- ✅ **Mock Authentication**: Working login/register without MongoDB

### **Backend Features Working:**
- ✅ Health check endpoint: `/api/health`
- ✅ Test endpoint: `/api/test`
- ✅ Mock register: `/api/auth/register`
- ✅ Mock login: `/api/auth/login`
- ✅ CORS enabled for React Native
- ✅ Error handling and validation

### **Frontend Features Working:**
- ✅ API service with proper error handling
- ✅ Authentication context
- ✅ Login/Register screens
- ✅ Platform-specific API URLs
- ✅ Better error messages

## **🧪 Testing Steps**

### **Test 1: Backend Health Check**
Open browser: `http://localhost:5000/api/health`
Should show: `{"status":"OK","message":"Campus Crush API is running"}`

### **Test 2: Registration Flow**
1. Open app → Auth screen
2. Click "Sign Up"
3. Fill form with `.edu` email
4. Should show success message

### **Test 3: Login Flow**
1. Click "Login"
2. Use same credentials
3. Should navigate to main app

## **📱 Current App Flow**
```
Splash → Onboarding → Auth → Login/Register → Profile Setup → Main Tabs
```

## **🔍 Debugging**

### **If "Network request failed":**
1. Check backend is running: `http://localhost:5000/api/health`
2. Check React Native logs for API URL
3. Try different device/emulator

### **If Backend won't start:**
1. Kill existing processes: `taskkill /F /IM node.exe`
2. Use simple server: `node server-simple.js`
3. Check port 5000 is free

### **If Registration fails:**
1. Check email ends with `.edu`
2. Check password is 6+ characters
3. Check backend logs for errors

## **🎯 Next Steps After Testing**

1. **✅ Verify login/register works**
2. **🔄 Set up real MongoDB** (when ready)
3. **🔄 Add photo upload** (Cloudinary working)
4. **🔄 Implement real chat** (Socket.IO ready)
5. **🔄 Add push notifications**

## **📞 Quick Commands**

**Start Backend:**
```bash
cd Date/backend && node server-simple.js
```

**Start Frontend:**
```bash
cd Date && npm start
```

**Kill All Node Processes:**
```bash
taskkill /F /IM node.exe
```

**Test API:**
```bash
curl http://localhost:5000/api/health
```

---

**🎉 The app should now work! Try registering and logging in.**