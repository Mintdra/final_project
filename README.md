# MintSchool - Mobile Learning Application

A modern React Native mobile learning application with dark theme UI, in-game cosmetics shop, and comprehensive classroom management features.

## � Features

- **Authentication System** - Secure login with token-based authentication
- **Classroom Management** - Join classes, view materials, submit assignments
- **Assignments & Grades** - Track tasks, submit files, view grades
- **Cosmetics Shop** - Earn coins and customize profile with themes, badges, and effects
- **Profile Customization** - Avatar, camera integration, personal information
- **Dark Theme UI** - Modern, animated interface with smooth transitions

---

## 🔧 Core Functions & Architecture

### 1. **Authentication System**

#### **Flow:**
```
User enters credentials → API call → Token received → Stored in AsyncStorage → Navigation to Home
```

#### **Files Involved:**
- [`app/index.jsx`](file:///c:/Users/MSI%20PC/OneDrive/Desktop/Mobile_dev/final_project/app/index.jsx) - Login UI
- [`services/authen.js`](file:///c:/Users/MSI%20PC/OneDrive/Desktop/Mobile_dev/final_project/services/authen.js) - Authentication service
- [`services/api.js`](file:///c:/Users/MSI%20PC/OneDrive/Desktop/Mobile_dev/final_project/services/api.js) - API client configuration

#### **How It Works:**

**Login Process:**
```javascript
// 1. User submits credentials
const handleSignIn = async () => {
  // 2. Call authentication service
  await authService.login({ email, password });
  
  // 3. Service makes API call and stores token
  // In authen.js:
  const response = await api.post('/auth/login', credentials);
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('user', JSON.stringify(response.data));
  
  // 4. Navigate to home page
  router.replace('/class/homePage');
};
```

**Token Management:**
- Token stored in AsyncStorage for persistence
- Auto-check on app start via `checkExistingAuth()`
- Token attached to all API requests via interceptor

**Logout Process:**
```javascript
await AsyncStorage.clear(); // Remove all stored data
router.replace('/'); // Return to login
```

---

### 2. **AsyncStorage (Persistent Data)**

#### **Purpose:**
Store data locally on the device that persists between app sessions.

#### **What's Stored:**
- Authentication token
- User profile data
- Current classroom ID
- Profile customizations (future implementation)

#### **Usage Pattern:**

**Writing Data:**
```javascript
// Store string
await AsyncStorage.setItem('token', tokenValue);

// Store object (must stringify)
await AsyncStorage.setItem('user', JSON.stringify(userData));
```

**Reading Data:**
```javascript
// Get string
const token = await AsyncStorage.getItem('token');

// Get object (must parse)
const user = await AsyncStorage.getItem('user');
const userData = JSON.parse(user);
```

**Removing Data:**
```javascript
// Remove specific item
await AsyncStorage.removeItem('token');

// Clear all data
await AsyncStorage.clear();
```

#### **Flow in Application:**

**On App Start:**
```
App Loads → Check AsyncStorage for token → If exists, skip login → Navigate to Home
```

**On Login:**
```
Login Success → Save token + user data → Navigate to Home
```

**On Profile Update:**
```
User edits profile → Save to AsyncStorage → Update UI
```

---

### 3. **Animations**

#### **Pattern Used:**
All pages use the same animation pattern for consistency.

#### **Animation Types:**

**1. Fade Animation:**
```javascript
const fadeAnim = useRef(new Animated.Value(0)).current; // Start invisible

Animated.timing(fadeAnim, {
  toValue: 1,        // Fade to fully visible
  duration: 700,     // Over 700ms
  useNativeDriver: true, // Use native driver for performance
}).start();
```

**2. Scale Animation:**
```javascript
const scaleAnim = useRef(new Animated.Value(0.9)).current; // Start smaller

Animated.spring(scaleAnim, {
  toValue: 1,       // Scale to normal size
  friction: 6,      // Bouncy effect
  tension: 40,
  useNativeDriver: true,
}).start();
```

**3. Slide Animation:**
```javascript
const slideAnim = useRef(new Animated.Value(50)).current; // Start 50px down

Animated.timing(slideAnim, {
  toValue: 0,       // Move to original position
  duration: 600,
  useNativeDriver: true,
}).start();
```

#### **Implementation Flow:**

**Step 1 - Create Animation Values:**
```javascript
const fadeAnim = useRef(new Animated.Value(0)).current;
const scaleAnim = useRef(new Animated.Value(0.9)).current;
const slideAnim = useRef(new Animated.Value(50)).current;
```

**Step 2 - Start Animations on Mount:**
```javascript
useEffect(() => {
  Animated.parallel([ // Run all animations simultaneously
    Animated.timing(fadeAnim, { /* ... */ }),
    Animated.spring(scaleAnim, { /* ... */ }),
    Animated.timing(slideAnim, { /* ... */ }),
  ]).start();
}, []); // Empty dependency array = run once on mount
```

**Step 3 - Apply to Components:**
```javascript
<Animated.View 
  style={[
    styles.card,
    { 
      opacity: fadeAnim,
      transform: [
        { scale: scaleAnim },
        { translateY: slideAnim }
      ]
    }
  ]}
>
  {/* Content */}
</Animated.View>
```

#### **Why useNativeDriver?**
- Runs animations on native thread (not JavaScript thread)
- Smoother performance, 60 FPS
- Only works with transform and opacity properties

---

### 4. **Camera Integration**

#### **Libraries Used:**
- `expo-image-picker` - Access camera and photo library

#### **Flow:**

**Permission Request:**
```
App loads → Request permissions → User grants/denies → Store permission status
```

**Taking Photo:**
```
User taps camera button → Check permissions → Open camera → User takes photo → 
Receive image URI → Update state → Save to AsyncStorage
```

#### **Implementation:**

**1. Request Permissions (on component mount):**
```javascript
const requestPermissions = async () => {
  if (Platform.OS !== 'web') {
    // Request photo library access
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    // Request camera access
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
  }
};
```

**2. Take Photo:**
```javascript
const takePhoto = async () => {
  // Launch camera
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,    // Allow crop/edit
    aspect: [1, 1],         // Square aspect ratio
    quality: 0.8,           // 80% quality
  });

  // Check if user didn't cancel
  if (!result.canceled && result.assets && result.assets[0]) {
    const imageUri = result.assets[0].uri; // Get image URI
    
    // Update state
    setProfile({ ...profile, profileImage: imageUri });
    
    // Save to AsyncStorage
    await AsyncStorage.setItem('user', JSON.stringify({
      ...userData,
      profileImage: imageUri
    }));
  }
};
```

**3. Pick from Library:**
```javascript
const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  
  // Same processing as camera
};
```

**4. Display Image:**
```javascript
{profile.profileImage ? (
  <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
) : (
  <View style={styles.avatarPlaceholder}>
    <User size={48} color="#64748b" />
  </View>
)}
```

#### **Image URI:**
- On mobile: `file:///path/to/image.jpg`
- Stored as string in AsyncStorage
- Used directly in `<Image source={{ uri }}>`

---

### 5. **File Upload System**

#### **Libraries Used:**
- `expo-document-picker` - Access documents and files

#### **Flow:**

```
User taps "Add File" → Document picker opens → User selects file → 
Receive file info → Display in UI → Store in state → Submit with assignment
```

#### **Implementation:**

**1. Pick Document:**
```javascript
const pickDocument = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',              // All file types
    copyToCacheDirectory: true, // Copy to app cache
    multiple: false           // Single file
  });

  // Check if user didn't cancel
  if (!result.canceled && result.assets && result.assets[0]) {
    const file = result.assets[0];
    // file.name - File name
    // file.uri - File URI
    // file.size - File size in bytes
    
    // Add to submission list
    setSubmittedFiles([...submittedFiles, file]);
  }
};
```

**2. Display File Info:**
```javascript
{submittedFiles.map((file, index) => (
  <View key={index} style={styles.fileRow}>
    <FileIcon size={20} color="#3b82f6" />
    <Text>{file.name}</Text>
    <Text>{formatFileSize(file.size)}</Text>
    <TouchableOpacity onPress={() => removeFile(index)}>
      <X size={16} color="#dc2626" />
    </TouchableOpacity>
  </View>
))}
```

**3. Submit Files:**
```javascript
const handleSubmit = () => {
  if (submittedFiles.length === 0) {
    Alert.alert('No Files', 'Please add at least one file');
    return;
  }
  
  // In production, would upload files to server here
  // const formData = new FormData();
  // submittedFiles.forEach(file => {
  //   formData.append('files', file);
  // });
  // await api.post('/assignments/submit', formData);
  
  setIsSubmitted(true);
};
```

**4. File Size Formatting:**
```javascript
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};
```

---

## 🔄 Data Flow Diagrams

### **Authentication Flow:**
```
┌─────────────┐
│ Login Page  │
└──────┬──────┘
       │ User enters credentials
       ▼
┌─────────────┐
│ authService │──────► POST /auth/login
└──────┬──────┘
       │ Receive token
       ▼
┌──────────────┐
│ AsyncStorage │ ◄──── Save token + user data
└──────┬───────┘
       │
       ▼
┌─────────────┐
│  Home Page  │
└─────────────┘
```

### **Profile Update Flow:**
```
┌──────────────┐
│ Profile Page │
└──────┬───────┘
       │ User edits name/phone
       ▼
┌──────────────┐
│    State     │ ◄──── setProfile({ ...profile, name: text })
└──────┬───────┘
       │ User clicks "Save"
       ▼
┌──────────────┐
│ AsyncStorage │ ◄──── Save updated user data
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Alert     │ "Profile updated successfully!"
└──────────────┘
```

### **Camera Integration Flow:**
```
┌──────────────┐
│  App Loads   │
└──────┬───────┘
       │
       ▼
┌───────────────────┐
│ Request Camera    │
│   Permissions     │
└──────┬────────────┘
       │ User taps camera button
       ▼
┌───────────────────┐
│ Launch Camera     │
└──────┬────────────┘
       │ User takes photo
       ▼
┌───────────────────┐
│ Receive Image URI │
└──────┬────────────┘
       │
       ├──────► Update State (setProfile)
       │
       └──────► Save to AsyncStorage
                │
                ▼
          ┌──────────┐
          │ Display  │
          │  Image   │
          └──────────┘
```

### **File Upload Flow:**
```
┌─────────────────┐
│ Assignment Page │
└────────┬────────┘
         │ User taps "Add File"
         ▼
┌─────────────────┐
│ Document Picker │
└────────┬────────┘
         │ User selects file
         ▼
┌─────────────────┐
│  Receive file   │
│  name, uri,     │
│  size, type     │
└────────┬────────┘
         │
         ├──────► Add to submittedFiles array
         │
         └──────► Display in UI
                  │
                  ▼ User clicks "Submit"
            ┌────────────┐
            │  Upload to │
            │   Server   │
            └────────────┘
```

---

## 📂 Project Structure

```
final_project/
├── app/
│   ├── index.jsx                 # Login page
│   └── class/
│       ├── _layout.jsx          # Tab navigation
│       ├── homePage.jsx         # Dashboard
│       ├── shopPage.jsx         # Cosmetics shop
│       ├── classroomPage.jsx    # Classroom details
│       ├── assignmentPage.jsx   # Assignment list
│       ├── assignmentDetails.jsx # Submit assignments
│       ├── gradesPage.jsx       # View grades
│       └── profilePage.jsx      # User profile
├── services/
│   ├── api.js                   # Axios API client
│   ├── authen.js                # Authentication service
│   └── ClassroomService.js      # Classroom API calls
└── components/
    └── profileavatar.jsx        # Reusable avatar component
```

---

## 🎨 Design System

### **Color Palette:**
- Background: `#0f172a` (Deep Slate)
- Cards: `#1e293b` (Slate Gray)
- Primary Blue: `#3b82f6`
- Success Green: `#10b981`
- Warning Orange: `#f97316`
- Danger Red: `#ef4444`
- Text Primary: `#f1f5f9`
- Text Secondary: `#94a3b8`

### **Border Radiuses:**
- Small: 12-16px
- Medium: 18-20px
- Large: 24-28px
- Extra Large: 32px

---

## 🚀 Getting Started

### **Prerequisites:**
- Node.js 16+
- Expo CLI
- Mobile device or emulator

### **Installation:**
```bash
cd final_project
npm install
```

### **Run Development Server:**
```bash
npx expo start
```

### **Test on Web:**
Press `w` in the terminal

### **Test on Mobile:**
- Install Expo Go app
- Scan QR code from terminal

---

## 🔑 Key Technologies

- **React Native** - Mobile framework
- **Expo** - Development platform
- **Expo Router** - File-based routing
- **AsyncStorage** - Local data persistence
- **Axios** - HTTP client
- **Lucide React Native** - Icon library
- **Expo Image Picker** - Camera/photo access
- **Expo Document Picker** - File selection
- **Animated API** - Built-in animations

---

## 📝 API Integration

### **Base URL:**
Configured in `services/api.js`

### **Endpoints:**
- `POST /auth/login` - User authentication
- `POST /classrooms/join` - Join classroom
- `GET /classrooms/:id/details` - Get classroom info
- `GET /classrooms/:id/materials` - Get course materials
- `GET /classrooms/:id/assignments` - Get assignments

### **Request Flow:**
```javascript
// 1. Import service
import { classroomService } from '@/services/ClassroomService';

// 2. Make API call
const materials = await classroomService.getClassroomMaterials(classroomId);

// 3. Update state
setMaterials(materials);
```

---

## 🎯 Future Enhancements

- [ ] Real-time notifications
- [ ] Chat/messaging system
- [ ] Video lessons integration
- [ ] Apply purchased cosmetics to profile
- [ ] Leaderboard and achievements
- [ ] Offline mode support

---

## 📄 License

This project is for educational purposes.

---

## 👥 Contributors

Built with ❤️ for modern mobile learning
