# Campus Crush Backend - Fast Authentication

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start server
npm run dev
# OR
node server.js
```

## 📡 API Endpoints

### Register
```
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@university.edu", 
  "password": "password123"
}
```

### Login
```
POST /api/auth/login
{
  "email": "john@university.edu",
  "password": "password123"
}
```

### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

## 🗄️ Database

- **MongoDB**: `mongodb://127.0.0.1:27017/campus_crush`
- **Collection**: `users`
- **Auto-indexes**: Email for fast queries

## ⚡ Performance Optimizations

- Minimal dependencies
- Optimized MongoDB queries
- Fast bcrypt salt rounds (10)
- Simple validation
- No unnecessary middleware

---

**Server runs on port 5001**