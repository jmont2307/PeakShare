import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import {
  Appbar,
  Divider,
  Chip,
  Banner,
  Button
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserPosts } from '../../redux/slices/postsSlice';
import { AuthContext } from '../../contexts/AuthContext';
import { theme } from '../../theme';
import PostCard from '../../components/feed/PostCard';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

// Custom component to show interaction stats
const InteractionStats = ({ post }) => (
  <View style={styles.statsContainer}>
    <View style={styles.statItem}>
      <Ionicons name="heart" size={18} color={theme.colors.error} />
      <Text style={styles.statText}>{post.likeCount || 0} likes</Text>
    </View>
    <View style={styles.statItem}>
      <Ionicons name="chatbubble-outline" size={18} color={theme.colors.mountain} />
      <Text style={styles.statText}>{post.commentCount || 0} comments</Text>
    </View>
    <View style={styles.statItem}>
      <Ionicons name="time-outline" size={18} color={theme.colors.mountain} />
      <Text style={styles.statText}>
        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
      </Text>
    </View>
  </View>
);

const PostHistoryScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const { userPosts, loading } = useSelector((state) => state.posts);
  
  const [filter, setFilter] = useState('all');
  const [sortedPosts, setSortedPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Get userId from route params or use current user id
  const userId = route.params?.userId || user?.uid;

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserPosts(userId));
    }
  }, [dispatch, userId]);

  // Sort and filter posts when userPosts changes
  useEffect(() => {
    if (!userPosts || userPosts.length === 0) {
      setSortedPosts([]);
      return;
    }

    let filtered = [...userPosts];

    // Apply filters
    if (filter === 'popular') {
      filtered = filtered.filter(post => (post.likeCount || 0) > 5);
    } else if (filter === 'commented') {
      filtered = filtered.filter(post => (post.commentCount || 0) > 0);
    } else if (filter === 'resorts') {
      filtered = filtered.filter(post => post.location && post.location.name);
    }

    // Sort posts by date (newest first)
    filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setSortedPosts(filtered);
  }, [userPosts, filter]);

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(fetchUserPosts(userId)).then(() => {
      setRefreshing(false);
    });
  };

  const handlePostPress = (post) => {
    navigation.navigate('PostDetail', { post });
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <PostCard post={item} onPress={() => handlePostPress(item)} />
      <InteractionStats post={item} />
      <Divider style={styles.divider} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Post History" />
      </Appbar.Header>

      {/* Filter chips */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip 
            selected={filter === 'all'} 
            onPress={() => setFilter('all')}
            style={styles.filterChip}
          >
            All Posts
          </Chip>
          <Chip 
            selected={filter === 'popular'} 
            onPress={() => setFilter('popular')}
            style={styles.filterChip}
          >
            Popular
          </Chip>
          <Chip 
            selected={filter === 'commented'} 
            onPress={() => setFilter('commented')}
            style={styles.filterChip}
          >
            With Comments
          </Chip>
          <Chip 
            selected={filter === 'resorts'} 
            onPress={() => setFilter('resorts')}
            style={styles.filterChip}
          >
            At Resorts
          </Chip>
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : sortedPosts.length > 0 ? (
        <FlatList
          data={sortedPosts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Banner
              visible={true}
              actions={[]}
              icon={({ size }) => <Ionicons name="information-circle-outline" size={size} color={theme.colors.primary} />}
            >
              Here's your post history showing all interactions
            </Banner>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={60} color={theme.colors.silver} />
          <Text style={styles.emptyText}>No posts found</Text>
          {filter !== 'all' && (
            <Text style={styles.emptySubText}>Try changing the filter</Text>
          )}
          <Button 
            mode="contained" 
            icon="plus" 
            onPress={() => navigation.navigate('NewPost')}
            style={styles.newPostButton}
          >
            Create New Post
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
  },
  filterChip: {
    marginRight: 8,
    height: 36,
  },
  listContent: {
    paddingBottom: 16,
  },
  postContainer: {
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: theme.colors.midnight,
  },
  divider: {
    height: 8,
    backgroundColor: theme.colors.ice,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: theme.colors.mountain,
  },
  emptySubText: {
    fontSize: 16,
    color: theme.colors.mountain,
    marginTop: 8,
    marginBottom: 16,
  },
  newPostButton: {
    marginTop: 24,
  },
});

export default PostHistoryScreen;