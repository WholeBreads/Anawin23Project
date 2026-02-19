import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import FeedScreen from './src/screens/FeedScreen';
import AddPostScreen from './src/screens/AddPostScreen';
import ManageScreen from './src/screens/ManageScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Feed') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Add') {
                iconName = focused ? 'add-circle' : 'add-circle-outline';
              } else if (route.name === 'Manage') {
                iconName = focused ? 'list' : 'list-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#1877f2', // Facebook Blue
            tabBarInactiveTintColor: 'gray',
            headerShown: true, // Show header for title
          })}
        >
          <Tab.Screen name="Feed" component={FeedScreen} options={{ title: 'News Feed' }} />
          <Tab.Screen name="Add" component={AddPostScreen} options={{ title: 'Create Post' }} />
          <Tab.Screen name="Manage" component={ManageScreen} options={{ title: 'Manage Data' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
