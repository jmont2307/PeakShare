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

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    profileData: null,
    loading: false,
    error: null,
    followStatus: {},
    updatingProfile: false
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
      });
  },
});

export const { setUserData, clearUserData, clearProfileData } = userSlice.actions;
export default userSlice.reducer;