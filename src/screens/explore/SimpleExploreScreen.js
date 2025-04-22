import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Image, 
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-web-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResorts, searchResorts, seedResorts } from '../../redux/slices/resortsSlice';
import { fetchWeatherForLocation } from '../../services/weatherService';
import { theme } from '../../theme';

// Fallback sample data in case Firebase isn't set up
const SAMPLE_RESORTS = [
  {
    id: '1',
    name: 'Whistler Blackcomb',
    location: 'British Columbia, Canada',
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    newSnow: 15,
    description: 'North America\'s largest ski resort with over 8,000 acres of skiable terrain.'
  },
  {
    id: '2',
    name: 'Aspen Snowmass',
    location: 'Colorado, USA',
    imageUrl: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    newSnow: 8,
    description: 'Four mountains of world-class skiing and snowboarding in the heart of the Colorado Rockies.'
  },
  {
    id: '3',
    name: 'Park City Mountain',
    location: 'Utah, USA',
    imageUrl: 'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    newSnow: 12,
    description: 'America\'s largest single ski resort with over 7,300 acres of terrain.'
  },
  {
    id: '4',
    name: 'Zermatt',
    location: 'Switzerland',
    imageUrl: 'https://images.unsplash.com/photo-1488591216063-cb6ab485cece?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    newSnow: 20,
    description: 'Iconic Swiss resort with the majestic Matterhorn as its backdrop.'
  },
  {
    id: '5',
    name: 'Niseko United',
    location: 'Hokkaido, Japan',
    imageUrl: 'https://images.unsplash.com/photo-1548133750-129e3168eb56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    newSnow: 25,
    description: 'Japan\'s premier powder destination, famous for its consistent snowfall.'
  }
];

const SimpleExploreScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { resortsList, searchResults, loading, error, seedingStatus } = useSelector(state => state.resorts);
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState({});
  const [loadingWeather, setLoadingWeather] = useState(false);
  
  useEffect(() => {
    // Fetch resorts and seed the database if needed
    dispatch(fetchResorts());
    dispatch(seedResorts());
  }, [dispatch]);
  
  // Fetch weather data for resorts
  useEffect(() => {
    const fetchWeatherForResorts = async () => {
      if (resortsList.length > 0 && !loadingWeather) {
        setLoadingWeather(true);
        
        // Get weather for up to 5 resorts to avoid rate limiting
        const resortsToFetch = resortsList.slice(0, 5);
        const weatherPromises = resortsToFetch.map(resort => 
          fetchWeatherForLocation(
            resort.latitude || 0, 
            resort.longitude || 0,
            resort.name
          ).then(data => ({ resortId: resort.id, data }))
        );
        
        try {
          const results = await Promise.all(weatherPromises);
          const weatherMap = {};
          
          results.forEach(({ resortId, data }) => {
            weatherMap[resortId] = data;
          });
          
          setWeatherData(weatherMap);
        } catch (error) {
          console.error('Error fetching weather data:', error);
        } finally {
          setLoadingWeather(false);
        }
      }
    };
    
    fetchWeatherForResorts();
  }, [resortsList]);
  
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.length >= 2) {
      dispatch(searchResorts(query));
    }
  };
  
  const handleSelectResort = (resort) => {
    navigation.navigate('ResortDetail', { resortId: resort.id });
  };
  
  const getWeatherForResort = (resortId) => {
    return weatherData[resortId] || null;
  };

  const renderResortCard = ({ item }) => {
    const weather = getWeatherForResort(item.id);
    
    return (
      <TouchableOpacity 
        style={styles.resortCard}
        onPress={() => handleSelectResort(item)}
      >
        <Image 
          source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80' }} 
          style={styles.resortImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        <View style={styles.resortInfo}>
          <Text style={styles.resortName}>{item.name}</Text>
          <Text style={styles.resortLocation}>{item.location || item.region || 'Unknown location'}</Text>
          <View style={styles.resortStats}>
            {item.rating && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.rating}</Text>
                <Text style={styles.statLabel}>★ Rating</Text>
              </View>
            )}
            {weather && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{weather.temperature}°C</Text>
                <Text style={styles.statLabel}>{weather.conditions}</Text>
              </View>
            )}
            {(weather?.snowDepth || item.newSnow || item.snowDepth) && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {weather?.snowDepth || item.newSnow || item.snowDepth || 0}cm
                </Text>
                <Text style={styles.statLabel}>Snow</Text>
              </View>
            )}
            {weather?.powderRating > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{weather.powderRating}/10</Text>
                <Text style={styles.statLabel}>Powder</Text>
              </View>
            )}
          </View>
        </View>
        {(weather?.snowfall > 0) && (
          <View style={[styles.snowBadge, styles.freshSnowBadge]}>
            <Text style={styles.snowText}>+{weather.snowfall}cm</Text>
          </View>
        )}
        {(weather?.snowDepth > 0 || item.newSnow || item.snowDepth) && (
          <View style={styles.snowBadge}>
            <Text style={styles.snowText}>{weather?.snowDepth || item.newSnow || item.snowDepth || 0}cm</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  // Use resorts from Redux or fall back to sample data
  const resorts = resortsList.length > 0 ? resortsList : SAMPLE_RESORTS;
  
  // Use search results if available, otherwise filter the full list
  const displayResorts = searchQuery.length >= 2 
    ? (searchResults.length > 0 ? searchResults : []) 
    : resorts;
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.midnight} />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search resorts, locations, tags..."
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color={theme.colors.mountain} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.bannerContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1531911970825-c1ce6fe5a25f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' }} 
          style={styles.bannerImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.bannerGradient}
        />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Discover Your Perfect Ski Adventure</Text>
          <Text style={styles.bannerSubtitle}>Find new resorts and share your experiences</Text>
        </View>
      </View>
      
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Popular Resorts</Text>
        {loading && <ActivityIndicator size="small" color={theme.colors.primary} />}
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong loading resorts</Text>
        </View>
      ) : (
        <FlatList
          data={displayResorts}
          renderItem={renderResortCard}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.resortList}
          ListEmptyComponent={
            searchQuery.length >= 2 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No resorts found matching "{searchQuery}"</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.silver,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.silver,
  },
  backButton: {
    padding: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.colors.midnight,
  },
  clearButton: {
    padding: 10,
  },
  bannerContainer: {
    height: 200,
    position: 'relative',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  bannerTitle: {
    color: theme.colors.snow,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: theme.colors.snow,
    fontSize: 14,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.midnight,
  },
  resortList: {
    paddingHorizontal: 16,
  },
  resortCard: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  resortImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  resortInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  resortName: {
    color: theme.colors.snow,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resortLocation: {
    color: theme.colors.snow,
    fontSize: 14,
    marginBottom: 8,
  },
  resortStats: {
    flexDirection: 'row',
  },
  statItem: {
    marginRight: 16,
  },
  statValue: {
    color: theme.colors.snow,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    color: theme.colors.snow,
    fontSize: 12,
  },
  snowBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  freshSnowBadge: {
    top: 48,
    backgroundColor: theme.colors.success,
  },
  snowText: {
    color: theme.colors.snow,
    fontWeight: 'bold',
    fontSize: 12,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.mountain,
    fontSize: 16,
    textAlign: 'center',
  }
});

export default SimpleExploreScreen;