# PeakShare

PeakShare is a web and mobile application for skiers and snowboarders to share their mountain experiences. Think of it as Instagram and Twitter specifically designed for winter sports enthusiasts.

## Features

- User authentication with email/password using Firebase
- Social features including posts, likes, comments, and follows
- Image uploads with multiple images per post
- Instagram-style stories
- Mountain resort exploration with real-time weather data
- User profiles with skiing statistics
- Real-time notifications
- Responsive UI designed for both web and mobile devices
- Database seeding for ski resorts worldwide

## Tech Stack

- **React Native / React Native Web**: Cross-platform app framework
- **Expo**: Development platform for React Native
- **Firebase**:
  - Authentication for user management
  - Firestore for database storage
  - Firebase Storage for image uploads
  - Firebase Emulators for local development
- **Redux Toolkit**: State management
- **React Navigation**: Navigation between screens
- **Weather API**: Real-time weather data for ski resorts

## Getting Started

### Prerequisites

- Node.js (v14 or newer) and npm installed
- A Firebase account for production deployment

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/peakshare.git
cd peakshare
```

2. Install dependencies:
```bash
npm install
```

### Running in Development Mode

#### 1. Start the Firebase emulators

This will run local versions of Firebase services (Auth, Firestore, Storage):

```bash
npm run firebase:emulators
```

You can view the Firebase emulator UI at http://localhost:4000

#### 2. Start the development server

In a new terminal window, run:

```bash
npm run dev
```

This will open the application in your browser at http://localhost:3000

### Running in Production Mode

1. Configure Firebase:
   - Replace the Firebase configuration in `src/firebase.js` with your own configuration if needed:

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

2. Update Firebase security rules:
   - Edit `firestore.rules` and `storage.rules` to use the production rules
   - Deploy the rules with `npm run firebase:deploy`

3. Build and start the application:
```bash
npm run build
npm start
```

### Running on Mobile

For mobile development:

```bash
npm install -g expo-cli
expo start
```

Use the Expo Go app on your mobile device or an iOS/Android simulator

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