import * as Location from 'expo-location';
import { MAPS_API_KEY } from '@env';

// Get current location permissions
export const requestLocationPermissions = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

// Get current location
export const getCurrentLocation = async () => {
  try {
    const hasPermission = await requestLocationPermissions();
    
    if (!hasPermission) {
      return {
        success: false,
        error: 'Location permission not granted',
      };
    }
    
    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    return {
      success: true,
      coords: {
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get location details from coordinates
export const getLocationDetails = async (latitude, longitude) => {
  try {
    // Use the Abstract API for geolocation
    const MAPS_apiURL = `https://ipgeolocation.abstractapi.com/v1/?api_key=${MAPS_API_KEY}`;
    const response = await fetch(MAPS_apiURL);
    const data = await response.json();
    
    if (data) {
      return {
        success: true,
        placeId: data.ip_address || '',
        formattedAddress: `${data.city}, ${data.region}, ${data.country}`,
        city: data.city || '',
        state: data.region || '',
        country: data.country || '',
        fullAddress: `${data.city}, ${data.region}, ${data.country}`,
      };
    }
    
    // If the API fails, return basic location info
    return {
      success: true,
      formattedAddress: `${latitude}, ${longitude}`,
      city: '',
      state: '',
      country: '',
      placeId: '',
    };
    
  } catch (error) {
    console.error('Error getting location details:', error);
    // Even on error, return basic coordinates as a fallback
    return {
      success: true,
      formattedAddress: `${latitude}, ${longitude}`,
      city: '',
      state: '',
      country: '',
      placeId: '',
    };
  }
};

// Search places
export const searchPlaces = async (query) => {
  // Return mock data
  return {
    success: true,
    places: [
      {
        placeId: 'mock-place-1',
        name: `${query} - Location 1`,
        address: 'Mock address 1',
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      },
      {
        placeId: 'mock-place-2',
        name: `${query} - Location 2`,
        address: 'Mock address 2',
        coords: {
          latitude: 34.0522,
          longitude: -118.2437,
        },
      },
    ],
  };
};

// Get place details - simplified version
export const getPlaceDetails = async (placeId) => {
  // Return mock data
  return {
    success: true,
    details: {
      placeId,
      name: 'Location Detail',
      address: '123 Mock Street, Anytown',
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
    },
  };
};

// Get distance between two coordinates in km
export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

// Convert degrees to radians
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

export default {
  requestLocationPermissions,
  getCurrentLocation,
  getLocationDetails,
  searchPlaces,
  getPlaceDetails,
  getDistance,
};