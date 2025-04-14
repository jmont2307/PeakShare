import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Image, TextInput, ScrollView, TouchableOpacity, Text, Alert, Platform } from 'react-native';
import { Appbar, Button, ProgressBar } from 'react-native-paper';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import { db, storage } from '../../firebase';
import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';
import { AuthContext } from '../../contexts/AuthContext';
import { fetchWeatherForLocation } from '../../services/weatherService';

const NewPostScreen = ({ navigation }) => {
  const { user, userData } = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (location) {
      fetchWeatherForLocation(location.coordinates.latitude, location.coordinates.longitude)
        .then(weatherData => {
          setWeather(weatherData);
        })
        .catch(error => {
          console.error('Error fetching weather:', error);
        });
    }
  }, [location]);

  const checkLocationPermission = async () => {
    const platform = Platform.OS;
    const permission = platform === 'ios' 
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const result = await check(permission);
    
    if (result === RESULTS.GRANTED) {
      return true;
    }
    
    const requestResult = await request(permission);
    return requestResult === RESULTS.GRANTED;
  };

  const getCurrentLocation = async () => {
    const hasPermission = await checkLocationPermission();
    
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Please enable location permissions in settings');
      return;
    }
    
    Geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Get place info from coordinates using Google Places API
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=AIzaSyBPeakShareGoogleMapsKeyPlaceholder`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const addressComponents = data.results[0].address_components;
            let locationName = '';
            
            // Try to find the nearest ski resort or just use the locality
            for (const component of addressComponents) {
              if (component.types.includes('establishment') || component.types.includes('locality')) {
                locationName = component.long_name;
                break;
              }
            }
            
            setLocation({
              name: locationName || 'Current Location',
              coordinates: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            });
          }
        } catch (error) {
          console.error('Error getting location name:', error);
        }
      },
      (error) => {
        console.error('Error getting current location:', error);
        Alert.alert('Error', 'Unable to get current location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const takePhoto = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };
    
    try {
      const result = await launchCamera(options);
      
      if (result.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const selectFromGallery = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };
    
    try {
      const result = await launchImageLibrary(options);
      
      if (result.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error selecting from gallery:', error);
    }
  };

  const uploadPost = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image');
      return;
    }
    
    if (!caption) {
      Alert.alert('Error', 'Please add a caption');
      return;
    }
    
    if (!location) {
      Alert.alert('Error', 'Please add a location');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload image to Firebase Storage
      const imageUri = image.uri;
      const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
      const storageRef = ref(storage, `posts/${user.uid}/${filename}`);
      
      // Convert URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Upload to Firebase Storage with progress monitoring
      const uploadTask = uploadBytes(storageRef, blob);
      
      // Monitor upload progress
      // Note: Web SDK doesn't support upload progress monitoring as cleanly as native SDK,
      // but we'll set 50% progress immediately and 100% when done
      setUploadProgress(0.5);
      
      await uploadTask;
      
      // Get download URL
      const imageUrl = await getDownloadURL(storageRef);
      setUploadProgress(1.0);
      
      // Extract hashtags from caption
      const hashtagRegex = /#[a-zA-Z0-9_]+/g;
      const hashtags = caption.match(hashtagRegex) || [];
      
      // Create post in Firestore
      const postData = {
        userId: user.uid,
        username: userData.username,
        userProfileImageUrl: userData.profileImageUrl,
        imageUrls: [imageUrl],
        caption,
        location,
        tags: hashtags.map(tag => tag.substring(1).toLowerCase()),
        likeCount: 0,
        commentCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        weather
      };
      
      const postsRef = collection(db, 'posts');
      const postRef = await addDoc(postsRef, postData);
      
      // Update user's post count
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        postCount: increment(1)
      });
      
      // Reset form and navigate back to Feed
      setImage(null);
      setCaption('');
      setLocation(null);
      setUploading(false);
      
      navigation.navigate('Feed');
    } catch (error) {
      console.error('Error uploading post:', error);
      Alert.alert('Error', 'Failed to upload post');
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="New Post" />
      </Appbar.Header>
      
      <ScrollView>
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Button icon="camera" mode="contained" onPress={takePhoto}>
                Take Photo
              </Button>
              <Button 
                icon="image" 
                mode="outlined" 
                onPress={selectFromGallery} 
                style={styles.galleryButton}
              >
                From Gallery
              </Button>
            </View>
          )}
        </View>
        
        <View style={styles.formContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption... Add hashtags like #skiing"
            multiline
            value={caption}
            onChangeText={setCaption}
          />
          
          <View style={styles.locationContainer}>
            <Text style={styles.sectionTitle}>Location</Text>
            
            {location ? (
              <View style={styles.selectedLocation}>
                <Text style={styles.locationName}>{location.name}</Text>
                <TouchableOpacity onPress={() => setLocation(null)}>
                  <Text style={styles.changeButton}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Button 
                  icon="map-marker" 
                  mode="outlined" 
                  onPress={getCurrentLocation}
                  style={styles.locationButton}
                >
                  Use Current Location
                </Button>
                
                <Text style={styles.orText}>- OR -</Text>
                
                <GooglePlacesAutocomplete
                  placeholder="Search for a ski resort or location"
                  fetchDetails={true}
                  onPress={(data, details = null) => {
                    setLocation({
                      name: data.description,
                      coordinates: {
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng
                      },
                      placeId: data.place_id
                    });
                  }}
                  query={{
                    key: 'AIzaSyBPeakShareGoogleMapsKeyPlaceholder',
                    language: 'en',
                    types: 'establishment'
                  }}
                  styles={{
                    textInputContainer: styles.searchInputContainer,
                    textInput: styles.searchInput,
                    listView: styles.searchResultsList
                  }}
                />
              </View>
            )}
          </View>
          
          {weather && (
            <View style={styles.weatherContainer}>
              <Text style={styles.sectionTitle}>Current Weather at Location</Text>
              <View style={styles.weatherInfo}>
                <Text style={styles.temperature}>{Math.round(weather.temperature)}°C</Text>
                <Text style={styles.conditions}>{weather.conditions}</Text>
                {weather.snowfall > 0 && (
                  <Text style={styles.snowfall}>Recent snowfall: {weather.snowfall}cm</Text>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      
      {uploading && (
        <View style={styles.uploadingContainer}>
          <Text style={styles.uploadingText}>Uploading post...</Text>
          <ProgressBar progress={uploadProgress} color="#0066CC" style={styles.progressBar} />
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={uploadPost}
          disabled={!image || !caption || !location || uploading}
          loading={uploading}
          style={styles.postButton}
        >
          Share
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButton: {
    marginTop: 16,
  },
  formContainer: {
    padding: 16,
  },
  captionInput: {
    minHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    textAlignVertical: 'top',
  },
  locationContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectedLocation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  locationName: {
    fontSize: 16,
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
  },
  weatherContainer: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  temperature: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  conditions: {
    fontSize: 16,
    marginRight: 8,
  },
  snowfall: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  uploadingContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  uploadingText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  postButton: {
    paddingVertical: 6,
  },
});

export default NewPostScreen;