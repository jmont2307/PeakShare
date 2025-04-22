import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, storage } from '../../firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  serverTimestamp,
  limit 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        return rejectWithValue('User not found');
      }
      
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const { id, displayName, username, bio, location, profileImage } = userData;
      
      const updateData = {};
      
      if (displayName) updateData.displayName = displayName;
      if (username) updateData.username = username;
      if (bio !== undefined) updateData.bio = bio;
      if (location) updateData.location = location;
      
      // Upload profile image if provided
      if (profileImage && profileImage.uri) {
        const storageRef = ref(storage, `profiles/${id}/${Date.now()}.jpg`);
        
        // Convert URI to blob
        const response = await fetch(profileImage.uri);
        const blob = await response.blob();
        
        // Upload to Firebase Storage
        await uploadBytes(storageRef, blob);
        
        // Get download URL
        updateData.profileImageUrl = await getDownloadURL(storageRef);
      }
      
      updateData.updatedAt = serverTimestamp();
      
      const userDocRef = doc(db, 'users', id);
      await updateDoc(userDocRef, updateData);
      
      return {
        id,
        ...updateData
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const followUser = createAsyncThunk(
  'user/followUser',
  async ({ userId, targetUserId }, { rejectWithValue }) => {
    try {
      // Check if already following
      const followsRef = collection(db, 'follows');
      const q = query(
        followsRef,
        where('followerId', '==', userId),
        where('followingId', '==', targetUserId),
        limit(1)
      );
      
      const followSnapshot = await getDocs(q);
      
      if (followSnapshot.empty) {
        // Create follow relationship
        await addDoc(collection(db, 'follows'), {
          followerId: userId,
          followingId: targetUserId,
          createdAt: serverTimestamp()
        });
        
        return { following: true, targetUserId };
      } else {
        // Remove follow relationship
        await deleteDoc(doc(db, 'follows', followSnapshot.docs[0].id));
        
        return { following: false, targetUserId };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkFollowStatus = createAsyncThunk(
  'user/checkFollowStatus',
  async ({ userId, targetUserId }, { rejectWithValue }) => {
    try {
      const followsRef = collection(db, 'follows');
      const q = query(
        followsRef,
        where('followerId', '==', userId),
        where('followingId', '==', targetUserId),
        limit(1)
      );
      
      const followSnapshot = await getDocs(q);
      
      return { 
        following: !followSnapshot.empty,
        targetUserId
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch user notifications
export const fetchNotifications = createAsyncThunk(
  'user/fetchNotifications',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user } = getState();
      const currentUser = user.userData;
      
      if (!currentUser || !currentUser.uid) {
        return rejectWithValue('User not authenticated');
      }
      
      // In a real app, this would query Firestore
      // For this mock implementation, we'll generate fake notifications
      return generateMockNotifications(currentUser.uid);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch user followers
export const fetchUserFollowers = createAsyncThunk(
  'user/fetchUserFollowers',
  async (userId, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would query Firestore for followers
      // For this mock implementation, generate fake followers
      return generateMockUsers(5);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch user following
export const fetchUserFollowing = createAsyncThunk(
  'user/fetchUserFollowing',
  async (userId, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would query Firestore for following users
      // For this mock implementation, generate fake following users
      return generateMockUsers(8);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Unfollow user - for compatibility with existing code
export const unfollowUser = createAsyncThunk(
  'user/unfollowUser',
  async (targetUserId, { getState, rejectWithValue }) => {
    try {
      const { user } = getState();
      const currentUser = user.userData;
      
      if (!currentUser || !currentUser.uid) {
        return rejectWithValue('User not authenticated');
      }
      
      // In a real app, this would use Firestore to remove the follow relationship
      // Since we have a toggleable followUser that handles both follow/unfollow,
      // this function serves as a direct call to unfollow for UI consistency
      return { 
        following: false, 
        targetUserId 
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper to generate mock users for testing
const generateMockUsers = (count) => {
  const usernames = ['powder_hound', 'mountain_master', 'ski_guru', 'snow_rider', 'peak_explorer', 
                     'alpine_skier', 'backcountry_pro', 'snow_surfer', 'freestyle_king', 'mogul_queen'];
  const displayNames = ['Alex Johnson', 'Sam Smith', 'Jordan Lee', 'Taylor Kim', 'Morgan Chen',
                        'Riley Garcia', 'Casey Wong', 'Jamie Davis', 'Quinn Park', 'Avery Martinez'];
  // Using default profile placeholders instead of specific images
  const profileImages = [
    'https://via.placeholder.com/200/e0f2ff/0066cc?text=PS',
    'https://via.placeholder.com/200/e0f2ff/0066cc?text=PS',
    'https://via.placeholder.com/200/e0f2ff/0066cc?text=PS',
    'https://via.placeholder.com/200/e0f2ff/0066cc?text=PS',
    'https://via.placeholder.com/200/e0f2ff/0066cc?text=PS',
    'https://via.placeholder.com/200/e0f2ff/0066cc?text=PS',
    'https://via.placeholder.com/200/e0f2ff/0066cc?text=PS',
    'https://via.placeholder.com/200/e0f2ff/0066cc?text=PS',
    'https://via.placeholder.com/200/e0f2ff/0066cc?text=PS',
    'https://via.placeholder.com/200/e0f2ff/0066cc?text=PS'
  ];
  
  const users = [];
  for (let i = 0; i < count; i++) {
    const userIndex = Math.floor(Math.random() * usernames.length);
    users.push({
      id: `user-${i}`,
      username: usernames[userIndex],
      displayName: displayNames[userIndex],
      profileImageUrl: profileImages[userIndex],
      bio: `Skiing enthusiast. ${Math.floor(Math.random() * 10) + 1} years experience.`,
      isFollowedByMe: Math.random() > 0.3, // 70% chance the user is followed
    });
  }
  
  return users;
};

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  'user/markNotificationAsRead',
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would update Firestore
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Generate mock notifications for development
const generateMockNotifications = (userId) => {
  const notificationTypes = ['like', 'comment', 'follow', 'mention', 'tag'];
  const usernames = ['powder_hound', 'mountain_master', 'ski_guru', 'snow_rider', 'peak_explorer'];
  const displayNames = ['Alex Johnson', 'Sam Smith', 'Jordan Lee', 'Taylor Kim', 'Morgan Chen'];
  const postImages = [
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1488591216063-cb6ab485cece?w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=200&auto=format&fit=crop'
  ];
  const profileImages = [
    'https://via.placeholder.com/200/e0f2ff/0066cc?text=PS',
    'https://via.placeholder.com/200/e0f2ff/0066cc?text=PS',
    'https://via.placeholder.com/200/e0f2ff/0066cc?text=PS',
    'https://via.placeholder.com/200/e0f2ff/0066cc?text=PS',
    'https://via.placeholder.com/200/e0f2ff/0066cc?text=PS'
  ];
  
  // Generate text based on notification type
  const getNotificationText = (type, username) => {
    switch (type) {
      case 'like':
        return `${username} liked your post`;
      case 'comment':
        return `${username} commented on your post: "Awesome shot! Love the powder!"`;
      case 'follow':
        return `${username} started following you`;
      case 'mention':
        return `${username} mentioned you in a comment: "Check out this amazing run @${username}!"`;
      case 'tag':
        return `${username} tagged you in a post`;
      default:
        return `${username} interacted with your content`;
    }
  };
  
  // Generate 10-15 random notifications
  const count = Math.floor(Math.random() * 6) + 10; // 10-15 notifications
  const notifications = [];
  
  for (let i = 0; i < count; i++) {
    const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const userIndex = Math.floor(Math.random() * usernames.length);
    const username = usernames[userIndex];
    const displayName = displayNames[userIndex];
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)); // Random time in last week
    const unread = Math.random() > 0.7; // 30% chance of being unread
    const postImage = type === 'follow' ? null : postImages[Math.floor(Math.random() * postImages.length)];
    
    notifications.push({
      id: `notification-${i}`,
      type,
      fromUser: {
        id: `user-${i}`,
        username,
        displayName,
        profileImageUrl: profileImages[userIndex],
      },
      text: getNotificationText(type, displayName),
      postId: type === 'follow' ? null : `post-${i}`,
      postImage,
      timestamp: timestamp.toISOString(),
      unread,
    });
  }
  
  // Sort by timestamp, newest first
  return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    profileData: null,
    loading: false,
    error: null,
    followStatus: {},
    updatingProfile: false,
    notifications: [],
    notificationsLoading: false,
    followers: [],
    following: []
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    clearUserData: (state) => {
      state.userData = null;
    },
    clearProfileData: (state) => {
      state.profileData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profileData = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.updatingProfile = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updatingProfile = false;
        
        // Update userData if this is the current user
        if (state.userData && state.userData.uid === action.payload.id) {
          state.userData = {
            ...state.userData,
            ...action.payload
          };
        }
        
        // Update profileData if loaded
        if (state.profileData && state.profileData.id === action.payload.id) {
          state.profileData = {
            ...state.profileData,
            ...action.payload
          };
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updatingProfile = false;
        state.error = action.payload;
      })
      
      // Follow user
      .addCase(followUser.fulfilled, (state, action) => {
        const { following, targetUserId } = action.payload;
        state.followStatus[targetUserId] = following;
        
        // Update follower/following counts if profile is loaded
        if (state.profileData && state.profileData.id === targetUserId) {
          state.profileData.followerCount = following
            ? (state.profileData.followerCount || 0) + 1
            : (state.profileData.followerCount || 1) - 1;
        }
        
        if (state.userData) {
          state.userData.followingCount = following
            ? (state.userData.followingCount || 0) + 1
            : (state.userData.followingCount || 1) - 1;
        }
      })
      
      // Check follow status
      .addCase(checkFollowStatus.fulfilled, (state, action) => {
        const { following, targetUserId } = action.payload;
        state.followStatus[targetUserId] = following;
      })
      
      // Unfollow user
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const { following, targetUserId } = action.payload;
        state.followStatus[targetUserId] = following;
        
        // Update follower/following counts if profile is loaded
        if (state.profileData && state.profileData.id === targetUserId) {
          state.profileData.followerCount = (state.profileData.followerCount || 1) - 1;
        }
        
        if (state.userData) {
          state.userData.followingCount = (state.userData.followingCount || 1) - 1;
        }
      })
      
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.notificationsLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notificationsLoading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.notificationsLoading = false;
        state.error = action.payload;
      })
      
      // Mark notification as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.unread = false;
        }
      })
      
      // Fetch followers
      .addCase(fetchUserFollowers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserFollowers.fulfilled, (state, action) => {
        state.loading = false;
        state.followers = action.payload;
      })
      .addCase(fetchUserFollowers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch following
      .addCase(fetchUserFollowing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserFollowing.fulfilled, (state, action) => {
        state.loading = false;
        state.following = action.payload;
      })
      .addCase(fetchUserFollowing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUserData, clearUserData, clearProfileData } = userSlice.actions;
export default userSlice.reducer;