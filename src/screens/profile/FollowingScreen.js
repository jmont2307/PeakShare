import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity
} from 'react-native';
import {
  Appbar,
  Text,
  ActivityIndicator,
  Button,
  Searchbar,
  Divider
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../contexts/AuthContext';
import { fetchUserFollowing, followUser, unfollowUser } from '../../redux/slices/userSlice';

const UserItem = ({ user, currentUserId, onPress, onFollow, onUnfollow }) => {
  const isFollowing = user.isFollowedByMe || true; // Assuming anyone in the following list is being followed
  const isCurrentUser = user.id === currentUserId;

  return (
    <View style={styles.userItem}>
      <TouchableOpacity style={styles.userInfoContainer} onPress={() => onPress(user)}>
        <Image
          source={{ uri: user.profileImageUrl || 'https://via.placeholder.com/50' }}
          style={styles.userAvatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.displayName}</Text>
          <Text style={styles.userUsername}>@{user.username}</Text>
        </View>
      </TouchableOpacity>

      {!isCurrentUser && (
        <Button
          mode={isFollowing ? "outlined" : "contained"}
          compact
          onPress={() => isFollowing ? onUnfollow(user.id) : onFollow(user.id)}
          style={isFollowing ? styles.unfollowButton : styles.followButton}
          labelStyle={isFollowing ? styles.unfollowButtonLabel : styles.followButtonLabel}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      )}
    </View>
  );
};

const FollowingScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const { following, loading } = useSelector((state) => state.user);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFollowing, setFilteredFollowing] = useState([]);
  
  // Get userId from route params or use current user id
  const userId = route.params?.userId || user.uid;

  useEffect(() => {
    dispatch(fetchUserFollowing(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    if (following) {
      if (searchQuery) {
        setFilteredFollowing(
          following.filter(followedUser => 
            followedUser.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            followedUser.username.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      } else {
        setFilteredFollowing(following);
      }
    }
  }, [following, searchQuery]);

  const handleUserPress = (selectedUser) => {
    if (selectedUser.id === user.uid) {
      // Navigate to current user's profile
      navigation.navigate('Profile');
    } else {
      // Navigate to other user's profile
      navigation.navigate('OtherUserProfile', { userId: selectedUser.id });
    }
  };

  const handleFollow = (followUserId) => {
    dispatch(followUser(followUserId));
  };

  const handleUnfollow = (unfollowUserId) => {
    dispatch(unfollowUser(unfollowUserId));
  };

  const onChangeSearch = (query) => setSearchQuery(query);

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery ? 'No users match your search' : 'Not following anyone yet'}
      </Text>
      {!searchQuery && (
        <Text style={styles.emptySubText}>
          Follow other skiers to see their posts
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Following" />
      </Appbar.Header>

      <Searchbar
        placeholder="Search following"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      ) : (
        <FlatList
          data={filteredFollowing}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserItem
              user={item}
              currentUserId={user.uid}
              onPress={handleUserPress}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
            />
          )}
          ItemSeparatorComponent={() => <Divider />}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={filteredFollowing.length === 0 && styles.emptyListContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    margin: 8,
    borderRadius: 8,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
  },
  followButton: {
    backgroundColor: '#0066CC',
    borderRadius: 4,
    minWidth: 80,
  },
  followButtonLabel: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  unfollowButton: {
    borderColor: '#0066CC',
    borderRadius: 4,
    minWidth: 80,
  },
  unfollowButtonLabel: {
    color: '#0066CC',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  emptyListContent: {
    flexGrow: 1,
  },
});

export default FollowingScreen;