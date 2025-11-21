import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, FileIcon, FileText, Upload, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const assignmentId = params.id;

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittedFiles, setSubmittedFiles] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadAssignment();
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

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const mockAssignment = {
        id: assignmentId,
        title: 'UX/UI Design Project',
        dueDate: new Date('2025-11-10'),
        status: 'pending',
        classId: '1111'
      };
      setAssignment(mockAssignment);
    } catch (error) {
      console.error('Error loading assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSubmittedFiles([...submittedFiles, result.assets[0]]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      if (Platform.OS === 'web') {
        alert('Failed to pick document. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to pick document. Please try again.');
      }
    }
  };

  const removeFile = (index) => {
    setSubmittedFiles(submittedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (submittedFiles.length === 0) {
      if (Platform.OS === 'web') {
        alert('Please add at least one file before submitting.');
      } else {
        Alert.alert('No Files', 'Please add at least one file before submitting.');
      }
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to submit this assignment?');
      if (confirmed) performSubmit();
    } else {
      Alert.alert(
        'Submit Assignment',
        'Are you sure you want to submit this assignment?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: performSubmit }
        ]
      );
    }
  };

  const performSubmit = () => {
    setIsSubmitted(true);
    if (Platform.OS === 'web') {
      alert('Assignment submitted successfully!');
    } else {
      Alert.alert('Success', 'Assignment submitted successfully!');
    }
  };

  const handleUnsubmit = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to unsubmit this assignment?');
      if (confirmed) {
        setIsSubmitted(false);
        setSubmittedFiles([]);
      }
    } else {
      Alert.alert(
        'Unsubmit Assignment',
        'Are you sure you want to unsubmit this assignment?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unsubmit', onPress: () => {
              setIsSubmitted(false);
              setSubmittedFiles([]);
            }
          }
        ]
      );
    }
  };

  const getFileIcon = (fileName) => {
    return <FileIcon size={20} color="#3b82f6" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!assignment) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Assignment not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => router.push('/class/assignmentPage')}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#f1f5f9" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.iconCircle}>
              <FileText size={32} color="#3b82f6" strokeWidth={2} />
            </View>
            <Text style={styles.assignmentTitle}>{assignment.title}</Text>
          </View>
        </Animated.View>

        {/* Submission Card */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Submission</Text>

            {submittedFiles.length > 0 && (
              <View style={styles.filesList}>
                {submittedFiles.map((file, index) => (
                  <View key={index} style={styles.fileRow}>
                    <View style={styles.fileIconCircle}>
                      {getFileIcon(file.name)}
                    </View>
                    <View style={styles.fileTextWrapper}>
                      <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                      <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                    </View>
                    {!isSubmitted && (
                      <TouchableOpacity onPress={() => removeFile(index)} style={styles.removeButton}>
                        <X size={18} color="#fca5a5" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            {!isSubmitted && (
              <TouchableOpacity style={styles.addFileBtn} onPress={pickDocument}>
                <Upload size={22} color="#3b82f6" />
                <Text style={styles.addFileText}>Add File</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitted ? styles.submitDisabled : (submittedFiles.length === 0 ? styles.submitInactive : styles.submitActive)
              ]}
              onPress={isSubmitted ? handleUnsubmit : handleSubmit}
              disabled={!isSubmitted && submittedFiles.length === 0}
            >
              <Text style={styles.submitButtonText}>{isSubmitted ? 'Unsubmit' : 'Submit Assignment'}</Text>
            </TouchableOpacity>

            {isSubmitted && (
              <View style={styles.successNotice}>
                <CheckCircle2 size={20} color="#6ee7b7" />
                <Text style={styles.successText}>Assignment submitted successfully</Text>
              </View>
            )}
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flex: 1 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  loadingText: { color: '#94a3b8', fontSize: 16 },

  header: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#334155',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: { alignItems: 'center' },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#334155',
  },
  assignmentTitle: { fontSize: 22, fontWeight: 'bold', color: '#f1f5f9', textAlign: 'center' },

  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 20 },

  filesList: { marginBottom: 16 },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  fileIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  fileTextWrapper: { flex: 1, marginLeft: 14 },
  fileName: { color: '#f1f5f9', fontWeight: '600', marginBottom: 2 },
  fileSize: { fontSize: 12, color: '#64748b' },
  removeButton: {
    width: 36,
    height: 36,
    backgroundColor: '#7f1d1d',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#991b1b',
  },

  addFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#3b82f6',
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 16,
    gap: 10,
  },
  addFileText: { color: '#3b82f6', fontWeight: '600', fontSize: 16 },

  submitButton: { width: '100%', paddingVertical: 16, borderRadius: 16 },
  submitActive: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  submitInactive: { backgroundColor: '#334155' },
  submitDisabled: {
    backgroundColor: '#7f1d1d',
    borderWidth: 1,
    borderColor: '#991b1b',
  },
  submitButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 17 },

  successNotice: {
    marginTop: 16,
    backgroundColor: '#065f46',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#047857',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  successText: { color: '#6ee7b7', textAlign: 'center', fontWeight: '600', fontSize: 15 },
});
