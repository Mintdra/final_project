import { useRouter } from 'expo-router';
import { AlertCircle, CheckCircle2, Clock, FileText } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { classroomService } from '../../services/ClassroomService.js';

const CLASSROOM_ID = 'SNFMC37EflogtvFyX8wj';

export default function TasksPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assignments, setAssignments] = useState([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadAssignments();
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
      ]).start();
    }
  }, [loading]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await classroomService.getAllAssignments(CLASSROOM_ID);
      setAssignments(data);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignments();
  };

  const handleViewAssignment = (assignmentId) => {
    router.push(`/class/assignmentDetails?id=${assignmentId}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
      >
        {/* Assignments List */}
        {assignments.length > 0 ? (
          assignments.map((assignment, index) => {
            const statusConfig =
              assignment.status === 'overdue'
                ? { background: '#7f1d1d', text: '#fca5a5', icon: AlertCircle, iconColor: '#fca5a5', label: 'Overdue' }
                : assignment.status === 'completed'
                  ? { background: '#065f46', text: '#6ee7b7', icon: CheckCircle2, iconColor: '#6ee7b7', label: 'Completed' }
                  : { background: '#1e3a8a', text: '#93c5fd', icon: Clock, iconColor: '#93c5fd', label: 'Pending' };

            const StatusIcon = statusConfig.icon;

            return (
              <Animated.View
                key={assignment.id}
                style={[
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                  }
                ]}
              >
                <View style={styles.assignmentCard}>
                  <View style={styles.assignmentHeader}>
                    <View style={styles.iconCircle}>
                      <FileText size={24} color="#3b82f6" />
                    </View>
                    <View style={styles.assignmentInfo}>
                      <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                      {assignment.dueDate && (
                        <View style={styles.dueDateRow}>
                          <Clock size={14} color="#64748b" />
                          <Text style={styles.dueText}>
                            {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusConfig.background }
                      ]}
                    >
                      <StatusIcon size={14} color={statusConfig.iconColor} />
                      <Text style={[styles.statusText, { color: statusConfig.text }]}>
                        {statusConfig.label}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleViewAssignment(assignment.id)}
                      style={styles.viewButton}
                    >
                      <Text style={styles.viewButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            );
          })
        ) : (
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.noAssignments}>
              <View style={styles.emptyIconCircle}>
                <FileText size={48} color="#64748b" />
              </View>
              <Text style={styles.noAssignmentsText}>No assignments yet</Text>
              <Text style={styles.noAssignmentsSubtext}>Check back later for updates</Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scrollContent: { padding: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },

  assignmentCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  assignmentInfo: { flex: 1 },
  assignmentTitle: { fontSize: 17, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 6 },
  dueDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dueText: { fontSize: 13, color: '#64748b', fontWeight: '500' },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { fontSize: 13, fontWeight: '600' },
  viewButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  viewButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },

  noAssignments: {
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
  noAssignmentsText: { color: '#94a3b8', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  noAssignmentsSubtext: { color: '#64748b', fontSize: 14 },
});
