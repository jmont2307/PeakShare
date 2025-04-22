import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import locationService from '../services/locationService';

import { GOOGLE_MAPS_API_KEY } from '@env';

const LocationPicker = ({ 
  onLocationSelected, 
  initialLocation = null,
  title = 'Location',
  placeholder = 'Search for a location'
}) => {
  const [location, setLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(false);

  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        Alert.alert('Permission denied', 'Please enable location permissions in settings');
        setLoading(false);
        return;
      }
      
      const locationResult = await locationService.getCurrentLocation();
      
      if (!locationResult.success) {
        Alert.alert('Error', 'Unable to get current location');
        setLoading(false);
        return;
      }
      
      const details = await locationService.getLocationDetails(
        locationResult.coords.latitude,
        locationResult.coords.longitude
      );
      
      if (!details.success) {
        Alert.alert('Error', 'Unable to get location details');
        setLoading(false);
        return;
      }
      
      const newLocation = {
        name: details.city && details.state 
          ? `${details.city}, ${details.state}` 
          : details.formattedAddress,
        coordinates: locationResult.coords,
        placeId: details.placeId
      };
      
      setLocation(newLocation);
      onLocationSelected(newLocation);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {location ? (
        <View style={styles.selectedLocation}>
          <View style={styles.locationInfo}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#0066CC" />
            <Text style={styles.locationName}>{location.name}</Text>
          </View>
          <TouchableOpacity onPress={() => {
            setLocation(null);
            onLocationSelected(null);
          }}>
            <Text style={styles.changeButton}>Change</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Button 
            icon="map-marker-radius" 
            mode="outlined" 
            onPress={getCurrentLocation}
            loading={loading}
            disabled={loading}
            style={styles.locationButton}
          >
            Use Current Location
          </Button>
          
          <Text style={styles.orText}>- OR -</Text>
          
          <GooglePlacesAutocomplete
            placeholder={placeholder}
            fetchDetails={true}
            onPress={(data, details = null) => {
              const newLocation = {
                name: data.description,
                coordinates: {
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng
                },
                placeId: data.place_id
              };
              setLocation(newLocation);
              onLocationSelected(newLocation);
            }}
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: 'en',
            }}
            styles={{
              textInputContainer: styles.searchInputContainer,
              textInput: styles.searchInput,
              listView: styles.searchResultsList,
              separator: styles.separator,
              description: styles.resultDescription
            }}
            enablePoweredByContainer={false}
            debounce={300}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectedLocation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationName: {
    fontSize: 16,
    marginLeft: 8,
  },
  changeButton: {
    color: '#0066CC',
    fontWeight: '500',
  },
  locationButton: {
    marginBottom: 16,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 8,
    color: '#8e8e8e',
  },
  searchInputContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  searchInput: {
    height: 46,
    color: '#5d5d5d',
    fontSize: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  searchResultsList: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  resultDescription: {
    fontSize: 14,
  }
});

export default LocationPicker;