import React, { useEffect, useContext } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Appbar, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { AuthContext } from '../../contexts/AuthContext';
import { fetchFeed } from '../../redux/slices/feedSlice';
import PostCard from '../../components/feed/PostCard';
import EmptyFeed from '../../components/feed/EmptyFeed';
import StoriesRow from '../../components/feed/StoriesRow';
import { theme } from '../../theme';

const FeedScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const { posts, loading, error } = useSelector((state) => state.feed);

  useEffect(() => {
    if (user) {
      dispatch(fetchFeed(user.uid));
    }
  }, [dispatch, user]);

  const handleRefresh = () => {
    if (user) {
      dispatch(fetchFeed(user.uid));
    }
  };

  const renderItem = ({ item }) => (
    <PostCard 
      post={item}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.logoText}>PeakShare</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('NewPost')}>
            <Ionicons name="add-circle-outline" size={26} color={theme.colors.midnight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => alert('Messages feature coming soon')}>
            <Ionicons name="paper-plane-outline" size={24} color={theme.colors.midnight} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
        ListHeaderComponent={<StoriesRow />}
        ListEmptyComponent={
          !loading ? <EmptyFeed /> : null
        }
      />

      {loading && posts.length === 0 && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.silver,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.deepBlue,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  loaderContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FeedScreen;