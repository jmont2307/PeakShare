import React, { useEffect, useContext, useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, RefreshControl, Image, TouchableOpacity, Modal, FlatList as ModalFlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Appbar, Text, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { AuthContext } from '../../contexts/AuthContext';
import { fetchFeed } from '../../redux/slices/feedSlice';
import PostCard from '../../components/feed/PostCard';
import EmptyFeed from '../../components/feed/EmptyFeed';
import { theme } from '../../theme';

const FeedScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, userData, savedAccounts, switchAccount } = useContext(AuthContext);
  const { posts, loading, error } = useSelector((state) => state.feed);
  const [accountSwitcherVisible, setAccountSwitcherVisible] = useState(false);

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
  
  const toggleAccountSwitcher = () => {
    setAccountSwitcherVisible(!accountSwitcherVisible);
  };
  
  const handleAccountSwitch = (accountId) => {
    switchAccount(accountId);
    setAccountSwitcherVisible(false);
  };

  const renderItem = ({ item }) => (
    <PostCard 
      post={item}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    />
  );

  const renderAccount = ({ item }) => (
    <TouchableOpacity 
      style={styles.accountItem}
      onPress={() => handleAccountSwitch(item.uid)}
    >
      <Avatar.Image 
        size={60} 
        source={{ uri: item.profileImageUrl || 'https://via.placeholder.com/60' }} 
      />
      <View style={styles.accountInfo}>
        <Text style={styles.accountUsername}>{item.username}</Text>
        <Text style={styles.accountName}>{item.displayName}</Text>
      </View>
      {userData && userData.uid === item.uid && (
        <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleAccountSwitcher} style={styles.accountSwitcher}>
          <Text style={styles.logoText}>PeakShare</Text>
          <Ionicons name="chevron-down" size={18} color={theme.colors.deepBlue} />
        </TouchableOpacity>
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
        ListEmptyComponent={
          !loading ? <EmptyFeed /> : null
        }
      />

      {loading && posts.length === 0 && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
      
      {/* Account Switcher Modal */}
      <Modal
        visible={accountSwitcherVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleAccountSwitcher}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleAccountSwitcher}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Switch Accounts</Text>
              <TouchableOpacity onPress={toggleAccountSwitcher}>
                <Ionicons name="close" size={24} color={theme.colors.midnight} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={savedAccounts}
              renderItem={renderAccount}
              keyExtractor={(item) => item.uid}
              contentContainerStyle={styles.accountsList}
            />
            <TouchableOpacity 
              style={styles.addAccountButton}
              onPress={() => {
                toggleAccountSwitcher();
                navigation.navigate('Login');
              }}
            >
              <Ionicons name="add-circle-outline" size={22} color={theme.colors.primary} />
              <Text style={styles.addAccountText}>Add Account</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  accountSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.deepBlue,
    marginRight: 4,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.silver,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.midnight,
  },
  accountsList: {
    padding: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  accountInfo: {
    marginLeft: 16,
    flex: 1,
  },
  accountUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.midnight,
  },
  accountName: {
    fontSize: 14,
    color: theme.colors.mountain,
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.silver,
  },
  addAccountText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});

export default FeedScreen;