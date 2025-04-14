# PeakShare

PeakShare is a mobile application for skiers and snowboarders to share their mountain experiences. Think of it as Instagram and Twitter specifically designed for winter sports enthusiasts.

## Features

- User authentication with email/password using Firebase
- Social features including posts, likes, comments, and follows
- Image uploads with multiple images per post
- Instagram-style stories
- Mountain resort exploration and information
- User profiles with skiing statistics
- Real-time notifications
- Responsive UI designed for mobile devices

## Tech Stack

- **React Native**: Mobile app framework
- **Expo**: Development platform for React Native
- **Firebase**:
  - Authentication for user management
  - Firestore for database storage
  - Firebase Storage for image uploads
- **Redux Toolkit**: State management
- **React Navigation**: Navigation between screens

## Getting Started

### Prerequisites

- Node.js and npm installed
- Expo CLI installed globally: `npm install -g expo-cli`
- A Firebase account for the backend

### Setup

1. Clone the repository:
```
git clone https://github.com/yourusername/peakshare.git
cd peakshare
```

2. Install dependencies:
```
npm install
```

3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication with Email/Password
   - Create a Firestore database
   - Enable Storage

4. Configure Firebase:
   - Replace the Firebase configuration in `src/firebase.js` with your own configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

5. Start the development server:
```
npm start
```

6. Open the app using Expo:
   - Use the Expo Go app on your mobile device
   - Or use an iOS/Android simulator

## Firestore Database Structure

The application uses the following collections in Firestore:

- **users**: User profiles and information
- **posts**: User posts with images and captions
- **comments**: Comments on posts
- **follows**: Follow relationships between users
- **likes**: Post likes
- **resorts**: Ski resort information
- **notifications**: User notifications
- **stories**: User stories (temporary content)

## Folder Structure

```
peakshare/
├── App.js                # Main app component
├── assets/               # Static assets like images
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── feed/         # Feed-related components
│   │   └── ...
│   ├── contexts/         # React Context providers
│   ├── navigation/       # Navigation configuration
│   ├── redux/            # Redux state management
│   │   ├── slices/       # Redux Toolkit slices
│   │   └── store.js      # Redux store configuration
│   ├── screens/          # App screens
│   │   ├── auth/         # Authentication screens
│   │   ├── feed/         # Feed screens
│   │   ├── explore/      # Explore screens
│   │   ├── post/         # Post-related screens
│   │   └── profile/      # Profile screens
│   ├── services/         # API and service functions
│   ├── firebase.js       # Firebase configuration
│   └── theme.js          # App theme and styling
└── package.json          # Project dependencies
```

## License

This project is licensed under the MIT License.

## Acknowledgments

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Firebase](https://firebase.google.com/)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)