import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import Screen from '../../components/Screen';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../store/Auth_store';
import { useAll_Friends_See } from '../../service/Hooks/User_Connection_Hook';
import { BASE_URL_IMAGE } from '../../constants/config';

export default function SettingsScreen({ navigation }: any) {
  const user = useAuthStore(state => state.user);
  const { data: userfriend } = useAll_Friends_See();
  console.log('user---------->>>>>>>>profilee', user);
  const menuItems = [
    {
      id: 'upgrade',
      title: 'Upgrade plan',
      icon: 'arrow-up-circle',
      iconColor: '#FFA500',
      onPress: () => navigation.navigate('ChoosePlan'),
    },
    {
      id: 'Friend',
      title: 'My Friends',
      icon: 'shield-outline',
      iconColor: '#808080',
      onPress: () => navigation.navigate('AllUserFriend'),
    },
    {
      id: 'quota',
      title: 'Quota balance',
      icon: 'refresh-circle',
      iconColor: '#808080',
      onPress: () => navigation.navigate('QuotaBalance'),
    },
    {
      id: 'profile',
      title: 'My profile',
      icon: 'person',
      iconColor: '#808080',
      onPress: () => navigation.navigate('MyProfile'),
    },
    {
      id: 'verification',
      title: 'Profile verification',
      icon: 'shield-checkmark',
      iconColor: '#808080',
      // onPress: () => navigation.navigate('ProfileVerification'),

      onPress: () => {
        if (user?.cnic_verification?.status === 'verified'){
          navigation.navigate('ProfileVerification');
        } else {
          navigation.navigate('VerificationUpload');
        }
      },
    },
    {
      id: 'account',
      title: 'Account setting',
      icon: 'settings',
      iconColor: '#808080',
      onPress: () => navigation.navigate('AccountSettings'),
    },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <View style={styles.profileIconContainer}>
            {user?.media?.profile_picture ? (<Image
                source={{
                  uri: user?.media?.profile_picture,
                }}
                style={{ width: 85, height: 85, borderRadius: 100 }}
              />
              ) : (<Icon name="person" size={48} color="#D4AF37" />)}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.candidate_information?.candidate_name}
              </Text>
              <Text style={styles.profilePhone}>
                {user?.candidate_information?.phone_number}
              </Text>
              <Text style={styles.profileEmail}>
                {user?.candidate_information?.email}
              </Text>
            </View>
          </View>
          <Pressable style={styles.completedButton}>
            <Text style={styles.completedText}>
              {user?.profile_completion?.completion_percentage}% completed
            </Text>
          </Pressable>
          <Pressable
            style={styles.signOutButton}
            onPress={() => {
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                      await useAuthStore.getState().logout();
                      navigation.replace('Login');
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map(item => (
            <Pressable
              key={item.id}
              onPress={item.onPress}
              style={[
                styles.menuItem,
                item.id === 'upgrade' && styles.menuItemUpgrade,
              ]}
            >
              <Icon
                name={item.icon}
                size={24}
                color={item.id === 'upgrade' ? '#FFFFFF' : item.iconColor}
              />
              <Text
                style={[
                  styles.menuItemText,
                  item.id === 'upgrade' && styles.menuItemTextUpgrade,
                ]}
              >
                {item.title}
              </Text>
              <Icon
                name="chevron-forward"
                size={20}
                color={item.id === 'upgrade' ? '#FFFFFF' : '#808080'}
                style={styles.chevron}
              />
            </Pressable>
          ))}
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
  header: {
    marginVertical: '5%',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileIconContainer: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  profilePhone: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  profileEmail: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  completedButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  completedText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
  menuItemUpgrade: {
    backgroundColor: '#FFA500',
    borderColor: '#FFA500',
  },
  menuItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  menuItemTextUpgrade: {
    color: '#FFFFFF',
  },
  chevron: {
    marginLeft: 'auto',
  },
});
