import ProfileAvatar from '@/components/profileavatar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { BookOpen, CheckCircle, ChevronRight, Clock, LogOut as LeaveIcon, Plus } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { classroomService } from '../../services/ClassroomService';

const CLASSROOM_KEY = 'SNFMC37EflogtvFyX8wj';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classroomDetails, setClassroomDetails] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [userName, setUserName] = useState('Student');
  const [currentClassroomId, setCurrentClassroomId] = useState(null);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [joiningClass, setJoiningClass] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    loadUserName();
    loadCurrentClassroom();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const loadUserName = async () => {
    const user = await AsyncStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserName(userData.email?.split('@')[0] || 'Student');
    }
  };

  const loadCurrentClassroom = async () => {
    try {
      const savedClassroomId = await AsyncStorage.getItem(CLASSROOM_KEY);
      if (savedClassroomId) {
        setCurrentClassroomId(savedClassroomId);
        await loadData(savedClassroomId);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading classroom:', error);
      setLoading(false);
    }
  };

  const loadData = async (classroomId) => {
    try {
      setLoading(true);
      const [details, mats, assigns] = await Promise.all([
        classroomService.getClassroomDetails(classroomId),
        classroomService.getClassroomMaterials(classroomId),
        classroomService.getAllAssignments(classroomId).catch(() => []),
      ]);

      setClassroomDetails(details);
      setMaterials(mats);
      setAssignments(assigns);
    } catch (error) {
      console.error('Error loading data:', error);
      if (Platform.OS === 'web') {
        alert('Failed to load classroom data');
      } else {
        Alert.alert('Error', 'Failed to load classroom data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (currentClassroomId) {
      setRefreshing(true);
      loadData(currentClassroomId);
    }
  };

  const handleJoinClassroom = async () => {
    // Validate input
    if (!classCode.trim()) {
      const errorMsg = 'Please enter a class code';
      console.log('Join classroom failed: No class code provided');
      Platform.OS === 'web'
        ? alert(errorMsg)
        : Alert.alert('Error', errorMsg);
      return;
    }

    const trimmedCode = classCode.trim().toUpperCase();
    console.log('Attempting to join classroom with code:', trimmedCode);

    setJoiningClass(true);
    try {
      // Call the API to join classroom
      const result = await classroomService.joinClassroom(trimmedCode);
      console.log('Join classroom API response:', result);

      // Extract classroom ID from response
      const newClassroomId = result.classroomId || result.id || result._id || trimmedCode;
      console.log('Extracted classroom ID:', newClassroomId);

      // Validate that we got a classroom ID
      if (!newClassroomId) {
        throw new Error('No classroom ID received from server');
      }

      // Save the classroom ID
      await AsyncStorage.setItem(CLASSROOM_KEY, newClassroomId);
      setCurrentClassroomId(newClassroomId);

      // Close modal and reset
      setShowJoinModal(false);
      setClassCode('');

      // Load classroom data
      console.log('Loading classroom data for ID:', newClassroomId);
      await loadData(newClassroomId);

      // Show success message
      const successMsg = 'Successfully joined classroom!';
      Platform.OS === 'web'
        ? alert(successMsg)
        : Alert.alert('Success', successMsg);
    } catch (error) {
      console.error('Error joining classroom:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Provide detailed error message
      let errorMessage = 'Failed to join classroom';

      if (error.response) {
        // Server responded with an error
        if (error.response.status === 404) {
          errorMessage = 'Classroom not found. Please check the class code and try again.';
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = 'You are not authorized to join this classroom. Please check your credentials.';
        } else if (error.response.status === 409) {
          errorMessage = 'You are already enrolled in this classroom.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        // Something else happened
        errorMessage = error.message || 'An unexpected error occurred';
      }

      Platform.OS === 'web'
        ? alert(errorMessage)
        : Alert.alert('Error', errorMessage);
    } finally {
      setJoiningClass(false);
    }
  };

  const handleLeaveClassroom = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to leave this classroom?')) {
        performLeaveClassroom();
      }
    } else {
      Alert.alert('Leave Classroom', 'Are you sure you want to leave this classroom?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: performLeaveClassroom },
      ]);
    }
  };

  const performLeaveClassroom = async () => {
    try {
      await AsyncStorage.removeItem(CLASSROOM_KEY);
      setCurrentClassroomId(null);
      setClassroomDetails(null);
      setMaterials([]);
      setAssignments([]);
      Platform.OS === 'web'
        ? alert('You have left the classroom')
        : Alert.alert('Success', 'You have left the classroom');
    } catch (error) {
      console.error('Error leaving classroom:', error);
    }
  };

  const completedAssignments = assignments.filter((a) => a.status === 'completed').length;
  const pendingAssignments = assignments.filter((a) => a.status === 'pending').length;

  if (!loading && !currentClassroomId) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={[
            styles.centeredView,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.emptyIconCircle}>
            <BookOpen size={48} color="#3b82f6" strokeWidth={2} />
          </View>
          <Text style={styles.emptyTitle}>No Classroom Yet</Text>
          <Text style={styles.emptyDesc}>
            Enter a class code to join a classroom and start learning!
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setShowJoinModal(true)}>
            <Plus size={22} color="white" />
            <Text style={styles.primaryButtonText}>Join Classroom</Text>
          </TouchableOpacity>
        </Animated.View>

        <JoinClassroomModal
          visible={showJoinModal}
          onClose={() => {
            setShowJoinModal(false);
            setClassCode('');
          }}
          classCode={classCode}
          setClassCode={setClassCode}
          onJoin={handleJoinClassroom}
          loading={joiningClass}
        />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <ProfileAvatar size={52} iconSize={26} borderColor="#3b82f6" showBorder={true} />
            <View>
              <Text style={styles.userName}>Hello, {userName}!</Text>
              <Text style={styles.userWelcome}>Ready to learn today?</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}>
        <View style={styles.section}>
          {/* My Class Card */}
          {classroomDetails ? (
            <Animated.View
              style={[
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <View style={styles.classCard}>
                <TouchableOpacity onPress={() => router.push('/class/classroomPage')}>
                  <View style={styles.classCardHeader}>
                    <View style={styles.classIconCircle}>
                      <BookOpen size={24} color="#3b82f6" />
                    </View>
                    <View style={styles.classInfo}>
                      <Text style={styles.className}>{classroomDetails.name || 'Mobile Development'}</Text>
                      <Text style={styles.teacherName}>
                        {classroomDetails.teacher || classroomDetails.teacherName || 'Mrs. Voneat'}
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#64748b" />
                  </View>
                </TouchableOpacity>

                <View style={styles.cardDivider} />

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.leaveBtn} onPress={handleLeaveClassroom}>
                    <LeaveIcon size={16} color="#f87171" />
                    <Text style={styles.leaveBtnText}>Leave Class</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ) : null}

          {/* Today's Task Banner */}
          {pendingAssignments > 0 && (
            <Animated.View
              style={[
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.todayTaskCard}>
                <View style={styles.todayTaskLeft}>
                  <View style={styles.taskIconCircle}>
                    <Clock size={22} color="white" />
                  </View>
                  <View>
                    <Text style={styles.todayTaskTitle}>Pending Tasks</Text>
                    <Text style={styles.todayTaskSub}>{pendingAssignments} Assignments Due</Text>
                  </View>
                </View>
                <ChevronRight size={22} color="rgba(255,255,255,0.8)" />
              </View>
            </Animated.View>
          )}

          {/* Action Buttons */}
          <Animated.View
            style={[
              styles.actionRow,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowJoinModal(true)}>
              <Plus size={22} color="white" />
              <Text style={styles.actionBtnText}>Join Class</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => router.push('/class/assignmentPage')}>
              <CheckCircle size={22} color="#3b82f6" />
              <Text style={styles.actionBtnSecondaryText}>Assignments</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Join Classroom Modal */}
      <JoinClassroomModal
        visible={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setClassCode('');
        }}
        classCode={classCode}
        setClassCode={setClassCode}
        onJoin={handleJoinClassroom}
        loading={joiningClass}
      />
    </SafeAreaView>
  );
}

