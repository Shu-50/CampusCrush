# Email Verification Setup Guide

## 📧 Email Configuration

Your Campus Crush app now has email verification and password reset functionality using Nodemailer!

### Step 1: Configure Gmail App Password

1. **Go to your Google Account**: https://myaccount.google.com/
2. **Enable 2-Step Verification** (if not already enabled)
3. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Campus Crush"
   - Click "Generate"
   - Copy the 16-character password

### Step 2: Update .env File

Open `backend/.env` and update these values:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
APP_URL=http://localhost:5001
```

**For production**, update `APP_URL` to your actual domain:
```env
APP_URL=https://your-domain.com
```

### Step 3: Restart Backend Server

```bash
cd backend
npm start
```

## 🎯 Features Implemented

### 1. Email Verification at Signup
- Users receive a verification email after registration
- Beautiful HTML email with app theme colors
- 24-hour expiration for verification links
- Users can resend verification email
- Verification page with app branding

### 2. Forgot Password
- Users can request password reset via email
- Secure reset token with 1-hour expiration
- Beautiful HTML email with reset link
- Web-based password reset form
- Password reset confirmation

### 3. Email Templates
- Gradient purple theme matching app design
- Responsive HTML emails
- Professional branding
- Clear call-to-action buttons

## 📱 User Flow

### Signup Flow:
1. User fills signup form with selfie and college ID
2. Account created (unverified)
3. Verification email sent automatically
4. User redirected to "Verify Email" screen
5. User can continue to app or verify email
6. User clicks link in email → Email verified ✅

### Forgot Password Flow:
1. User clicks "Forgot Password" on login screen
2. Enters email address
3. Receives password reset email
4. Clicks link in email
5. Opens web page to set new password
6. Password reset successful ✅
7. User can login with new password

## 🔧 Testing

### Test Email Verification:
1. Sign up with a new account
2. Check your email inbox (and spam folder)
3. Click the verification link
4. See success page

### Test Password Reset:
1. Go to login screen
2. Click "Forgot Password"
3. Enter your email
4. Check your email inbox
5. Click reset link
6. Enter new password
7. Login with new password

## 🚀 Alternative Email Services

If you don't want to use Gmail, you can use:

### SendGrid (Recommended for Production)
```javascript
// In backend/utils/emailService.js
const transporter = nodemailer.createTransporter({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
    }
});
```

### Mailgun
```javascript
const transporter = nodemailer.createTransporter({
    host: 'smtp.mailgun.org',
    port: 587,
    auth: {
        user: process.env.MAILGUN_USER,
        pass: process.env.MAILGUN_PASSWORD
    }
});
```

### AWS SES
```javascript
const transporter = nodemailer.createTransporter({
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    auth: {
        user: process.env.AWS_SES_USER,
        pass: process.env.AWS_SES_PASSWORD
    }
});
```

## 📝 Notes

- Email verification is **optional** - users can still use the app while unverified
- Verification tokens expire after 24 hours
- Password reset tokens expire after 1 hour
- All emails use your app's purple gradient theme
- Email templates are responsive and mobile-friendly

## 🎨 Customization

To customize email templates, edit:
- `backend/utils/emailService.js`

The templates use your app's theme colors:
- Primary: `#667eea`
- Secondary: `#764ba2`
- Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

## 🔒 Security

- Verification tokens are cryptographically secure (32 bytes)
- Reset tokens are cryptographically secure (32 bytes)
- Tokens are hashed before storage
- Expired tokens are automatically rejected
- Password reset doesn't reveal if email exists (security best practice)

## ✅ Done!

Your email system is now ready to use! 🎉
