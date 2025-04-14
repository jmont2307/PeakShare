import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { theme } from '../../theme';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Demo stories data (will be replaced with actual data from Firestore)
const DEMO_STORIES = [
  {
    id: 'user-story',
    isCurrentUser: true,
    hasNewStory: false,
    username: 'You',
    profileImageUrl: null,
    viewed: false,
  },
  {
    id: '1',
    userId: 'user1',
    username: 'alpine_skier',
    profileImageUrl: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=200&auto=format&fit=crop',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    viewed: false,
  },
  {
    id: '2',
    userId: 'user2',
    username: 'powder_hound',
    profileImageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&auto=format&fit=crop',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    viewed: false,
  },
  {
    id: '3',
    userId: 'user3',
    username: 'ski_bum',
    profileImageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&auto=format&fit=crop',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    viewed: true,
  },
  {
    id: '4',
    userId: 'user4',
    username: 'snow_rider',
    profileImageUrl: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=200&auto=format&fit=crop',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    viewed: false,
  },
  {
    id: '5',
    userId: 'user5',
    username: 'peak_explorer',
    profileImageUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    viewed: true,
  },
];

/**
 * Story item component - individual story circle
 */
const StoryItem = ({ story, onPress, currentUser }) => {
  // If it's the current user's story item and they don't have a profile image
  const displayImage = story.isCurrentUser && !story.profileImageUrl && currentUser?.profileImageUrl
    ? { uri: currentUser.profileImageUrl }
    : { uri: story.profileImageUrl || 'https://via.placeholder.com/100' };

  return (
    <TouchableOpacity style={styles.storyItem} onPress={() => onPress(story)}>
      {!story.viewed ? (
        <LinearGradient
          colors={['#0066CC', '#00CCFF']}
          style={styles.storyRing}
        >
          <View style={styles.storyImageContainer}>
            <Image
              source={displayImage}
              style={styles.storyImage}
            />
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.storyRingViewed}>
          <View style={styles.storyImageContainer}>
            <Image
              source={displayImage}
              style={styles.storyImage}
            />
          </View>
        </View>
      )}

      {story.isCurrentUser && (
        <View style={styles.addStoryBadge}>
          <Ionicons name="add-circle" size={18} color={theme.colors.primary} />
        </View>
      )}

      <Text style={styles.storyUsername} numberOfLines={1}>
        {story.isCurrentUser ? 'Your story' : story.username}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * StoriesRow component - horizontal scrolling row of user stories
 */
const StoriesRow = () => {
  const navigation = useNavigation();
  const { user, userData } = useContext(AuthContext);
  const [stories, setStories] = useState(DEMO_STORIES);

  // In a real app, we would fetch actual stories from Firestore
  useEffect(() => {
    const fetchStories = async () => {
      if (!user) return;

      try {
        // Here we would normally fetch real stories from users the current user follows
        // For now, we'll just update the demo data with the current user's info
        
        if (userData) {
          setStories(prevStories => {
            // Find the current user's story item
            const updatedStories = [...prevStories];
            const currentUserStoryIndex = updatedStories.findIndex(s => s.isCurrentUser);
            
            if (currentUserStoryIndex !== -1) {
              updatedStories[currentUserStoryIndex] = {
                ...updatedStories[currentUserStoryIndex],
                username: userData.username || 'You',
                profileImageUrl: userData.profileImageUrl || null,
              };
            }
            
            return updatedStories;
          });
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      }
    };

    fetchStories();
  }, [user, userData]);

  const handleStoryPress = (story) => {
    if (story.isCurrentUser) {
      // Navigate to create story/post screen
      navigation.navigate('NewPost');
    } else {
      // In a real app, this would navigate to a story viewer
      // For now, navigate to the user's profile
      navigation.navigate('Profile', { userId: story.userId });
    }

    // Mark as viewed in local state
    setStories(prevStories => 
      prevStories.map(s => 
        s.id === story.id ? { ...s, viewed: true } : s
      )
    );
  };

  // If no user is logged in, don't show the stories row
  if (!user) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {stories.map(story => (
          <StoryItem
            key={story.id}
            story={story}
            onPress={handleStoryPress}
            currentUser={userData}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.silver,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 12,
    width: 70,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyRingViewed: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.silver,
  },
  storyImageContainer: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyUsername: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    color: theme.colors.midnight,
  },
  addStoryBadge: {
    position: 'absolute',
    bottom: 20,
    right: 0,
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 2,
  },
});

export default StoriesRow;