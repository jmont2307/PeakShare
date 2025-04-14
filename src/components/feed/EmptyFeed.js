import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const EmptyFeed = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2tpfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60' }} 
        style={styles.image}
      />
      <Text style={styles.title}>Your feed is empty</Text>
      <Text style={styles.description}>
        Follow other skiers and snowboarders to see their posts in your feed.
      </Text>
      <Button 
        mode="contained" 
        style={styles.button}
        onPress={() => navigation.navigate('Explore')}
      >
        Explore Resorts & Users
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  button: {
    marginTop: 10,
  }
});

export default EmptyFeed;