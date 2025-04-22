import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Image, TextInput, ScrollView, Text, Alert, Platform } from 'react-native';
import { Appbar, Button, ProgressBar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
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
import LocationPicker from '../../components/LocationPicker';
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

  const handleLocationSelected = (newLocation) => {
    setLocation(newLocation);
    
    if (newLocation && newLocation.coordinates) {
      fetchWeatherForLocation(newLocation.coordinates.latitude, newLocation.coordinates.longitude)
        .then(weatherData => {
          setWeather(weatherData);
        })
        .catch(error => {
          console.error('Error fetching weather:', error);
        });
    } else {
      setWeather(null);
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const selectFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'Media library permission is required to select photos');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  const uploadPost = async () => {
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
      let imageUrl = null;
      
      // Only upload an image if one is selected
      if (image) {
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
        imageUrl = await getDownloadURL(storageRef);
      }
      
      setUploadProgress(1.0);
      
      // Extract hashtags from caption
      const hashtagRegex = /#[a-zA-Z0-9_]+/g;
      const hashtags = caption.match(hashtagRegex) || [];
      
      // Create post in Firestore
      const postData = {
        userId: user.uid,
        username: userData.username,
        userProfileImageUrl: userData.profileImageUrl,
        imageUrls: imageUrl ? [imageUrl] : [],
        hasImage: !!imageUrl,
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
            <LocationPicker 
              onLocationSelected={handleLocationSelected}
              initialLocation={location}
              title="Location"
              placeholder="Search for a ski resort or location"
            />
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
          disabled={!caption || !location || uploading}
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