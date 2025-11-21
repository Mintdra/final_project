import React, { useState, useEffect } from 'react';
import { View, Image } from 'react-native';
import { User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileAvatar({ 
  size = 48, 
  iconSize = 24,
  borderColor = 'white',
  showBorder = true
}) {
  const [profileImage, setProfileImage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadProfileImage();
    
    // Listen for profile updates
    const interval = setInterval(() => {
      loadProfileImage();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadProfileImage = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        if (userData.profileImage && userData.profileImage !== profileImage) {
          setProfileImage(userData.profileImage);
          setRefreshKey(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  if (profileImage) {
    return (
      <Image
        key={refreshKey}
        source={{ uri: profileImage }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: showBorder ? 2 : 0,
          borderColor: borderColor,
        }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: showBorder ? 2 : 0,
        borderColor: borderColor,
      }}
    >
      <User size={iconSize} color="#2563eb" />
    </View>
  );
}
