import React, { useState, useContext } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { TextInput, Button, Title, Snackbar } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('test@example.com');  // Pre-fill for easier testing
  const [password, setPassword] = useState('password');    // Pre-fill for easier testing
  const [loading, setLoading] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setStatusMessage('Please enter both email and password');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Show success message
        setStatusMessage(result.message || 'Login successful!');
        setSnackbarVisible(true);
      } else {
        // Show error message
        setStatusMessage(result.error);
        setSnackbarVisible(true);
      }
    } catch (error) {
      setStatusMessage('An unexpected error occurred. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1565992441121-4367c2967103?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2tpfGVufDB8fDB8fHww&auto=format&fit=crop&w=200&q=60' }} 
              style={styles.logo} 
            />
            <Title style={styles.appTitle}>PeakShare</Title>
            <Text style={styles.tagline}>Connect with skiers & snowboarders worldwide</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={hidePassword}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={<TextInput.Icon icon={hidePassword ? "eye" : "eye-off"} onPress={() => setHidePassword(!hidePassword)} />}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              loading={loading}
              disabled={loading}
            >
              Log In
            </Button>

            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Close',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {statusMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    paddingVertical: 6,
    backgroundColor: '#0066CC',
  },
  forgotPassword: {
    textAlign: 'center',
    marginTop: 16,
    color: '#0066CC',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
  },
  signupText: {
    marginLeft: 5,
    color: '#0066CC',
    fontWeight: 'bold',
  },
});

export default LoginScreen;