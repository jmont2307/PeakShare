# PeakShare - Skiing Social Media App

A social media application for skiers and snowboarders to share their mountain adventures, connect with other winter sports enthusiasts, and discover new ski resorts.

## Features

- **Social Feed**: View posts from followed users with photos from ski resorts
- **User Profiles**: Personalized profiles with skiing statistics and post history
- **Post Creation**: Share photos with captions, location tags, and weather information
- **Resort Explorer**: Discover ski resorts and see recent posts from each location
- **Notifications**: Get notified when others like, comment, or follow you
- **Authentication**: Secure login and registration with Firebase Auth
- **Real-time Updates**: Live notifications and feed updates

## Technologies Used

### Frontend
- React Native / Expo
- Redux Toolkit for state management
- React Navigation
- React Native Paper UI components

### Backend
- Firebase Authentication
- Firebase Firestore (NoSQL database)
- Firebase Cloud Storage (for images)
- Firebase Cloud Functions (serverless backend)

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Expo CLI
- Firebase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/peakshare.git
   cd peakshare
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a Firebase project and configure:
   - Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication, Firestore, and Storage
   - Update the Firebase configuration in `src/firebase.js`

4. Start the development server:
   ```
   npm start
   ```

5. Run on a simulator or device:
   ```
   npm run android
   # or
   npm run ios
   ```

## Project Structure

```
peakshare/
├── App.js                    # Main app entry point
├── functions/                # Firebase Cloud Functions
│   ├── controllers/          # API controllers
│   └── index.js              # Cloud Functions setup
├── src/
│   ├── components/           # Reusable UI components
│   ├── contexts/             # React Context providers
│   ├── navigation/           # Navigation configuration
│   ├── redux/                # Redux store and slices
│   │   ├── slices/           # Redux Toolkit slices
│   │   └── store.js          # Redux store configuration
│   ├── screens/              # App screens
│   ├── services/             # API and third-party services
│   ├── firebase.js           # Firebase configuration
│   └── theme.js              # App theme and styling
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/) (simulated in this demo)
- Location services powered by Google Maps API
- Ski resort data from [Skimap.org](https://skimap.org/) (simulated in this demo)