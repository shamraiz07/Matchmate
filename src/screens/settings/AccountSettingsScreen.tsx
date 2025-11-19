import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';

interface MenuItemProps {
  icon: string;
  title: string;
  onPress: () => void;
}

function MenuItem({ icon, title, onPress }: MenuItemProps) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <Icon name={icon} size={24} color="#D4AF37" style={styles.menuIcon} />
      <Text style={styles.menuText}>{title}</Text>
      <Icon
        name="chevron-forward"
        size={20}
        color="#808080"
        style={styles.chevron}
      />
    </Pressable>
  );
}

export default function AccountSettingsScreen({ navigation }: any) {
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  return (
    <Screen>
      <Header title="Account Settings" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.menuContainer}>
          <MenuItem
            icon="lock-closed"
            title="Change password"
            onPress={() => {
              // Navigate to change password screen
              navigation.navigate('ChangePassword');
            }}
          />
          <MenuItem
            icon="trash"
            title="Delete account"
            onPress={() => {
              navigation.navigate('DeleteAccount');
            }}
          />
          <MenuItem
            icon="help-circle"
            title="FAQ & Support"
            onPress={() => {
              // Navigate to FAQ screen
              navigation.navigate('FAQSupport');
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  menuContainer: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
});