// Modal Component
function JoinClassroomModal({ visible, onClose, classCode, setClassCode, onJoin, loading }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIconCircle}>
              <Plus size={28} color="#3b82f6" />
            </View>
            <Text style={styles.modalTitle}>Join Classroom</Text>
            <Text style={styles.modalDesc}>Enter the class code provided by your teacher</Text>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Class Code</Text>
            <TextInput
              value={classCode}
              onChangeText={setClassCode}
              placeholder="ABCD123"
              placeholderTextColor="#64748b"
              autoCapitalize="characters"
              style={styles.textInput}
              editable={!loading}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalJoinBtn, loading && { opacity: 0.6 }]}
              onPress={onJoin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.modalJoinText}>Join</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#334155',
  },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 12 },
  emptyDesc: { fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 10,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: { color: 'white', fontWeight: 'bold', fontSize: 17 },
  header: { backgroundColor: '#1e293b', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, borderWidth: 1, borderTopWidth: 0, borderColor: '#334155' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  userName: { color: '#f1f5f9', fontSize: 18, fontWeight: 'bold' },
  userWelcome: { color: '#94a3b8', fontSize: 14, marginTop: 2 },
  section: { paddingHorizontal: 24, paddingVertical: 20 },
  classCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  classCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  classIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  classInfo: { flex: 1 },
  className: { fontSize: 18, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 4 },
  teacherName: { fontSize: 14, color: '#94a3b8' },
  cardDivider: { height: 1, backgroundColor: '#334155', marginVertical: 16 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7f1d1d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#991b1b',
  },
  leaveBtnText: { fontSize: 14, color: '#fca5a5', fontWeight: '600' },
  todayTaskCard: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  todayTaskLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  taskIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayTaskTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  todayTaskSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 14 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 18,
    paddingVertical: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  actionBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1e293b',
    borderRadius: 18,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  actionBtnSecondaryText: { color: '#3b82f6', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  modalCard: { backgroundColor: '#1e293b', borderRadius: 28, padding: 28, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: '#334155' },
  modalHeader: { alignItems: 'center', marginBottom: 24 },
  modalIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#334155',
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 8 },
  modalDesc: { fontSize: 15, color: '#94a3b8', textAlign: 'center', lineHeight: 22 },
  inputWrapper: { marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10, color: '#94a3b8' },
  textInput: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#334155',
    backgroundColor: '#0f172a',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
    color: '#f1f5f9',
  },
  modalActions: { flexDirection: 'row', gap: 14 },
  modalCancelBtn: { flex: 1, backgroundColor: '#334155', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  modalCancelText: { color: '#94a3b8', fontWeight: '600', fontSize: 16 },
  modalJoinBtn: { flex: 1, backgroundColor: '#3b82f6', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  modalJoinText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
