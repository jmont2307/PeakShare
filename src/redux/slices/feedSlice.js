import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'firebase/firestore';

export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async (userId, { rejectWithValue }) => {
    try {
      // First get user's following list
      const followsRef = collection(db, 'follows');
      const followsQuery = query(
        followsRef,
        where('followerId', '==', userId)
      );
      
      const followingSnapshot = await getDocs(followsQuery);
      
      const followingIds = followingSnapshot.docs.map(doc => doc.data().followingId);
      followingIds.push(userId); // Include user's own posts
      
      // Then get posts from those users, ordered by date
      let posts = [];
      
      if (followingIds.length > 0) {
        // Due to Firebase limitations with "in" queries, split into chunks if needed
        const chunkSize = 10; // Firestore allows up to 10 items in an "in" query
        
        for (let i = 0; i < followingIds.length; i += chunkSize) {
          const chunk = followingIds.slice(i, i + chunkSize);
          
          const postsRef = collection(db, 'posts');
          const postsQuery = query(
            postsRef,
            where('userId', 'in', chunk),
            orderBy('createdAt', 'desc'),
            limit(20)
          );
          
          const postsSnapshot = await getDocs(postsQuery);
          
          const chunkPosts = postsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
            };
          });
          
          posts = [...posts, ...chunkPosts];
        }
        
        // Sort all posts by createdAt
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Limit to 20 posts
        posts = posts.slice(0, 20);
      }
      
      return posts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    posts: [],
    loading: false,
    error: null,
    lastVisible: null,
  },
  reducers: {
    clearFeed: (state) => {
      state.posts = [];
      state.lastVisible = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
        state.lastVisible = action.payload.length > 0 ? 
          action.payload[action.payload.length - 1].createdAt : null;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFeed } = feedSlice.actions;
export default feedSlice.reducer;