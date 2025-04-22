import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, storage } from '../../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  deleteDoc,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const { userId, images, caption, location, tags } = postData;
      
      // Upload images to Firebase Storage
      const imageUrls = [];
      
      for (const image of images) {
        const imageName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const storageRef = ref(storage, `posts/${userId}/${imageName}`);
        
        // Convert URI to blob
        const response = await fetch(image.uri);
        const blob = await response.blob();
        
        // Upload to Firebase Storage
        await uploadBytes(storageRef, blob);
        
        // Get download URL
        const url = await getDownloadURL(storageRef);
        imageUrls.push(url);
      }
      
      // Create post document in Firestore
      const post = {
        userId,
        imageUrls,
        caption: caption || '',
        location: location || null,
        tags: tags || [],
        likeCount: 0,
        commentCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Get user data to add to post
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        post.username = userData.username;
        post.userProfileImageUrl = userData.profileImageUrl;
      }
      
      const postsRef = collection(db, 'posts');
      const postRef = await addDoc(postsRef, post);
      
      return {
        id: postRef.id,
        ...post,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (userId, { rejectWithValue }) => {
    try {
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const postsSnapshot = await getDocs(q);
      
      const posts = postsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      });
      
      return posts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPostInteractions = createAsyncThunk(
  'posts/fetchPostInteractions',
  async (postId, { rejectWithValue }) => {
    try {
      // Fetch likes for this post
      const likesRef = collection(db, 'likes');
      const likesQuery = query(
        likesRef,
        where('postId', '==', postId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const likesSnapshot = await getDocs(likesQuery);
      
      const likes = [];
      for (const likeDoc of likesSnapshot.docs) {
        const likeData = likeDoc.data();
        
        // Get user info for each like
        const userRef = doc(db, 'users', likeData.userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          likes.push({
            id: likeDoc.id,
            timestamp: likeData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            user: {
              id: likeData.userId,
              username: userData.username,
              profileImageUrl: userData.profileImageUrl
            }
          });
        }
      }
      
      // Fetch comments for this post
      const commentsRef = collection(db, 'comments');
      const commentsQuery = query(
        commentsRef,
        where('postId', '==', postId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const commentsSnapshot = await getDocs(commentsQuery);
      
      const comments = commentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          timestamp: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          user: {
            id: data.userId,
            username: data.username,
            profileImageUrl: data.userProfileImageUrl
          }
        };
      });
      
      return { postId, likes, comments };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async ({ postId, userId }, { rejectWithValue }) => {
    try {
      // Check if already liked
      const likesRef = collection(db, 'likes');
      const q = query(
        likesRef,
        where('userId', '==', userId),
        where('postId', '==', postId),
        limit(1)
      );
      
      const likeSnapshot = await getDocs(q);
      
      if (likeSnapshot.empty) {
        // Add like
        await addDoc(collection(db, 'likes'), {
          userId,
          postId,
          createdAt: serverTimestamp()
        });
        
        // Update post like count
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          likeCount: increment(1)
        });
        
        return { postId, liked: true };
      } else {
        // Remove like
        const likeDocRef = doc(db, 'likes', likeSnapshot.docs[0].id);
        await deleteDoc(likeDocRef);
        
        // Update post like count
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          likeCount: increment(-1)
        });
        
        return { postId, liked: false };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    userPosts: [],
    currentPost: null,
    loading: false,
    error: null,
    postingStatus: 'idle',
    likedPosts: {},
    postInteractions: {},  // Store likes and comments for each post
    loadingInteractions: false
  },
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    setCurrentPost: (state, action) => {
      state.currentPost = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create post
      .addCase(createPost.pending, (state) => {
        state.postingStatus = 'loading';
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.postingStatus = 'succeeded';
        state.userPosts.unshift(action.payload);
        state.currentPost = action.payload;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.postingStatus = 'failed';
        state.error = action.payload;
      })
      
      // Fetch user posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.userPosts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, liked } = action.payload;
        state.likedPosts[postId] = liked;
        
        // Update like count in posts arrays
        const updatePostLikeCount = (post) => {
          if (post.id === postId) {
            return {
              ...post,
              likeCount: liked ? (post.likeCount || 0) + 1 : (post.likeCount || 1) - 1
            };
          }
          return post;
        };
        
        state.userPosts = state.userPosts.map(updatePostLikeCount);
        
        if (state.currentPost && state.currentPost.id === postId) {
          state.currentPost = updatePostLikeCount(state.currentPost);
        }
      })
      
      // Fetch post interactions
      .addCase(fetchPostInteractions.pending, (state) => {
        state.loadingInteractions = true;
        state.error = null;
      })
      .addCase(fetchPostInteractions.fulfilled, (state, action) => {
        const { postId, likes, comments } = action.payload;
        state.loadingInteractions = false;
        
        // Store interactions for this post
        state.postInteractions[postId] = { likes, comments };
      })
      .addCase(fetchPostInteractions.rejected, (state, action) => {
        state.loadingInteractions = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentPost, setCurrentPost } = postsSlice.actions;
export default postsSlice.reducer;