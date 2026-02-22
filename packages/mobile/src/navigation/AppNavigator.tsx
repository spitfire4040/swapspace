import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { SwipeScreen } from '../screens/SwipeScreen';
import { UploadScreen } from '../screens/UploadScreen';
import { LikedScreen } from '../screens/LikedScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ icon }: { icon: string }) {
  return <Text style={{ fontSize: 22 }}>{icon}</Text>;
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF4458',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopColor: '#f3f4f6',
          paddingBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="Swipe"
        component={SwipeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={focused ? '🔥' : '🃏'} />,
        }}
      />
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={focused ? '📸' : '📷'} />,
        }}
      />
      <Tab.Screen
        name="Liked"
        component={LikedScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={focused ? '❤️' : '🤍'} />,
        }}
      />
    </Tab.Navigator>
  );
}
