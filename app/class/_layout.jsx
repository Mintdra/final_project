import { Tabs } from 'expo-router';
import { BarChart3, FileText, Home, ShoppingBag, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function ClassLayout() {
  return (
    <Tabs
      screenOptions={{
        // Global Header Styling
        headerShown: true,
        headerStyle: styles.headerStyle,
        headerTitleStyle: styles.headerTitleStyle,
        headerTintColor: '#f1f5f9',

        // Tab Bar Styling
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {/* 1. Home Tab */}
      <Tabs.Screen
        name="homePage"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home size={size} color={color} />, }}
      />

      {/* 2. Shop Tab */}
      <Tabs.Screen
        name="shopPage"
        options={{ title: 'Shop', tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />, }}
      />

      {/* 3. Tasks Tab (assignmentPage.jsx) */}
      <Tabs.Screen
        name="assignmentPage"
        options={{ title: 'Tasks', tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />, }}
      />

      {/* 4. Grades Tab */}
      <Tabs.Screen
        name="gradesPage"
        options={{ title: 'Grades', tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />, }}
      />

      {/* 5. Profile Tab */}
      <Tabs.Screen
        name="profilePage"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User size={size} color={color} />, }}
      />

      {/* Hidden Detail Screens */}
      <Tabs.Screen name="classroomPage" options={{ href: null, headerTitle: 'Class Details' }} />
      <Tabs.Screen name="assignmentDetails" options={{ href: null, headerTitle: 'Assignment' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Tab Bar Style  
  tabBar: {
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    height: 65,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontWeight: '600',
    fontSize: 11,
  },
  // Header Style
  headerStyle: {
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitleStyle: {
    fontWeight: 'bold',
    color: '#f1f5f9',
    fontSize: 18,
  },
});