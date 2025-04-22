import React, { useContext, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import {
  Appbar,
  List,
  Divider,
  Text,
  Dialog,
  Portal,
  Button,
  Paragraph,
  useTheme
} from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const paperTheme = useTheme();
  const dispatch = useDispatch();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [deleteAccountDialogVisible, setDeleteAccountDialogVisible] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // TODO: Update user preferences in Firebase
  };

  const toggleLocation = () => {
    setLocationEnabled(!locationEnabled);
    // TODO: Update user preferences in Firebase
  };

  const toggleDarkMode = () => {
    toggleTheme(); // Use the toggleTheme function from ThemeContext
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleDeleteAccount = async () => {
    setDeleteAccountDialogVisible(false);
    // TODO: Implement account deletion
    Alert.alert(
      'Account Deletion',
      'This feature is not yet implemented. Your account remains active.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = async () => {
    setLogoutDialogVisible(false);
    try {
      const result = await logout();
      if (!result.success) {
        Alert.alert('Logout Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  // Get styles with current theme
  const styles = getStyles(paperTheme);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <ScrollView>
        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            title="Edit Profile"
            left={() => <List.Icon icon="account-edit" />}
            right={() => <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />}
            onPress={() => navigation.navigate('EditProfile')}
          />
          <List.Item
            title="Change Password"
            left={() => <List.Icon icon="lock" />}
            right={() => <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />}
            onPress={handleChangePassword}
          />
          <List.Item
            title="Privacy Settings"
            left={() => <List.Icon icon="shield-account" />}
            right={() => <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />}
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available in a future update.')}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Preferences</List.Subheader>
          <List.Item
            title="Push Notifications"
            description="Receive alerts about activity on your account"
            left={() => <List.Icon icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                color="#0066CC"
              />
            )}
          />
          <List.Item
            title="Location Services"
            description="Allow the app to access your location"
            left={() => <List.Icon icon="map-marker" />}
            right={() => (
              <Switch
                value={locationEnabled}
                onValueChange={toggleLocation}
                color="#0066CC"
              />
            )}
          />
          <List.Item
            title="Dark Mode"
            description="Toggle dark theme"
            left={() => <List.Icon icon="weather-night" />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                color={paperTheme.colors.primary}
              />
            )}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>About</List.Subheader>
          <List.Item
            title="App Version"
            description="1.0.0"
            left={() => <List.Icon icon="information" />}
          />
          <List.Item
            title="Terms of Service"
            left={() => <List.Icon icon="file-document" />}
            right={() => <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />}
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available in a future update.')}
          />
          <List.Item
            title="Privacy Policy"
            left={() => <List.Icon icon="shield" />}
            right={() => <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />}
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available in a future update.')}
          />
        </List.Section>

        <Divider />

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setLogoutDialogVisible(true)}
          >
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={() => setDeleteAccountDialogVisible(true)}
          >
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)}>
          <Dialog.Title>Log Out</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to log out of PeakShare?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleLogout}>Log Out</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={deleteAccountDialogVisible} onDismiss={() => setDeleteAccountDialogVisible(false)}>
          <Dialog.Title>Delete Account</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteAccountDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeleteAccount} color="#FF0000">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

// Make the styles function to utilize theme colors
const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  actionButtonsContainer: {
    padding: 16,
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteAccountButton: {
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;