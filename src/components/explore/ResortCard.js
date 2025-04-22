import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

const ResortCard = ({ resort, onPress }) => {
  // Calculate difficulty distribution
  const difficultyPercentage = {
    beginner: resort.trails?.beginner || 30,
    intermediate: resort.trails?.intermediate || 40,
    advanced: resort.trails?.advanced || 20,
    expert: resort.trails?.expert || 10,
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      {resort.imageUrl && (
        <Card.Cover 
          source={{ uri: resort.imageUrl }} 
          style={styles.coverImage} 
          resizeMode="cover"
        />
      )}
      
      <Card.Content style={styles.content}>
        <Text style={styles.resortName}>{resort.name}</Text>
        
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={theme.colors.primary} />
          <Text style={styles.location}>{resort.location}</Text>
        </View>
        
        {resort.elevation && (
          <View style={styles.detailRow}>
            <Ionicons name="trending-up" size={16} color={theme.colors.midnight} />
            <Text style={styles.detailText}>
              Elevation: {resort.elevation}
            </Text>
          </View>
        )}
        
        {resort.totalTrails && (
          <View style={styles.detailRow}>
            <Ionicons name="map-outline" size={16} color={theme.colors.midnight} />
            <Text style={styles.detailText}>
              {resort.totalTrails} trails
            </Text>
          </View>
        )}
        
        <View style={styles.difficultyContainer}>
          <View style={[styles.difficultyBar, styles.beginnerBar, { flex: difficultyPercentage.beginner }]} />
          <View style={[styles.difficultyBar, styles.intermediateBar, { flex: difficultyPercentage.intermediate }]} />
          <View style={[styles.difficultyBar, styles.advancedBar, { flex: difficultyPercentage.advanced }]} />
          <View style={[styles.difficultyBar, styles.expertBar, { flex: difficultyPercentage.expert }]} />
        </View>
        
        <View style={styles.tagsContainer}>
          {resort.tags && resort.tags.map((tag, index) => (
            <Chip 
              key={index} 
              style={styles.tag} 
              textStyle={styles.tagText}
              compact
            >
              {tag}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  coverImage: {
    height: 140,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  content: {
    paddingVertical: 12,
  },
  resortName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: theme.colors.midnight,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: theme.colors.primary,
    marginLeft: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 6,
    color: theme.colors.midnight,
  },
  difficultyContainer: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 10,
  },
  difficultyBar: {
    height: '100%',
  },
  beginnerBar: {
    backgroundColor: '#4CAF50', // Green
  },
  intermediateBar: {
    backgroundColor: '#2196F3', // Blue
  },
  advancedBar: {
    backgroundColor: '#FF9800', // Orange
  },
  expertBar: {
    backgroundColor: '#F44336', // Red
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: theme.colors.surface,
    marginRight: 6,
    marginBottom: 6,
    height: 24,
  },
  tagText: {
    fontSize: 12,
  },
});

export default ResortCard;