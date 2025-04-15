import React, { useEffect, useContext, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Dimensions 
} from 'react-native';
import { 
  Appbar, 
  Button, 
  ActivityIndicator, 
  Divider, 
  Dialog, 
  Portal, 
  Paragraph 
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, updateUserProfile } from '../../redux/slices/userSlice';
import { fetchUserPosts } from '../../redux/slices/postsSlice';
import { AuthContext } from '../../contexts/AuthContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const POST_WIDTH = width / 3 - 4;

const ProfileStatItem = ({ value, label, onPress }) => (
  <TouchableOpacity style={styles.statItem} onPress={onPress}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

const PostThumbnail = ({ post, onPress }) => (
  <TouchableOpacity style={styles.postThumbnail} onPress={onPress}>
    <Image 
      source={{ uri: post.imageUrls[0] }} 
      style={styles.thumbnailImage} 
    />
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, userData: contextUserData, logout } = useContext(AuthContext);
  const { userData, profileData, loading } = useSelector((state) => state.user);
  const { userPosts, loading: postsLoading } = useSelector((state) => state.posts);
  
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  
  useEffect(() => {
    if (user) {
      dispatch(fetchUserProfile(user.uid));
      dispatch(fetchUserPosts(user.uid));
    }
  }, [dispatch, user]);
  
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };
  
  const handleSettings = () => {
    navigation.navigate('Settings');
  };
  
  const confirmLogout = () => {
    setLogoutDialogVisible(true);
  };
  
  const handleLogout = async () => {
    setLogoutDialogVisible(false);
    const result = await logout();
    if (!result.success) {
      // Handle logout error
      console.error('Logout failed:', result.error);
    }
  };
  
  if (loading && !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }
  
  // Use either contextUserData or Redux userData/profileData
  const displayUserData = userData || profileData || contextUserData;
  
  if (!displayUserData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load profile</Text>
        <Button mode="contained" onPress={() => dispatch(fetchUserProfile(user.uid))}>
          Retry
        </Button>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Profile" />
        <Appbar.Action icon="cog" onPress={handleSettings} />
        <Appbar.Action icon="logout" onPress={confirmLogout} />
      </Appbar.Header>
      
      <ScrollView>
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.profileImageContainer}
          >
            <Image 
              source={{ uri: displayUserData.profileImageUrl || 'https://via.placeholder.com/100' }} 
              style={styles.profileImage} 
            />
            <View style={styles.editImageOverlay}>
              <MaterialCommunityIcons name="camera" size={18} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileStats}>
            <ProfileStatItem 
              value={displayUserData.postCount || 0} 
              label="Posts" 
              onPress={() => {}}
            />
            <ProfileStatItem 
              value={displayUserData.followerCount || 0} 
              label="Followers" 
              onPress={() => navigation.navigate('Followers')}
            />
            <ProfileStatItem 
              value={displayUserData.followingCount || 0} 
              label="Following" 
              onPress={() => navigation.navigate('Following')}
            />
          </View>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.displayName}>{displayUserData.displayName}</Text>
          <Text style={styles.username}>@{displayUserData.username}</Text>
          
          {displayUserData.bio ? (
            <Text style={styles.bio}>{displayUserData.bio}</Text>
          ) : null}
          
          {displayUserData.location ? (
            <View style={styles.locationContainer}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
              <Text style={styles.location}>{displayUserData.location}</Text>
            </View>
          ) : null}
          
          <Button 
            mode="outlined" 
            onPress={handleEditProfile}
            style={styles.editButton}
          >
            Edit Profile
          </Button>
        </View>
        
        {displayUserData.skiStats && (
          <View style={styles.skiStatsContainer}>
            <Text style={styles.sectionTitle}>Ski Stats</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="map-marker-radius" size={24} color="#0066CC" />
                <Text style={styles.statBoxValue}>{displayUserData.skiStats.resortCount || 0}</Text>
                <Text style={styles.statBoxLabel}>Resorts Visited</Text>
              </View>
              
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="ski" size={24} color="#0066CC" />
                <Text style={styles.statBoxValue}>
                  {displayUserData.skiStats.totalDistance || 0}km
                </Text>
                <Text style={styles.statBoxLabel}>Total Distance</Text>
              </View>
              
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="mountain" size={24} color="#0066CC" />
                <Text style={styles.statBoxValue}>
                  {displayUserData.skiStats.preferredTerrain || 'All'}
                </Text>
                <Text style={styles.statBoxLabel}>Preferred Terrain</Text>
              </View>
            </View>
          </View>
        )}
        
        <Divider style={styles.divider} />
        
        <View style={styles.postsContainer}>
          <Text style={styles.sectionTitle}>Posts</Text>
          
          {postsLoading ? (
            <ActivityIndicator size="small" color="#0066CC" style={styles.postsLoading} />
          ) : userPosts.length > 0 ? (
            <FlatList
              data={userPosts}
              keyExtractor={(item) => item.id}
              numColumns={3}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <PostThumbnail 
                  post={item} 
                  onPress={() => navigation.navigate('PostDetail', { post: item })}
                />
              )}
            />
          ) : (
            <View style={styles.emptyPostsContainer}>
              <Text style={styles.emptyPostsText}>No posts yet</Text>
              <Button 
                mode="contained" 
                icon="plus" 
                onPress={() => navigation.navigate('NewPost')}
                style={styles.createPostButton}
              >
                Create First Post
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
      
      <Portal>
        <Dialog visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)}>
          <Dialog.Title>Log Out</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to log out?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleLogout}>Log Out</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  editImageOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#0066CC',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  profileInfo: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  displayName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  editButton: {
    borderColor: '#0066CC',
  },
  skiStatsContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    elevation: 1,
  },
  statBoxValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statBoxLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    marginTop: 16,
  },
  postsContainer: {
    padding: 16,
  },
  postsLoading: {
    marginVertical: 20,
  },
  postThumbnail: {
    width: POST_WIDTH,
    height: POST_WIDTH,
    margin: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  emptyPostsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyPostsText: {
    marginBottom: 16,
    fontSize: 16,
    color: '#666',
  },
  createPostButton: {
    marginTop: 8,
  },
});

export default ProfileScreen;