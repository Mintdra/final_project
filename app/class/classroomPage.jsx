import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ArrowLeft, Book, FileText } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Linking, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { classroomService } from '../../services/ClassroomService';

const CLASSROOM_KEY = 'SNFMC37EflogtvFyX8wj';

export default function CourseDetailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [classroomDetails, setClassroomDetails] = useState(null);
  const [currentClassroomId, setCurrentClassroomId] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    loadClassroomId();
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

  const loadClassroomId = async () => {
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
      const [details, mats] = await Promise.all([
        classroomService.getClassroomDetails(classroomId),
        classroomService.getClassroomMaterials(classroomId),
      ]);

      setClassroomDetails(details);
      setMaterials(mats);
    } catch (error) {
      console.error('Error loading course details:', error);
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

  const handleOpenLink = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error('Failed to open URL:', err)
      );
    }
  };

  // Group materials by lesson or section
  const groupedMaterials = materials.reduce((acc, material) => {
    const lesson = material.lesson || material.section || 'Lesson 1';
    if (!acc[lesson]) acc[lesson] = [];
    acc[lesson].push(material);
    return acc;
  }, {});

  if (materials.length > 0 && Object.keys(groupedMaterials).length === 0) {
    groupedMaterials['Lesson 1'] = materials;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Classroom</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
      >
        {/* Course Info Card */}
        <Animated.View
          style={[
            styles.courseCardWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.courseCard}>
            <View style={styles.courseIconCircle}>
              <Book size={32} color="#3b82f6" strokeWidth={2} />
            </View>
            <Text style={styles.courseTitle}>
              {classroomDetails?.name || 'Mobile Development'}
            </Text>
            <Text style={styles.courseSubtitle}>
              {classroomDetails?.teacher || classroomDetails?.teacherName || 'Mrs. Voneat'}
            </Text>
          </View>
        </Animated.View>

        {/* Materials Section */}
        <View style={styles.materialsSection}>
          <Animated.View
            style={[
              styles.materialsHeader,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.materialsTitle}>Course Materials</Text>
            <Text style={styles.materialsCount}>{materials.length} items</Text>
          </Animated.View>

          {/* Materials List */}
          {materials.length > 0 ? (
            Object.keys(groupedMaterials).map((lessonName, lessonIndex) => (
              <Animated.View
                key={lessonIndex}
                style={[
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                  }
                ]}
              >
                <View style={styles.lessonWrapper}>
                  <View style={styles.lessonHeader}>
                    <View style={styles.lessonDot} />
                    <Text style={styles.lessonTitle}>{lessonName}</Text>
                  </View>

                  {groupedMaterials[lessonName].map((material, index) => (
                    <TouchableOpacity
                      key={material.id || index}
                      onPress={() => material.url && handleOpenLink(material.url)}
                      style={styles.materialCard}
                    >
                      <View style={styles.materialIconWrapper}>
                        <FileText size={24} color="#3b82f6" />
                      </View>
                      <View style={styles.materialTextWrapper}>
                        <Text style={styles.materialTitle}>
                          {material.title || material.name || `Material ${index + 1}`}
                        </Text>
                        {material.createdAt && (
                          <Text style={styles.materialDate}>
                            {new Date(material.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            ))
          ) : (
            <Animated.View
              style={[
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <View style={styles.noMaterials}>
                <View style={styles.emptyIconCircle}>
                  <FileText size={48} color="#64748b" />
                </View>
                <Text style={styles.noMaterialsText}>No materials yet</Text>
                <Text style={styles.noMaterialsSubText}>Check back later for updates</Text>
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#334155',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#f1f5f9' },

  courseCardWrapper: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  courseCard: {
    backgroundColor: '#1e293b',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  courseIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#334155',
  },
  courseTitle: { color: '#f1f5f9', fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  courseSubtitle: { color: '#94a3b8', fontSize: 16, textAlign: 'center' },

  materialsSection: { paddingHorizontal: 24, paddingBottom: 24 },
  materialsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  materialsTitle: { fontSize: 18, fontWeight: 'bold', color: '#f1f5f9' },
  materialsCount: { fontSize: 14, color: '#64748b', fontWeight: '600' },

  lessonWrapper: { marginBottom: 20 },
  lessonHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  lessonDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' },
  lessonTitle: { color: '#94a3b8', fontWeight: '600', fontSize: 16 },

  materialCard: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  materialIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  materialTextWrapper: { flex: 1 },
  materialTitle: { fontWeight: '600', color: '#f1f5f9', marginBottom: 4, fontSize: 16 },
  materialDate: { fontSize: 13, color: '#64748b' },

  noMaterials: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#334155',
  },
  noMaterialsText: { color: '#94a3b8', marginTop: 8, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  noMaterialsSubText: { color: '#64748b', marginTop: 6, textAlign: 'center', fontSize: 14 },
});
