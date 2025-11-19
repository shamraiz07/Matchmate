import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';

export default function Screen({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      {children}
      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 16 },
});

