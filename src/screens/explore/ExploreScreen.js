import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Text, ActivityIndicator } from 'react-native';
import { Appbar, Searchbar, Chip, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchResorts, searchResorts } from '../../redux/slices/resortsSlice';
// Import Firebase from our own file for web compatibility
import nativeModules from '../../native-modules';
const firestore = nativeModules.firestore;

const ResortCard = ({ resort, onPress }) => {
  return (
    <TouchableOpacity style={styles.resortCard} onPress={onPress}>
      <Image 
        source={{ uri: resort.imageUrl || 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2tpJTIwcmVzb3J0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60' }} 
        style={styles.resortImage} 
      />
      <View style={styles.resortInfo}>
        <Text style={styles.resortName}>{resort.name}</Text>
        <Text style={styles.resortLocation}>
          {resort.location?.region}, {resort.location?.country}
        </Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statItem}>
            <Text style={styles.statValue}>{resort.postCount || 0}</Text> posts
          </Text>
          {resort.weather && (
            <Text style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(resort.weather.temperature)}°C</Text>
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const PopularSkiPost = ({ post, onPress }) => {
  return (
    <TouchableOpacity style={styles.postThumbnail} onPress={onPress}>
      <Image 
        source={{ uri: post.imageUrls[0] }} 
        style={styles.thumbnailImage} 
      />
    </TouchableOpacity>
  );
};

const ExploreScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { resortsList, searchResults, loading, searchLoading } = useSelector((state) => state.resorts);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('resorts');
  const [popularPosts, setPopularPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  
  useEffect(() => {
    // Fetch resorts on component mount
    dispatch(fetchResorts());
    
    // Fetch popular posts
    fetchPopularPosts();
  }, [dispatch]);
  
  const fetchPopularPosts = async () => {
    setLoadingPosts(true);
    try {
      const postsSnapshot = await firestore()
        .collection('posts')
        .orderBy('likeCount', 'desc')
        .limit(12)
        .get();
      
      const posts = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
        updatedAt: doc.data().updatedAt.toDate().toISOString()
      }));
      
      setPopularPosts(posts);
    } catch (error) {
      console.error('Error fetching popular posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchResorts(searchQuery.trim()));
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  const renderResorts = () => {
    const dataToRender = searchQuery ? searchResults : resortsList;
    const isLoading = searchQuery ? searchLoading : loading;
    
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      );
    }
    
    if (searchQuery && dataToRender.length === 0) {
      return (
        <View style={styles.emptyResultsContainer}>
          <Text style={styles.emptyResultsText}>No resorts found matching "{searchQuery}"</Text>
          <Button mode="outlined" onPress={clearSearch}>Clear Search</Button>
        </View>
      );
    }
    
    return (
      <FlatList
        data={dataToRender}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ResortCard 
            resort={item} 
            onPress={() => navigation.navigate('ResortDetail', { resortId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContainer}
      />
    );
  };
  
  const renderPopularPosts = () => {
    if (loadingPosts) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      );
    }
    
    return (
      <FlatList
        data={popularPosts}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <PopularSkiPost 
            post={item} 
            onPress={() => navigation.navigate('PostDetail', { post: item })}
          />
        )}
        contentContainerStyle={styles.postsContainer}
      />
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.searchContainer}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('SimpleExplore')}
      >
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#666" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search resorts, locations, or tags</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.filtersContainer}>
        <Chip 
          selected={activeFilter === 'resorts'} 
          onPress={() => setActiveFilter('resorts')}
          style={styles.filterChip}
        >
          Resorts
        </Chip>
        <Chip 
          selected={activeFilter === 'popular'} 
          onPress={() => setActiveFilter('popular')}
          style={styles.filterChip}
        >
          Popular Posts
        </Chip>
        <Chip 
          selected={activeFilter === 'nearby'} 
          onPress={() => setActiveFilter('nearby')}
          style={styles.filterChip}
        >
          Nearby
        </Chip>
      </View>
      
      {activeFilter === 'resorts' && renderResorts()}
      {activeFilter === 'popular' && renderPopularPosts()}
      {activeFilter === 'nearby' && (
        <View style={styles.centeredContainer}>
          <Text>Nearby feature coming soon!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDDDDD',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  searchContainer: {
    padding: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    color: '#666',
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  resortCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  resortImage: {
    width: 120,
    height: 120,
  },
  resortInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  resortName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resortLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#0066CC',
  },
  postsContainer: {
    padding: 2,
  },
  postThumbnail: {
    flex: 1/3,
    aspectRatio: 1,
    padding: 2,
  },
  thumbnailImage: {
    flex: 1,
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyResultsText: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExploreScreen;