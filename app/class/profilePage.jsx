import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, Edit3, Image as ImageIcon, LogOut, Save, User } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    profileImage: '',
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadUserData();
    requestPermissions();

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera roll permissions to change your profile picture!');
      }
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera permissions to take photos!');
      }
    }
  };

  const loadUserData = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setProfile({
          name: userData.displayName || userData.name || '',
          username: userData.email?.split('@')[0] || '',
          email: userData.email || '',
          phone: userData.phoneNumber || userData.phone || '',
          profileImage: userData.profileImage || '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfile({ ...profile, profileImage: imageUri });

        const user = await AsyncStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          await AsyncStorage.setItem(
            'user',
            JSON.stringify({ ...userData, profileImage: imageUri })
          );
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
          return;
        }
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfile({ ...profile, profileImage: imageUri });

        const user = await AsyncStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          await AsyncStorage.setItem(
            'user',
            JSON.stringify({ ...userData, profileImage: imageUri })
          );
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        performSignOut();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: performSignOut },
      ]);
    }
  };

  const performSignOut = async () => {
    try {
      await AsyncStorage.clear();
      if (Platform.OS === 'web') {
        window.location.href = '/';
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleSaveChanges = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        await AsyncStorage.setItem(
          'user',
          JSON.stringify({
            ...userData,
            displayName: profile.name,
            phoneNumber: profile.phone,
            profileImage: profile.profileImage,
          })
        );
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* Profile Header */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.header}>
            <View style={styles.avatarSection}>
              {profile.profileImage ? (
                <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={56} color="#64748b" strokeWidth={1.5} />
                </View>
              )}

              {/* Image Action Buttons */}
              <View style={styles.avatarActions}>
                <TouchableOpacity onPress={pickImage} style={styles.actionButton}>
                  <ImageIcon size={18} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={takePhoto} style={styles.actionButton}>
                  <Camera size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.name}>{profile.name || profile.username || 'Student'}</Text>
            <View style={styles.usernameChip}>
              <Text style={styles.username}>@{profile.username || 'user'}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Profile Form */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconCircle}>
                <Edit3 size={20} color="#3b82f6" />
              </View>
              <Text style={styles.sectionTitle}>Profile Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={profile.name}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
                placeholder="Enter your name"
                placeholderTextColor="#64748b"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor="#64748b"
                style={styles.input}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity onPress={handleSaveChanges} style={styles.saveButton}>
              <Save size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Sign Out Section */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <LogOut size={22} color="#fca5a5" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarSection: { position: 'relative', marginBottom: 20 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#475569',
  },
  avatarActions: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1e293b',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  name: { color: '#f1f5f9', fontSize: 26, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  usernameChip: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  username: { color: '#3b82f6', fontSize: 15, fontWeight: '600' },

  formSection: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  sectionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f1f5f9' },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#94a3b8', marginBottom: 10 },
  input: {
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#0f172a',
    color: '#f1f5f9',
    fontSize: 16,
  },
  disabledInput: { backgroundColor: '#1a2332', color: '#64748b' },

  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 18,
    paddingVertical: 16,
    gap: 10,
    marginTop: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 17 },

  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#991b1b',
    backgroundColor: '#7f1d1d',
    borderRadius: 18,
    paddingVertical: 16,
  },
  signOutText: { color: '#fca5a5', fontWeight: '600', fontSize: 17 },
});
