import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

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
        <Text style={styles.headerTitle}>{title}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 80,
    marginTop: '5%',
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
});

