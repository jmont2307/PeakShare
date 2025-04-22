import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  ActivityIndicator,
  Text,
  Chip
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../redux/slices/userSlice';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const { userData, loading } = useSelector((state) => state.user);
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [preferredTerrain, setPreferredTerrain] = useState('');

  const terrainOptions = ['All', 'Groomed', 'Moguls', 'Powder', 'Park', 'Backcountry'];

  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || '');
      setUsername(userData.username || '');
      setBio(userData.bio || '');
      setLocation(userData.location || '');
      setProfileImageUrl(userData.profileImageUrl || '');
      setPreferredTerrain(userData.skiStats?.preferredTerrain || 'All');
    }
  }, [userData]);

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload images!'
        );
        return false;
      }
      return true;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0]);
    }
  };

  const uploadImage = async () => {
    if (!profileImage) return profileImageUrl;

    setUploadingImage(true);
    try {
      const response = await fetch(profileImage.uri);
      const blob = await response.blob();
      
      const storage = getStorage();
      const storageRef = ref(storage, `profile_images/${user.uid}`);
      
      const uploadTask = uploadBytesResumable(storageRef, blob);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // You can track progress here if needed
          },
          (error) => {
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Failed', 'Failed to upload profile image. Please try again.');
      return profileImageUrl;
    } finally {
      setUploadingImage(false);
    }
  };

  // Function to delete profile image from storage
  const deleteProfileImage = async () => {
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profile_images/${user.uid}`);
      await deleteObject(storageRef);
      console.log('Profile image deleted from storage');
    } catch (error) {
      // If file doesn't exist, that's okay - just continue
      if (error.code !== 'storage/object-not-found') {
        console.error('Error deleting profile image:', error);
      }
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    try {
      let imageUrl = profileImageUrl;
      
      // If there's a new profile image, upload it
      if (profileImage) {
        imageUrl = await uploadImage();
      }
      // If profileImageUrl is empty but the user previously had a profile picture, delete it
      else if (profileImageUrl === '' && userData?.profileImageUrl) {
        // User had a profile picture before but removed it
        imageUrl = '';
        await deleteProfileImage();
      }
      
      const updatedProfile = {
        displayName: displayName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        location: location.trim(),
        profileImageUrl: imageUrl,
        skiStats: {
          ...(userData?.skiStats || {}),
          preferredTerrain
        }
      };
      
      await dispatch(updateUserProfile({ userId: user.uid, userData: updatedProfile }));
      
      Alert.alert(
        'Success',
        'Profile updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Update Failed', 'Failed to update profile. Please try again.');
    }
  };

  const handleSelectTerrain = (terrain) => {
    setPreferredTerrain(terrain);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Edit Profile" />
        <Appbar.Action icon="check" onPress={handleSave} disabled={loading || uploadingImage} />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
            <Image
              source={
                profileImage 
                  ? { uri: profileImage.uri } 
                  : profileImageUrl 
                    ? { uri: profileImageUrl } 
                    : require('../../../assets/default-profile.png')
              }
              style={styles.profileImage}
              defaultSource={require('../../../assets/default-profile.png')}
            />
            <View style={styles.editIconContainer}>
              <MaterialCommunityIcons name="camera" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          
          {(profileImage || profileImageUrl) && (
            <TouchableOpacity 
              style={styles.removePhotoButton}
              onPress={() => {
                Alert.alert(
                  'Remove Profile Picture',
                  'Are you sure you want to remove your profile picture?',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel'
                    },
                    {
                      text: 'Remove',
                      style: 'destructive',
                      onPress: () => {
                        setProfileImage(null);
                        setProfileImageUrl('');
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.removePhotoText}>Remove Photo</Text>
            </TouchableOpacity>
          )}
          
          {uploadingImage && (
            <ActivityIndicator size="small" color="#0066CC" style={styles.uploadingIndicator} />
          )}
        </View>
        
        <View style={styles.formContainer}>
          <TextInput
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            style={styles.input}
            mode="outlined"
            autoCapitalize="words"
          />
          
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            mode="outlined"
            autoCapitalize="none"
            left={<TextInput.Affix text="@" />}
          />
          
          <TextInput
            label="Bio"
            value={bio}
            onChangeText={setBio}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.locationInputContainer}>
            <TextInput
              label="Location"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
              mode="outlined"
              right={
                <TextInput.Icon 
                  icon="map-marker" 
                  onPress={async () => {
                    try {
                      setUploadingImage(true); // Reuse loading indicator
                      const locationService = require('../../services/locationService');
                      const locationResult = await locationService.getCurrentLocation();
                      
                      if (locationResult.success) {
                        const details = await locationService.getLocationDetails(
                          locationResult.coords.latitude,
                          locationResult.coords.longitude
                        );
                        
                        if (details.success) {
                          setLocation(details.city && details.state 
                            ? `${details.city}, ${details.state}` 
                            : details.formattedAddress);
                        }
                      } else {
                        Alert.alert('Location Error', 'Unable to get your current location. Please check your location permissions.');
                      }
                    } catch (error) {
                      console.error('Error getting location:', error);
                      Alert.alert('Error', 'Failed to get location. Please try again or enter it manually.');
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                />
              }
            />
          </View>
          
          <Text style={styles.sectionTitle}>Skiing Preferences</Text>
          
          <Text style={styles.fieldLabel}>Preferred Terrain</Text>
          <View style={styles.chipsContainer}>
            {terrainOptions.map((terrain) => (
              <Chip
                key={terrain}
                selected={preferredTerrain === terrain}
                onPress={() => handleSelectTerrain(terrain)}
                style={styles.chip}
                selectedColor="#FFFFFF"
                textStyle={{ 
                  color: preferredTerrain === terrain ? '#FFFFFF' : '#333333' 
                }}
                mode={preferredTerrain === terrain ? 'flat' : 'outlined'}
              >
                {terrain}
              </Chip>
            ))}
          </View>
          
          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading || uploadingImage}
            disabled={loading || uploadingImage}
            style={styles.saveButton}
          >
            Save Changes
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#0066CC',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  uploadingIndicator: {
    marginTop: 8,
  },
  removePhotoButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  removePhotoText: {
    color: '#FF3B30',
    fontWeight: '500',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  input: {
    marginBottom: 16,
  },
  locationInputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  chip: {
    margin: 4,
    backgroundColor: props => props.selected ? '#0066CC' : 'transparent',
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});

export default EditProfileScreen;