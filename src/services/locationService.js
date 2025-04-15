import * as Location from 'expo-location';
import { Platform } from 'react-native';

const MAPS_API_KEY = '5ffb2c7c75fa48f49adbae0040482c77'; 
const MAPS_apiURL = 'https://ipgeolocation.abstractapi.com/v1/?api_key=${MAPS_API_KEY}';
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
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Geocoding failed: ${data.status}`);
    }
    
    // Extract relevant address components
    const addressComponents = data.results[0]?.address_components || [];
    
    let city = '';
    let state = '';
    let country = '';
    let formattedAddress = data.results[0]?.formatted_address || '';
    
    addressComponents.forEach(component => {
      if (component.types.includes('locality')) {
        city = component.long_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (component.types.includes('country')) {
        country = component.long_name;
      }
    });
    
    return {
      success: true,
      placeId: data.results[0]?.place_id || '',
      formattedAddress,
      city,
      state,
      country,
      fullAddress: formattedAddress,
    };
  } catch (error) {
    console.error('Error getting location details:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Search places with Google Places API
export const searchPlaces = async (query) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Place search failed: ${data.status}`);
    }
    
    return {
      success: true,
      places: data.results.map(place => ({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        coords: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
      })),
    };
  } catch (error) {
    console.error('Error searching places:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get place details by placeId
export const getPlaceDetails = async (placeId) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Place details failed: ${data.status}`);
    }
    
    const { result } = data;
    
    return {
      success: true,
      details: {
        placeId,
        name: result.name,
        address: result.formatted_address,
        coords: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
      },
    };
  } catch (error) {
    console.error('Error getting place details:', error);
    return {
      success: false,
      error: error.message,
    };
  }
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