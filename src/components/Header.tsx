import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export default function Header({ title, onBack, showBack = true }: HeaderProps) {
  if (!showBack && !title) {
    return null;
  }

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <View style={styles.header}>
      {showBack && (
        <Pressable 
          onPress={handleBack} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
      )}
      {title && (
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Math.max(16, SCREEN_WIDTH * 0.04),
    minHeight: 60,
    height: Math.max(60, SCREEN_WIDTH * 0.2),
    marginTop: Math.max(10, SCREEN_WIDTH * 0.02),
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    width: '100%',
  },
  backButton: {
    marginRight: Math.max(12, SCREEN_WIDTH * 0.04),
    padding: 4,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#D4AF37',
    fontSize: Math.max(18, SCREEN_WIDTH * 0.05),
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
});

