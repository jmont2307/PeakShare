import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

/**
 * EmptyFeed component - shown when the user's feed has no posts
 * @param {Object} props - Component props
 * @param {Function} props.onExplore - Function to navigate to explore screen
 * @param {Function} props.onCreatePost - Function to navigate to create post screen
 */
const EmptyFeed = ({ onExplore, onCreatePost }) => {
  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&auto=format&fit=crop' }} 
        style={styles.illustration}
      />
      
      <Text style={styles.title}>Your feed is empty</Text>
      <Text style={styles.subtitle}>
        Follow other skiers and snowboarders to see their posts in your feed
      </Text>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={onExplore}
        >
          <Ionicons name="compass-outline" size={20} color={theme.colors.snow} style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>Explore Resorts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={onCreatePost}
        >
          <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} style={styles.buttonIcon} />
          <Text style={styles.secondaryButtonText}>Create Post</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tipContainer}>
        <Ionicons name="snow-outline" size={24} color={theme.colors.primary} />
        <Text style={styles.tipText}>
          Share your ski adventures and connect with the community
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  illustration: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.midnight,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.mountain,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'column',
    width: '100%',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: theme.colors.snow,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  tipText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: theme.colors.mountain,
    lineHeight: 20,
  },
});

export default EmptyFeed;