import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Appbar, Text, Chip, Searchbar, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ResortCard from '../../components/explore/ResortCard';
import { theme } from '../../theme';

// Comprehensive list of ski resorts
const SKI_RESORTS = [
  {
    id: '1',
    name: 'Vail',
    location: 'Colorado, USA',
    elevation: '3,527m',
    totalTrails: 195,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Vail_Colorado.jpg/1024px-Vail_Colorado.jpg',
    trails: { beginner: 18, intermediate: 29, advanced: 30, expert: 23 },
    tags: ['Epic Pass', 'Luxury', 'Family-Friendly']
  },
  {
    id: '2',
    name: 'Whistler Blackcomb',
    location: 'British Columbia, Canada',
    elevation: '2,182m',
    totalTrails: 200,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Whistler_Village_Winter.jpg/1024px-Whistler_Village_Winter.jpg',
    trails: { beginner: 20, intermediate: 35, advanced: 35, expert: 10 },
    tags: ['Epic Pass', 'Terrain Parks', 'Night Skiing']
  },
  {
    id: '3',
    name: 'Park City',
    location: 'Utah, USA',
    elevation: '3,048m',
    totalTrails: 341,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Park_City_Mountain_Resort_-_panoramio_%281%29.jpg/1024px-Park_City_Mountain_Resort_-_panoramio_%281%29.jpg',
    trails: { beginner: 17, intermediate: 52, advanced: 31 },
    tags: ['Epic Pass', 'Après-Ski', 'Family-Friendly']
  },
  {
    id: '4',
    name: 'Aspen Snowmass',
    location: 'Colorado, USA',
    elevation: '3,813m',
    totalTrails: 336,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Aspen_Snowmass.jpg/1024px-Aspen_Snowmass.jpg',
    trails: { beginner: 15, intermediate: 44, advanced: 24, expert: 17 },
    tags: ['Ikon Pass', 'Luxury', 'Backcountry']
  },
  {
    id: '5',
    name: 'Zermatt',
    location: 'Switzerland',
    elevation: '3,883m',
    totalTrails: 145,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/2012-08-17_15-16-45_Switzerland_Kanton_Wallis_Zermatt.jpg/1024px-2012-08-17_15-16-45_Switzerland_Kanton_Wallis_Zermatt.jpg',
    trails: { beginner: 20, intermediate: 40, advanced: 25, expert: 15 },
    tags: ['Glacier Skiing', 'Alpine', 'International']
  },
  {
    id: '6',
    name: 'Breckenridge',
    location: 'Colorado, USA',
    elevation: '3,962m',
    totalTrails: 187,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Breckenridge_with_snow.jpg/1024px-Breckenridge_with_snow.jpg',
    trails: { beginner: 14, intermediate: 31, advanced: 19, expert: 36 },
    tags: ['Epic Pass', 'High Altitude', 'Terrain Parks']
  },
  {
    id: '7',
    name: 'Chamonix',
    location: 'France',
    elevation: '3,842m',
    totalTrails: 118,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Mont_Blanc_and_Dome_du_Gouter.jpg/1024px-Mont_Blanc_and_Dome_du_Gouter.jpg',
    trails: { beginner: 12, intermediate: 29, advanced: 34, expert: 25 },
    tags: ['Alpine', 'Backcountry', 'Expert Terrain']
  },
  {
    id: '8',
    name: 'Niseko',
    location: 'Hokkaido, Japan',
    elevation: '1,308m',
    totalTrails: 61,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Mt.youtei_and_Niseko_annupuri.jpg/1024px-Mt.youtei_and_Niseko_annupuri.jpg',
    trails: { beginner: 30, intermediate: 40, advanced: 30 },
    tags: ['Powder', 'International', 'Night Skiing']
  },
  {
    id: '9',
    name: 'Jackson Hole',
    location: 'Wyoming, USA',
    elevation: '3,185m',
    totalTrails: 131,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Jackson_Hole_aerial_view_-_November_2013.jpg/1024px-Jackson_Hole_aerial_view_-_November_2013.jpg',
    trails: { beginner: 10, intermediate: 40, advanced: 20, expert: 30 },
    tags: ['Ikon Pass', 'Backcountry', 'Extreme Terrain']
  },
  {
    id: '10',
    name: 'Mammoth Mountain',
    location: 'California, USA',
    elevation: '3,369m',
    totalTrails: 150,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/2015-11-20_09_24_07_View_of_Mammoth_Mountain_from_near_the_base_of_the_Panorama_Gondola_in_Mammoth_Lakes%2C_California.jpg/1024px-2015-11-20_09_24_07_View_of_Mammoth_Mountain_from_near_the_base_of_the_Panorama_Gondola_in_Mammoth_Lakes%2C_California.jpg',
    trails: { beginner: 25, intermediate: 40, advanced: 20, expert: 15 },
    tags: ['Ikon Pass', 'Spring Skiing', 'Terrain Parks']
  },
  {
    id: '11',
    name: 'Squaw Valley Alpine Meadows',
    location: 'California, USA',
    elevation: '2,760m',
    totalTrails: 270,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Squaw_Valley_Aerial.JPG/1024px-Squaw_Valley_Aerial.JPG',
    trails: { beginner: 25, intermediate: 45, advanced: 20, expert: 10 },
    tags: ['Ikon Pass', 'Olympic Heritage', 'Views']
  },
  {
    id: '12',
    name: 'Verbier',
    location: 'Switzerland',
    elevation: '3,330m',
    totalTrails: 80,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Verbier_Panorama.jpg/1024px-Verbier_Panorama.jpg',
    trails: { beginner: 20, intermediate: 30, advanced: 30, expert: 20 },
    tags: ['Alpine', 'Luxury', 'Off-piste']
  },
  {
    id: '13',
    name: 'Steamboat',
    location: 'Colorado, USA',
    elevation: '3,221m',
    totalTrails: 165,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Steamboat_Springs_CO.jpg/1024px-Steamboat_Springs_CO.jpg',
    trails: { beginner: 14, intermediate: 42, advanced: 28, expert: 16 },
    tags: ['Ikon Pass', 'Tree Skiing', 'Family-Friendly']
  },
  {
    id: '14',
    name: 'Copper Mountain',
    location: 'Colorado, USA',
    elevation: '3,753m',
    totalTrails: 126,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Copper_Mountain_Colorado.jpg',
    trails: { beginner: 21, intermediate: 25, advanced: 36, expert: 18 },
    tags: ['Ikon Pass', 'Naturally Divided Terrain', 'Superpipe']
  },
  {
    id: '15',
    name: 'Big Sky',
    location: 'Montana, USA',
    elevation: '3,403m',
    totalTrails: 317,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Montana_Lone_Peak.jpg/1024px-Montana_Lone_Peak.jpg',
    trails: { beginner: 15, intermediate: 25, advanced: 42, expert: 18 },
    tags: ['Ikon Pass', 'Big Mountain', 'Lone Peak']
  }
];

const ResortListScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filteredResorts, setFilteredResorts] = useState(SKI_RESORTS);
  const [loading, setLoading] = useState(false);
  
  // Available filter tags
  const filterOptions = [
    { id: 'epic', label: 'Epic Pass' },
    { id: 'ikon', label: 'Ikon Pass' },
    { id: 'family', label: 'Family-Friendly' },
    { id: 'terrain', label: 'Terrain Parks' },
    { id: 'expert', label: 'Expert Terrain' },
    { id: 'backcountry', label: 'Backcountry' },
    { id: 'international', label: 'International' }
  ];
  
  // Filter resorts based on search query and selected filters
  useEffect(() => {
    setLoading(true);
    
    let results = [...SKI_RESORTS];
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(resort => 
        // Search by name
        (resort.name && resort.name.toLowerCase().includes(query)) || 
        // Search by location
        (resort.location && resort.location.toLowerCase().includes(query)) ||
        // Search by country (if specified)
        (resort.country && resort.country.toLowerCase().includes(query)) ||
        // Search by region (if specified)
        (resort.region && resort.region.toLowerCase().includes(query)) ||
        // Search in tags (if they exist)
        (resort.tags && resort.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply tag filters
    if (selectedFilters.length > 0) {
      results = results.filter(resort => {
        if (!resort.tags) return false;
        
        return selectedFilters.some(filter => {
          if (filter === 'epic') return resort.tags.includes('Epic Pass');
          if (filter === 'ikon') return resort.tags.includes('Ikon Pass');
          if (filter === 'family') return resort.tags.includes('Family-Friendly');
          if (filter === 'terrain') return resort.tags.includes('Terrain Parks');
          if (filter === 'expert') return resort.tags.includes('Expert Terrain');
          if (filter === 'backcountry') return resort.tags.includes('Backcountry');
          if (filter === 'international') return resort.tags.includes('International');
          return false;
        });
      });
    }
    
    // Using setTimeout to simulate a real API fetch
    setTimeout(() => {
      setFilteredResorts(results);
      setLoading(false);
    }, 300);
  }, [searchQuery, selectedFilters]);
  
  const handleResortPress = (resort) => {
    navigation.navigate('ResortDetail', { resort });
  };
  
  const toggleFilter = (filterId) => {
    setSelectedFilters(prev => {
      if (prev.includes(filterId)) {
        return prev.filter(id => id !== filterId);
      } else {
        return [...prev, filterId];
      }
    });
  };
  
  const clearFilters = () => {
    setSelectedFilters([]);
    setSearchQuery('');
  };
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Ski Resorts" />
      </Appbar.Header>
      
      <Searchbar
        placeholder="Search resorts by name or location"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {filterOptions.map(filter => (
            <Chip
              key={filter.id}
              selected={selectedFilters.includes(filter.id)}
              onPress={() => toggleFilter(filter.id)}
              style={styles.filterChip}
              selectedColor={theme.colors.primary}
            >
              {filter.label}
            </Chip>
          ))}
        </ScrollView>
        
        {(selectedFilters.length > 0 || searchQuery) && (
          <Button 
            mode="text" 
            onPress={clearFilters}
            style={styles.clearButton}
            labelStyle={styles.clearButtonLabel}
          >
            Clear
          </Button>
        )}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredResorts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ResortCard resort={item} onPress={() => handleResortPress(item)} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="snow-outline" size={60} color={theme.colors.silver} />
              <Text style={styles.emptyText}>No resorts found</Text>
              <Text style={styles.emptySubText}>Try adjusting your search or filters</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchBar: {
    margin: 12,
    elevation: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  filtersScroll: {
    flex: 1,
  },
  filtersContent: {
    paddingRight: 12,
  },
  filterChip: {
    marginRight: 8,
  },
  clearButton: {
    marginLeft: 8,
  },
  clearButtonLabel: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.mountain,
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.mountain,
    textAlign: 'center',
  },
});

export default ResortListScreen;