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
  endAt,
  setDoc,
  addDoc
} from 'firebase/firestore';
import { fetchWeatherForLocation } from '../../services/weatherService';

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
  async (searchQuery, { rejectWithValue, getState }) => {
    try {
      // Normalize the search query
      const normalizedQuery = searchQuery.toLowerCase().trim();
      
      // For a more comprehensive search in a real app with lots of data
      // we would use Algolia, Typesense or Firestore's full-text search capabilities
      
      // But for our app, we'll do a client-side search of all resorts
      // This allows us to search for partial matches in name, region, and country
      const { resortsList } = getState().resorts;
      
      // If we have resorts in the store, search through them
      if (resortsList && resortsList.length > 0) {
        const matchingResorts = resortsList.filter(resort => {
          // Check name
          if (resort.name?.toLowerCase().includes(normalizedQuery)) {
            return true;
          }
          
          // Check region
          if (resort.region?.toLowerCase().includes(normalizedQuery)) {
            return true;
          }
          
          // Check country
          if (resort.country?.toLowerCase().includes(normalizedQuery)) {
            return true;
          }
          
          // Check description
          if (resort.description?.toLowerCase().includes(normalizedQuery)) {
            return true;
          }
          
          return false;
        });
        
        return matchingResorts;
      } 
      // If we don't have resorts in the store yet, use the Firestore query approach
      else {
        // This is a simplified version that searches by name prefix
        const resortsRef = collection(db, 'resorts');
        const nameQuery = query(
          resortsRef,
          orderBy('name'),
          startAt(normalizedQuery),
          endAt(normalizedQuery + '\uf8ff'),
          limit(20)
        );
        
        const resortsSnapshot = await getDocs(nameQuery);
        
        const resorts = resortsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        return resorts;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// New function to seed the database with resorts
export const seedResorts = createAsyncThunk(
  'resorts/seedResorts',
  async (_, { rejectWithValue }) => {
    try {
      // Check if resorts collection is empty first
      const resortsRef = collection(db, 'resorts');
      const q = query(resortsRef, limit(1));
      const snapshot = await getDocs(q);
      
      // Only seed if no resorts exist
      if (snapshot.empty) {
        const resortsToAdd = [
          {
            name: 'Whistler Blackcomb',
            region: 'British Columbia, Canada',
            country: 'Canada',
            latitude: 50.1163,
            longitude: -122.9574,
            description: "North America's largest ski resort with over 8,000 acres of skiable terrain.",
            imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            elevation: 2284,
            trails: 200,
            lifts: 37,
            terrain: {
              beginner: 20,
              intermediate: 55,
              advanced: 25
            },
            rating: 4.8,
            openStatus: 'Open',
            website: 'https://www.whistlerblackcomb.com'
          },
          {
            name: 'Aspen Snowmass',
            region: 'Colorado, USA',
            country: 'United States',
            latitude: 39.2084,
            longitude: -106.9491,
            description: 'Four mountains of world-class skiing and snowboarding in the heart of the Colorado Rockies.',
            imageUrl: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            elevation: 3813,
            trails: 362,
            lifts: 40,
            terrain: {
              beginner: 15,
              intermediate: 44,
              advanced: 41
            },
            rating: 4.7,
            openStatus: 'Open',
            website: 'https://www.aspensnowmass.com'
          },
          {
            name: 'Park City Mountain',
            region: 'Utah, USA',
            country: 'United States',
            latitude: 40.6461,
            longitude: -111.5080,
            description: 'America\'s largest single ski resort with over 7,300 acres of terrain.',
            imageUrl: 'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            elevation: 3049,
            trails: 341,
            lifts: 41,
            terrain: {
              beginner: 8,
              intermediate: 42,
              advanced: 50
            },
            rating: 4.6,
            openStatus: 'Open',
            website: 'https://www.parkcitymountain.com'
          },
          {
            name: 'Zermatt',
            region: 'Valais, Switzerland',
            country: 'Switzerland',
            latitude: 46.0207,
            longitude: 7.7491,
            description: 'Iconic Swiss resort with the majestic Matterhorn as its backdrop.',
            imageUrl: 'https://images.unsplash.com/photo-1488591216063-cb6ab485cece?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            elevation: 3883,
            trails: 200,
            lifts: 52,
            terrain: {
              beginner: 20,
              intermediate: 60,
              advanced: 20
            },
            rating: 4.9,
            openStatus: 'Open',
            website: 'https://www.zermatt.ch'
          },
          {
            name: 'Niseko United',
            region: 'Hokkaido, Japan',
            country: 'Japan',
            latitude: 42.8048,
            longitude: 140.6874,
            description: 'Japan\'s premier powder destination, famous for its consistent snowfall.',
            imageUrl: 'https://images.unsplash.com/photo-1548133750-129e3168eb56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            elevation: 1200,
            trails: 61,
            lifts: 38,
            terrain: {
              beginner: 30,
              intermediate: 40,
              advanced: 30
            },
            rating: 4.7,
            openStatus: 'Open',
            website: 'https://www.niseko.ne.jp'
          },
          {
            name: 'Chamonix-Mont-Blanc',
            region: 'Haute-Savoie, France',
            country: 'France',
            latitude: 45.9237,
            longitude: 6.8694,
            description: 'Home to some of the most challenging skiing in the world at the foot of Mont Blanc.',
            imageUrl: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            elevation: 3842,
            trails: 170,
            lifts: 49,
            terrain: {
              beginner: 16,
              intermediate: 39,
              advanced: 45
            },
            rating: 4.7,
            openStatus: 'Open',
            website: 'https://www.chamonix.com'
          },
          {
            name: 'St. Anton',
            region: 'Tyrol, Austria',
            country: 'Austria',
            latitude: 47.1300,
            longitude: 10.2700,
            description: 'Austria\'s largest interconnected ski area and the birthplace of alpine skiing.',
            imageUrl: 'https://images.unsplash.com/photo-1673586310438-a65143e2d0ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            elevation: 2811,
            trails: 305,
            lifts: 88,
            terrain: {
              beginner: 10,
              intermediate: 40,
              advanced: 50
            },
            rating: 4.8,
            openStatus: 'Open',
            website: 'https://www.stantonamarlberg.com'
          },
          {
            name: 'Vail Mountain Resort',
            region: 'Colorado, USA',
            country: 'United States',
            latitude: 39.6403,
            longitude: -106.3742,
            description: 'One of the largest ski resorts in the world with 5,317 acres of skiable terrain.',
            imageUrl: 'https://images.unsplash.com/photo-1544454950-5ec6b5b1b0a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            elevation: 3527,
            trails: 195,
            lifts: 31,
            terrain: {
              beginner: 18,
              intermediate: 29,
              advanced: 53
            },
            rating: 4.8,
            openStatus: 'Open',
            website: 'https://www.vail.com'
          },
          {
            name: 'Jackson Hole Mountain Resort',
            region: 'Wyoming, USA',
            country: 'United States',
            latitude: 43.5795,
            longitude: -110.8279,
            description: 'Known for its steep terrain and legendary Corbet\'s Couloir.',
            imageUrl: 'https://images.unsplash.com/photo-1583830485245-80a4da428182?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            elevation: 3185,
            trails: 131,
            lifts: 13,
            terrain: {
              beginner: 10,
              intermediate: 40,
              advanced: 50
            },
            rating: 4.7,
            openStatus: 'Open',
            website: 'https://www.jacksonhole.com'
          },
          {
            name: 'Val d\'Isère',
            region: 'Savoie, France',
            country: 'France',
            latitude: 45.4500,
            longitude: 6.9800,
            description: 'Part of the massive Espace Killy ski area with high-altitude snow reliability.',
            imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            elevation: 3456,
            trails: 300,
            lifts: 79,
            terrain: {
              beginner: 20,
              intermediate: 40,
              advanced: 40
            },
            rating: 4.8,
            openStatus: 'Open',
            website: 'https://www.valdisere.com'
          },
          {
            name: 'Hakuba Valley',
            region: 'Nagano, Japan',
            country: 'Japan',
            latitude: 36.7016,
            longitude: 137.8318,
            description: 'Expansive ski area with incredible Japanese powder and Olympic history.',
            imageUrl: 'https://images.unsplash.com/photo-1586066306825-77f49d060624?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            elevation: 1831,
            trails: 137,
            lifts: 107,
            terrain: {
              beginner: 30,
              intermediate: 40,
              advanced: 30
            },
            rating: 4.6,
            openStatus: 'Open',
            website: 'https://www.hakubavalley.com'
          },
          {
            name: 'Banff Sunshine',
            region: 'Alberta, Canada',
            country: 'Canada',
            latitude: 51.1152,
            longitude: -115.7631,
            description: 'High alpine skiing with stunning views of the Canadian Rockies.',
            imageUrl: 'https://images.unsplash.com/photo-1591475791029-25b2d98f9818?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            elevation: 2730,
            trails: 120,
            lifts: 12,
            terrain: {
              beginner: 20,
              intermediate: 45,
              advanced: 35
            },
            rating: 4.7,
            openStatus: 'Open',
            website: 'https://www.skibanff.com'
          },
          {
            name: 'Mammoth Mountain',
            region: 'California, USA',
            country: 'United States',
            latitude: 37.6308,
            longitude: -119.0326,
            description: 'California\'s highest ski resort with one of the longest seasons in North America.',
            imageUrl: 'https://images.unsplash.com/photo-1577493340887-b7bfff550145?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            elevation: 3369,
            trails: 175,
            lifts: 25,
            terrain: {
              beginner: 25,
              intermediate: 40,
              advanced: 35
            },
            rating: 4.7,
            openStatus: 'Open',
            website: 'https://www.mammothmountain.com'
          },
          {
            name: 'Mount Hutt',
            region: 'Canterbury, New Zealand',
            country: 'New Zealand',
            latitude: -43.4721,
            longitude: 171.5477,
            description: 'New Zealand\'s most popular ski area with wide-open terrain.',
            imageUrl: 'https://images.unsplash.com/photo-1589802829282-8a1a72350fd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            elevation: 2086,
            trails: 40,
            lifts: 5,
            terrain: {
              beginner: 25,
              intermediate: 50,
              advanced: 25
            },
            rating: 4.5,
            openStatus: 'Closed',
            website: 'https://www.mthutt.co.nz'
          },
          {
            name: 'Cortina d\'Ampezzo',
            region: 'Veneto, Italy',
            country: 'Italy',
            latitude: 46.5404,
            longitude: 12.1390,
            description: 'Historic Italian resort in the stunning Dolomites.',
            imageUrl: 'https://images.unsplash.com/photo-1528902496644-a753678bcf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            elevation: 2930,
            trails: 120,
            lifts: 42,
            terrain: {
              beginner: 30,
              intermediate: 50,
              advanced: 20
            },
            rating: 4.6,
            openStatus: 'Open',
            website: 'https://www.cortina.dolomiti.org'
          }
        ];
        
        // Add resorts to Firestore
        for (const resort of resortsToAdd) {
          await addDoc(collection(db, 'resorts'), resort);
        }
        
        // Return the resorts we added
        return resortsToAdd;
      } else {
        // Resorts already exist, just return them
        const allResortsQuery = query(resortsRef, orderBy('name'));
        const allResortsSnapshot = await getDocs(allResortsQuery);
        
        const resorts = allResortsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        return resorts;
      }
    } catch (error) {
      console.error('Error seeding resorts:', error);
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
    seedingStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
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
      })
      
      // Seed resorts
      .addCase(seedResorts.pending, (state) => {
        state.seedingStatus = 'loading';
        state.error = null;
      })
      .addCase(seedResorts.fulfilled, (state, action) => {
        state.seedingStatus = 'succeeded';
        // Also update the resortsList with the seeded data
        state.resortsList = action.payload;
      })
      .addCase(seedResorts.rejected, (state, action) => {
        state.seedingStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearSearchResults, clearCurrentResort } = resortsSlice.actions;
export default resortsSlice.reducer;