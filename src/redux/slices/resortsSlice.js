import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../firebase';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  doc, 
  getDoc,
  where,
  limit,
  startAt,
  endAt
} from 'firebase/firestore';

export const fetchResorts = createAsyncThunk(
  'resorts/fetchResorts',
  async (_, { rejectWithValue }) => {
    try {
      const resortsRef = collection(db, 'resorts');
      const q = query(resortsRef, orderBy('name'));
      
      const resortsSnapshot = await getDocs(q);
      
      const resorts = resortsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return resorts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchResortDetails = createAsyncThunk(
  'resorts/fetchResortDetails',
  async (resortId, { rejectWithValue }) => {
    try {
      const resortDocRef = doc(db, 'resorts', resortId);
      const resortDoc = await getDoc(resortDocRef);
      
      if (!resortDoc.exists()) {
        return rejectWithValue('Resort not found');
      }
      
      // Get recent posts from this resort
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('location.id', '==', resortId),
        orderBy('createdAt', 'desc'),
        limit(20)
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
      
      // Get current weather for this resort (in a real app, you'd call a weather API)
      const weather = {
        temperature: Math.floor(Math.random() * 30) - 10, // Random temp between -10 and 20
        conditions: ['Sunny', 'Cloudy', 'Snowing', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
        snowDepth: Math.floor(Math.random() * 200) + 50, // Random depth between 50 and 250 cm
        lastSnowfall: new Date(Date.now() - Math.floor(Math.random() * 7) * 86400000).toISOString() // Random day in last week
      };
      
      return {
        id: resortId,
        ...resortDoc.data(),
        posts,
        weather
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchResorts = createAsyncThunk(
  'resorts/searchResorts',
  async (searchQuery, { rejectWithValue }) => {
    try {
      // In a real app, you'd use Algolia or Firebase's full-text search
      // This is a simplified version that searches by name prefix
      const resortsRef = collection(db, 'resorts');
      const q = query(
        resortsRef,
        orderBy('name'),
        startAt(searchQuery),
        endAt(searchQuery + '\uf8ff'),
        limit(20)
      );
      
      const resortsSnapshot = await getDocs(q);
      
      const resorts = resortsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return resorts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const resortsSlice = createSlice({
  name: 'resorts',
  initialState: {
    resortsList: [],
    currentResort: null,
    searchResults: [],
    loading: false,
    searchLoading: false,
    error: null,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearCurrentResort: (state) => {
      state.currentResort = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch resorts list
      .addCase(fetchResorts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResorts.fulfilled, (state, action) => {
        state.loading = false;
        state.resortsList = action.payload;
      })
      .addCase(fetchResorts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch resort details
      .addCase(fetchResortDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResortDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResort = action.payload;
      })
      .addCase(fetchResortDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search resorts
      .addCase(searchResorts.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchResorts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchResorts.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSearchResults, clearCurrentResort } = resortsSlice.actions;
export default resortsSlice.reducer;