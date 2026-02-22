import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { CardStack } from '../components/CardStack';

export function SwipeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>SwapSpace</Text>
      </View>
      <View style={styles.body}>
        <CardStack />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  logo: { fontSize: 22, fontWeight: '900', color: '#FF4458' },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
