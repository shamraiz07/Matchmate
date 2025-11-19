import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';

interface QuotaItemProps {
  icon: string;
  title: string;
  consumed: number;
  total: number;
}

function QuotaItem({ icon, title, consumed, total }: QuotaItemProps) {
  const remaining = total - consumed;
  const percentage = total > 0 ? (consumed / total) * 100 : 0;

  return (
    <View style={styles.quotaCard}>
      <View style={styles.quotaHeader}>
        <View style={styles.quotaIconContainer}>
          <Icon name={icon} size={24} color="#D4AF37" />
        </View>
        <View style={styles.quotaInfo}>
          <Text style={styles.quotaTitle}>{title}</Text>
          <Text style={styles.quotaConsumed}>{consumed} consumed</Text>
        </View>
        <View style={styles.quotaTotalContainer}>
          <View style={styles.quotaTotalBox}>
            <Text style={styles.quotaTotal}>{total}</Text>
          </View>
          <Text style={styles.quotaRemaining}>{remaining} left</Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${Math.min(percentage, 100)}%` },
          ]}>
          {percentage > 0 && (
            <Text style={styles.progressText}>{Math.round(percentage)}%</Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default function QuotaBalanceScreen({ navigation }: any) {
  const handleBack = () => {
    if (navigation && navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };
  const quotas = [
    {
      icon: 'eye',
      title: 'VIEW PROFILES',
      consumed: 3,
      total: 15,
    },
    {
      icon: 'person-add',
      title: 'CONNECTION REQUESTS',
      consumed: 0,
      total: 3,
    },
    {
      icon: 'image',
      title: 'IMAGE REQUESTS',
      consumed: 0,
      total: 0,
    },
    {
      icon: 'chatbubbles',
      title: 'CHATS LIMIT',
      consumed: 0,
      total: 3,
    },
    {
      icon: 'call',
      title: 'CALLS LIMIT',
      consumed: 0,
      total: 3,
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="Quota Balance" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.packageCard}>
          <Text style={styles.packageTitle}>FREE PACKAGE</Text>
          <View style={styles.activeBadge}>
            <Text style={styles.activeText}>Active</Text>
          </View>
          <View style={styles.validityContainer}>
            <Text style={styles.validityText}>31 Oct 2025</Text>
            <Text style={styles.validityText}>30 Nov 2025</Text>
          </View>
        </View>

        <View style={styles.quotasContainer}>
          {quotas.map((quota, index) => (
            <QuotaItem
              key={index}
              icon={quota.icon}
              title={quota.title}
              consumed={quota.consumed}
              total={quota.total}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  packageTitle: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  activeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  validityContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  validityText: {
    color: '#000000',
    fontSize: 14,
    opacity: 0.7,
  },
  quotasContainer: {
    gap: 16,
  },
  quotaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  quotaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quotaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quotaInfo: {
    flex: 1,
  },
  quotaTitle: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  quotaConsumed: {
    color: '#000000',
    fontSize: 12,
    opacity: 0.6,
  },
  quotaTotalContainer: {
    alignItems: 'flex-end',
  },
  quotaTotalBox: {
    backgroundColor: '#D4AF37',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  quotaTotal: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  quotaRemaining: {
    color: '#000000',
    fontSize: 12,
    opacity: 0.6,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});

