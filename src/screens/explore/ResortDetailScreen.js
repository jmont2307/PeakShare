import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Appbar, ActivityIndicator, Chip, Button, Card, Title, Paragraph } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResortDetails } from '../../redux/slices/resortsSlice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');
const POST_WIDTH = width / 3 - 4;

const PostThumbnail = ({ post, onPress }) => {
  return (
    <TouchableOpacity style={styles.postThumbnail} onPress={onPress}>
      <Image 
        source={{ uri: post.imageUrls[0] }} 
        style={styles.thumbnailImage} 
      />
    </TouchableOpacity>
  );
};

const WeatherCard = ({ weather }) => {
  if (!weather) return null;
  
  return (
    <Card style={styles.weatherCard}>
      <Card.Content>
        <Title>Current Conditions</Title>
        <View style={styles.weatherContent}>
          <MaterialCommunityIcons 
            name={getWeatherIcon(weather.conditions)} 
            size={50} 
            color="#0066CC" 
          />
          <View style={styles.weatherDetails}>
            <Text style={styles.temperature}>{Math.round(weather.temperature)}°C</Text>
            <Text style={styles.conditions}>{weather.conditions}</Text>
            <Text style={styles.windSpeed}>Wind: {weather.windSpeed} km/h</Text>
            <Text style={styles.humidity}>Humidity: {weather.humidity}%</Text>
          </View>
        </View>
        {weather.snowfall > 0 && (
          <View style={styles.snowfallContainer}>
            <MaterialCommunityIcons name="snowflake" size={20} color="#0066CC" />
            <Text style={styles.snowfall}>Recent snowfall: {weather.snowfall}cm</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const getWeatherIcon = (conditions) => {
  const conditionsLower = conditions.toLowerCase();
  
  if (conditionsLower.includes('snow')) return 'weather-snowy';
  if (conditionsLower.includes('rain')) return 'weather-rainy';
  if (conditionsLower.includes('cloud')) return 'weather-cloudy';
  if (conditionsLower.includes('clear') || conditionsLower.includes('sun')) return 'weather-sunny';
  return 'weather-partly-cloudy';
};

const ResortInfoCard = ({ resort }) => {
  return (
    <Card style={styles.infoCard}>
      <Card.Content>
        <Title>Resort Info</Title>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
          <Text style={styles.infoText}>
            {resort.location?.region}, {resort.location?.country}
          </Text>
        </View>
        {resort.elevation && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="elevation-rise" size={20} color="#666" />
            <Text style={styles.infoText}>
              Elevation: {resort.elevation.base}m - {resort.elevation.peak}m
            </Text>
          </View>
        )}
        {resort.trails && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="ski" size={20} color="#666" />
            <Text style={styles.infoText}>
              Trails: {resort.trails} ({resort.difficulty?.easy || 0}% Easy, 
              {resort.difficulty?.intermediate || 0}% Intermediate, 
              {resort.difficulty?.advanced || 0}% Advanced)
            </Text>
          </View>
        )}
        <View style={styles.tagsContainer}>
          {(resort.tags || ['Skiing', 'Snowboarding', 'Winter']).map((tag, index) => (
            <Chip key={index} style={styles.tag}>{tag}</Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

const ResortDetailScreen = ({ route, navigation }) => {
  const { resortId } = route.params;
  const dispatch = useDispatch();
  const { currentResort, loading, error } = useSelector((state) => state.resorts);
  
  useEffect(() => {
    dispatch(fetchResortDetails(resortId));
  }, [dispatch, resortId]);
  
  if (loading && !currentResort) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading resort details: {error}</Text>
        <Button mode="contained" onPress={() => dispatch(fetchResortDetails(resortId))}>
          Retry
        </Button>
      </View>
    );
  }
  
  if (!currentResort) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Resort not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={currentResort.name} />
        <Appbar.Action icon="share-variant" onPress={() => {}} />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        <Image 
          source={{ uri: currentResort.imageUrl || 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }} 
          style={styles.headerImage} 
        />
        
        <View style={styles.contentContainer}>
          <Text style={styles.resortName}>{currentResort.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="image-multiple" size={16} color="#666" />
              <Text style={styles.statText}>{currentResort.postCount || 0} Posts</Text>
            </View>
            {currentResort.lifts && (
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="ski-lift" size={16} color="#666" />
                <Text style={styles.statText}>{currentResort.lifts} Lifts</Text>
              </View>
            )}
            {currentResort.lastSnowfall && (
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="snowflake" size={16} color="#666" />
                <Text style={styles.statText}>
                  Snow: {format(new Date(currentResort.lastSnowfall), 'MMM d')}
                </Text>
              </View>
            )}
          </View>
          
          <WeatherCard weather={currentResort.weather} />
          
          <ResortInfoCard resort={currentResort} />
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Posts</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {currentResort.posts && currentResort.posts.length > 0 ? (
            <FlatList
              data={currentResort.posts}
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
              <Text style={styles.emptyPostsText}>No posts for this resort yet</Text>
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
  scrollView: {
    flex: 1,
  },
  headerImage: {
    width: '100%',
    height: 200,
  },
  contentContainer: {
    padding: 16,
  },
  resortName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    color: '#666',
  },
  weatherCard: {
    marginBottom: 16,
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  weatherDetails: {
    marginLeft: 16,
  },
  temperature: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  conditions: {
    fontSize: 16,
    marginBottom: 4,
  },
  windSpeed: {
    fontSize: 14,
    color: '#666',
  },
  humidity: {
    fontSize: 14,
    color: '#666',
  },
  snowfallContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#e1f5fe',
    padding: 8,
    borderRadius: 8,
  },
  snowfall: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#0277bd',
  },
  infoCard: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    margin: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#0066CC',
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

export default ResortDetailScreen;