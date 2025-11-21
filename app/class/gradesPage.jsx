import { Award, TrendingUp } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const quizzesData = [
  { id: 1, title: 'Mobile Development', total: 100, grade: 'A' },
  { id: 2, title: 'Computer Architecture & OS', total: 100, grade: 'A+' },
  { id: 3, title: 'Embedded System', total: 100, grade: 'B+' },
  { id: 4, title: 'Algorithm', total: 100, grade: 'A' },
  { id: 5, title: 'UX/UI', total: 100, grade: 'A-' }
];

export default function GradesPage() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
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
  }, []);

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return { bg: '#065f46', text: '#6ee7b7' };
    if (grade.startsWith('B')) return { bg: '#1e3a8a', text: '#93c5fd' };
    return { bg: '#334155', text: '#94a3b8' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {quizzesData.map((quiz, index) => {
          const gradeColor = getGradeColor(quiz.grade);
          return (
            <Animated.View
              key={quiz.id}
              style={[
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <View style={styles.gradeCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconCircle}>
                    <Award size={24} color="#3b82f6" strokeWidth={2} />
                  </View>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle}>{quiz.title}</Text>
                    <Text style={styles.coursePoints}>{quiz.total} Points Total</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.gradeInfo}>
                    <Text style={styles.gradeLabel}>Your Grade:</Text>
                    <View style={[styles.gradeBadge, { backgroundColor: gradeColor.bg }]}>
                      <TrendingUp size={16} color={gradeColor.text} />
                      <Text style={[styles.gradeText, { color: gradeColor.text }]}>{quiz.grade}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flex: 1 },
  scrollContent: { padding: 24 },

  gradeCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  courseInfo: { flex: 1 },
  courseTitle: { fontSize: 17, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 4 },
  coursePoints: { fontSize: 13, color: '#64748b', fontWeight: '500' },

  cardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  gradeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeLabel: { fontSize: 14, color: '#94a3b8', fontWeight: '600' },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    minWidth: 70,
    justifyContent: 'center',
  },
  gradeText: { fontSize: 18, fontWeight: 'bold' },
});