import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { db as firestore } from '../../firebase';
import { theme } from '../../theme';

const StoryCircle = ({ user, onPress, hasNewStory }) => {
  return (
    <TouchableOpacity style={styles.storyContainer} onPress={onPress}>
      <View style={styles.storyCircleWrapper}>
        {hasNewStory ? (
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.skyBlue, theme.colors.deepBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
            cacheEnabled={true}
          >
            <View style={styles.storyCircleInner}>
              <Avatar.Image 
                source={{ uri: user.profileImageUrl || 'https://via.placeholder.com/70' }} 
                size={56} 
                style={styles.storyAvatar}
              />
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.storyCircle, styles.inactiveStoryBorder]}>
            <Avatar.Image 
              source={{ uri: user.profileImageUrl || 'https://via.placeholder.com/70' }} 
              size={56} 
              style={styles.storyAvatar}
            />
          </View>
        )}
      </View>
      <Text style={styles.storyUsername} numberOfLines={1} ellipsizeMode="tail">
        {user.username}
      </Text>
    </TouchableOpacity>
  );
};

const SnowReport = ({ resort, onPress }) => {
  return (
    <TouchableOpacity style={styles.snowReportContainer} onPress={onPress}>
      <View style={styles.storyCircleWrapper}>
        <LinearGradient
          colors={[theme.colors.glacier, theme.colors.skyBlue, theme.colors.deepBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
          cacheEnabled={true}
        >
          <View style={styles.storyCircleInner}>
            <Image 
              source={{ uri: resort.imageUrl }} 
              style={styles.snowReportImage} 
            />
          </View>
        </LinearGradient>
        <View style={styles.snowBadge}>
          <Text style={styles.snowText}>{resort.newSnow}"</Text>
        </View>
      </View>
      <Text style={styles.resortName} numberOfLines={1} ellipsizeMode="tail">
        {resort.name}
      </Text>
    </TouchableOpacity>
  );
};

const StoriesRow = () => {
  const { userData } = useSelector((state) => state.user);
  const [following, setFollowing] = useState([]);
  const [resorts, setResorts] = useState([]);
  
  useEffect(() => {
    if (userData?.uid) {
      // Fetch mock following users for demo purposes
      const fetchMockData = async () => {
        // Mock following users
        const mockFollowing = [
          {
            id: '1',
            username: 'skiPro1',
            profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60',
            hasNewStory: true
          },
          {
            id: '2',
            username: 'powderGirl',
            profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60',
            hasNewStory: true
          },
          {
            id: '3',
            username: 'alpineRider',
            profileImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60',
            hasNewStory: false
          },
          {
            id: '4',
            username: 'mountainHigh',
            profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60',
            hasNewStory: true
          }
        ];
        
        setFollowing(mockFollowing);
        
        // Mock resort data
        const mockResorts = [
          {
            id: '1',
            name: 'Whistler Blackcomb',
            imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60',
            newSnow: 5
          },
          {
            id: '2',
            name: 'Aspen Snowmass',
            imageUrl: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60',
            newSnow: 3
          },
          {
            id: '3',
            name: 'Park City',
            imageUrl: 'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60',
            newSnow: 8
          }
        ];
        
        setResorts(mockResorts);
      };
      
      fetchMockData();
    }
  }, [userData]);
  
  // If there are no stories or snow reports to show, don't render anything
  if (following.length === 0 && resorts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Your Story */}
        {userData && (
          <StoryCircle 
            user={{
              username: 'Your Story',
              profileImageUrl: userData.profileImageUrl
            }}
            onPress={() => {}}
            hasNewStory={false}
          />
        )}
        
        {/* Following Stories */}
        {following.map((user) => (
          <StoryCircle 
            key={user.id}
            user={user}
            onPress={() => {}}
            hasNewStory={user.hasNewStory}
          />
        ))}
        
        {/* Resort Snow Reports */}
        {resorts.map((resort) => (
          <SnowReport 
            key={resort.id}
            resort={resort}
            onPress={() => {}}
          />
        ))}
      </ScrollView>
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    backgroundColor: theme.colors.snow,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  storyContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 72,
  },
  storyCircleWrapper: {
    position: 'relative',
  },
  gradientBorder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyCircleInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.snow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.snow,
  },
  storyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  storyAvatar: {
    backgroundColor: theme.colors.snow,
  },
  inactiveStoryBorder: {
    borderWidth: 2,
    borderColor: theme.colors.silver,
  },
  storyUsername: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    color: theme.colors.midnight,
  },
  snowReportContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 72,
  },
  snowReportImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  snowBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.deepBlue,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: theme.colors.snow,
  },
  snowText: {
    color: theme.colors.snow,
    fontSize: 10,
    fontWeight: 'bold',
  },
  resortName: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    color: theme.colors.midnight,
  },
  divider: {
    height: 0.5,
    backgroundColor: theme.colors.silver,
    marginTop: 8,
  },
});

export default StoriesRow;