import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';

interface VerificationAttributeProps {
  icon: string;
  title: string;
  status: 'pending' | 'verified' | 'not_started';
  onPress: () => void;
}

function VerificationAttribute({ icon, title, status, onPress }: VerificationAttributeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'verified':
        return '#4CAF50';
      case 'pending':
        return '#FFA500';
      default:
        return '#808080';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending';
      default:
        return 'Not Verified';
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.attributeCard}>
      <View style={styles.attributeContent}>
        <View style={[styles.iconContainer, { borderColor: getStatusColor() }]}>
          <Icon name={icon} size={28} color={getStatusColor()} />
        </View>
        <View style={styles.attributeInfo}>
          <Text style={styles.attributeTitle}>{title}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
        <Icon name="chevron-forward" size={20} color="#808080" />
      </View>
    </Pressable>
  );
}

export default function ProfileVerificationScreen({ navigation }: any) {
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const [attributes, setAttributes] = useState([
    { id: 'name', icon: 'person', title: 'Name', status: 'not_started' as const },
    { id: 'age', icon: 'calendar', title: 'Age', status: 'not_started' as const },
    { id: 'photo', icon: 'camera', title: 'Photo', status: 'not_started' as const },
    { id: 'nationality', icon: 'flag', title: 'Nationality', status: 'not_started' as const },
    { id: 'address', icon: 'location', title: 'Address', status: 'not_started' as const },
  ]);

  const handleAttributePress = (id: string, title: string) => {
    navigation.navigate('VerificationUpload', {
      attributeId: id,
      attributeName: title,
    });
  };

  return (
    <Screen>
      <Header title="Profile Verification" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Select attribute to be verified</Text>
        <Text style={styles.subtitle}>
          Choose an attribute below and upload the relevant document for verification
        </Text>

        <View style={styles.attributesContainer}>
          {attributes.map((attr) => (
            <VerificationAttribute
              key={attr.id}
              icon={attr.icon}
              title={attr.title}
              status={attr.status}
              onPress={() => handleAttributePress(attr.id, attr.title)}
            />
          ))}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Icon name="information-circle" size={20} color="#D4AF37" />
            <Text style={styles.infoText}>
              Verification typically takes 24-48 hours after document submission
            </Text>
          </View>
        </View>

        <Pressable style={styles.viewRequestsButton}>
          <Icon name="document-text" size={20} color="#FFFFFF" />
          <Text style={styles.viewRequestsText}>View Submitted Requests</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  pageTitle: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 20,
  },
  attributesContainer: {
    marginBottom: 24,
    gap: 12,
  },
  attributeCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
  },
  attributeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  attributeInfo: {
    flex: 1,
  },
  attributeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.8,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  viewRequestsButton: {
    backgroundColor: '#FFA500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  viewRequestsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

