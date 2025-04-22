import * as Location from 'expo-location';
import { GOOGLE_MAPS_API_KEY } from '../env';


// Google Maps API endpoints
const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const PLACE_DETAILS_API_URL = 'https://maps.googleapis.com/maps/api/place/details/json';


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

// Get location details from coordinates using Google Maps Geocoding API
export const getLocationDetails = async (latitude, longitude) => {
  try {
    // Construct the API URL with the Google Maps API key
    const url = `${GEOCODING_API_URL}?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.warn(`Geocoding API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      // Return basic location info on error
      return {
        success: true,
        formattedAddress: `${latitude}, ${longitude}`,
        city: '',
        state: '',
        country: '',
        placeId: '',
      };
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
    // Return basic location info on error
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

// Search places with Google Places API
export const searchPlaces = async (query) => {
  try {
    // Construct the API URL with the Google Maps API key
    const url = `${PLACES_API_URL}?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.warn(`Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      // Return empty results on error
      return {
        success: true,
        places: [],
      };
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

// Get place details by placeId using Google Places API
export const getPlaceDetails = async (placeId) => {
  try {
    // Construct the API URL with the Google Maps API key
    const url = `${PLACE_DETAILS_API_URL}?place_id=${placeId}&fields=name,formatted_address,geometry&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.warn(`Place Details API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      return {
        success: false,
        error: `Failed to get place details: ${data.status}`,
      };
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