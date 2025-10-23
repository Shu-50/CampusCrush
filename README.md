# Campus Crush - College Dating App

A React Native dating app built with Expo, designed exclusively for college students to connect, share anonymous confessions, and find meaningful relationships within their campus community.

## Features

### 🔐 Authentication & Authorization
- College email verification
- Secure login/signup flow
- Password reset functionality
- Profile setup with interests and preferences

### 💬 Confession Feed
- Anonymous confession posting
- Category-based filtering (love, breakup, secret, funny, crush)
- Upvoting and emoji reactions (❤️😂🔥😢)
- Comment system with replies
- Trending confessions

### 💝 Swipe Suggestions
- Tinder-style swipe interface
- Profile cards with photos, bio, and interests
- Super like feature (limited daily)
- Match notifications
- Filter by year, branch, or interests

### 💬 Real-Time Chat
- One-to-one messaging after matching
- Online status indicators
- Typing indicators
- Read receipts
- Message search functionality

### 👤 Profile Management
- Photo gallery management
- Bio and interests editing
- Privacy settings
- Dark/Light mode toggle
- Premium features (boost profile, see likes)

### 🔔 Notifications & Activity
- Push notifications for matches and messages
- Activity feed with categorized notifications
- Unread message indicators

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **UI Components**: React Native built-in components
- **Icons**: Expo Vector Icons
- **State Management**: React Hooks
- **Styling**: StyleSheet API
- **Theme**: Light/Dark mode support

## Color Scheme

### Light Mode
- Primary: #7B2CBF (Purple)
- Secondary: #9D4EDD
- Accent: #C77DFF
- Background: #FFFFFF

### Dark Mode
- Primary: #3C096C (Deep Purple)
- Secondary: #5A189A
- Accent: #7B2CBF
- Background: #151718

## Installation & Setup

1. **Prerequisites**
   ```bash
   npm install -g expo-cli
   # or
   npm install -g @expo/cli
   ```

2. **Install Dependencies**
   ```bash
   cd campusCrush
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on Device/Emulator**
   - iOS: `npm run ios` or scan QR code with Camera app
   - Android: `npm run android` or scan QR code with Expo Go app
   - Web: `npm run web`

## Project Structure

```
campusCrush/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based screens
│   │   ├── confessions.jsx
│   │   ├── suggestions.jsx
│   │   ├── chat.jsx
│   │   ├── notifications.jsx
│   │   └── profile.jsx
│   ├── auth/              # Authentication screens
│   │   ├── login.jsx
│   │   ├── signup.jsx
│   │   └── forgot-password.jsx
│   ├── post/              # Post detail screens
│   │   └── [id].jsx
│   ├── _layout.jsx        # Root layout
│   ├── index.jsx          # Splash screen
│   ├── onboarding.jsx     # Onboarding flow
│   └── profile-setup.jsx  # Profile setup
├── components/            # Reusable components
│   └── SwipeCard.jsx
├── constants/             # App constants
│   └── Colors.js
└── assets/               # Images and fonts
```

## Key Screens

1. **Splash Screen** - App loading with animated logo
2. **Onboarding** - 3-step introduction to app features
3. **Authentication** - Login, signup, and password reset
4. **Profile Setup** - Complete profile with interests and preferences
5. **Confessions Feed** - Anonymous posts with reactions and comments
6. **Swipe Suggestions** - Tinder-style profile discovery
7. **Chat Screen** - List of matches and conversations
8. **Notifications** - Activity feed with match and message alerts
9. **Profile** - User profile management and settings
10. **Post Detail** - Twitter-like detailed view of confessions

## Features Implementation

### Swipe Functionality
- Pan gesture responder for card swiping
- Animated card movements and rotations
- Like/Pass/Super Like actions
- Match detection and notifications

### Anonymous Confessions
- Category-based posting system
- Emoji reaction system
- Nested comment threads
- Upvoting mechanism

### Real-time Features
- Online status indicators
- Typing indicators
- Message read receipts
- Push notifications (ready for backend integration)

### Theme System
- Automatic dark/light mode detection
- Manual theme switching
- Consistent color scheme across all screens

## Development Notes

- All screens are built in JSX (not TypeScript)
- Uses Expo Router for navigation
- Responsive design for mobile devices
- Mock data for development and testing
- Ready for backend API integration

## Next Steps for Production

1. **Backend Integration**
   - User authentication API
   - Real-time messaging (Socket.io)
   - Image upload and storage
   - Push notification service

2. **Additional Features**
   - Voice messages
   - Video calls
   - Location-based matching
   - Premium subscription system

3. **Security & Privacy**
   - End-to-end encryption for messages
   - Content moderation system
   - Report and block functionality
   - Data privacy compliance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Please ensure compliance with your institution's policies before deployment.