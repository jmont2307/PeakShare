import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { AuthContext } from '../contexts/AuthContext';
import { theme } from '../theme';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import FeedScreen from '../screens/feed/FeedScreen';
import ExploreScreen from '../screens/explore/ExploreScreen';
import NewPostScreen from '../screens/post/NewPostScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import PostDetailScreen from '../screens/post/PostDetailScreen';
import PostInteractionsScreen from '../screens/post/PostInteractionsScreen';
import ResortDetailScreen from '../screens/explore/ResortDetailScreen';
import ResortListScreen from '../screens/explore/ResortListScreen';
import SimpleExploreScreen from '../screens/explore/SimpleExploreScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import FollowersScreen from '../screens/profile/FollowersScreen';
import FollowingScreen from '../screens/profile/FollowingScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';
import PostHistoryScreen from '../screens/profile/PostHistoryScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let IconComponent = Ionicons;

          if (route.name === 'Feed') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'NewPost') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
            size = size + 8; // Make the plus icon a bit larger
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <IconComponent name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mountain,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="NewPost" component={NewPostScreen} />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ 
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = focused ? 'notifications' : 'notifications-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } 
        }} 
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.colors.silver,
        },
        headerTintColor: theme.colors.midnight,
        headerBackTitle: null,
      }}
    >
      {user ? (
        <>
          <Stack.Screen 
            name="Main" 
            component={MainTabs} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PostDetail" 
            component={PostDetailScreen} 
            options={{ title: 'Post' }}
          />
          <Stack.Screen 
            name="ResortDetail" 
            component={ResortDetailScreen} 
            options={{ title: 'Resort' }}
          />
          <Stack.Screen 
            name="SimpleExplore" 
            component={SimpleExploreScreen} 
            options={{ title: 'Explore' }}
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen} 
            options={{ title: 'Edit Profile' }}
          />
          <Stack.Screen 
            name="Followers" 
            component={FollowersScreen} 
            options={{ title: 'Followers' }}
          />
          <Stack.Screen 
            name="Following" 
            component={FollowingScreen} 
            options={{ title: 'Following' }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{ title: 'Settings' }}
          />
          <Stack.Screen 
            name="ChangePassword" 
            component={ChangePasswordScreen} 
            options={{ title: 'Change Password' }}
          />
          <Stack.Screen 
            name="PostHistory" 
            component={PostHistoryScreen} 
            options={{ title: 'Post History' }}
          />
          <Stack.Screen 
            name="PostInteractions" 
            component={PostInteractionsScreen} 
            options={{ title: 'Post Interactions' }}
          />
          <Stack.Screen 
            name="ResortList" 
            component={ResortListScreen} 
            options={{ title: 'Ski Resorts' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ 
              title: 'Create Account',
              headerShadowVisible: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}