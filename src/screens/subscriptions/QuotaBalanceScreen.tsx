import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';
import { useUser_Quota_Balance } from '../../service/Hooks/User_Report_Hook';

interface QuotaItemProps {
  icon: string;
  title: string;
  consumed: number;
  limit: number | null;
  remaining: number | null;
}

function QuotaItem({ icon, title, consumed, limit, remaining }: QuotaItemProps) {
  const isUnlimited = limit === null;
  const displayRemaining = remaining !== null ? remaining : null;
  const percentage = isUnlimited ? 0 : limit! > 0 ? (consumed / limit!) * 100 : 0;

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
          {isUnlimited ? (
            <View style={styles.unlimitedBox}>
              <Text style={styles.unlimitedText}>∞</Text>
            </View>
          ) : (
            <View style={styles.quotaTotalBox}>
              <Text style={styles.quotaTotal}>{limit}</Text>
            </View>
          )}
          {isUnlimited ? (
            <Text style={styles.unlimitedRemainingText}>Unlimited</Text>
          ) : (
            <Text style={styles.quotaRemaining}>
              {displayRemaining !== null ? `${displayRemaining} left` : 'N/A'}
            </Text>
          )}
        </View>
      </View>
      {isUnlimited ? (
        <View style={styles.unlimitedProgressContainer}>
          <View style={styles.unlimitedProgressBar}>
            <Text style={styles.unlimitedProgressText}>∞ Unlimited Access</Text>
          </View>
        </View>
      ) : (
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
      )}
    </View>
  );
}

export default function QuotaBalanceScreen({ navigation }: any) {
  const { data: quotaData, isLoading, isFetching, refetch } = useUser_Quota_Balance();
  
  const handleBack = () => {
    if (navigation && navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  // Pull-to-refresh handler
  const onRefresh = () => {
    refetch();
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (error) {
      return 'N/A';
    }
  };

  // Extract data from API response
  const planName = quotaData?.data?.plan?.name || quotaData?.data?.plan?.tier?.toUpperCase() || 'FREE PACKAGE';
  const subscriptionStatus = quotaData?.data?.subscription_status;
  const isActive = subscriptionStatus?.is_active || false;
  const expiresAt = subscriptionStatus?.expires_at;
  const lastResetAt = quotaData?.data?.last_reset_at;
  const quotaDataFromAPI = quotaData?.data?.quota || {};

  // Map quota data to display format
  const quotas = [
    {
      icon: 'person-add',
      title: 'CONNECTION REQUESTS',
      consumed: quotaDataFromAPI?.connections?.used || 0,
      limit: quotaDataFromAPI?.connections?.limit ?? null,
      remaining: quotaDataFromAPI?.connections?.remaining ?? null,
    },
    {
      icon: 'chatbubbles',
      title: 'CHATS LIMIT',
      consumed: quotaDataFromAPI?.chat_users?.used || 0,
      limit: quotaDataFromAPI?.chat_users?.limit ?? null,
      remaining: quotaDataFromAPI?.chat_users?.remaining ?? null,
    },
    {
      icon: 'call',
      title: 'CALLS LIMIT',
      consumed: quotaDataFromAPI?.sessions?.used || 0,
      limit: quotaDataFromAPI?.sessions?.limit ?? null,
      remaining: quotaDataFromAPI?.sessions?.remaining ?? null,
    },
  ];

  if (isLoading && !isFetching) {
    return (
      <View style={styles.container}>
        <Header title="Quota Balance" onBack={handleBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading quota data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Quota Balance" onBack={handleBack} />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={onRefresh}
            colors={['#FFD700']}
            tintColor="#FFD700"
            progressBackgroundColor="#000000"
          />
        }
      >
        <View style={styles.packageCard}>
          <Text style={styles.packageTitle}>{planName}</Text>
          {isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>Active</Text>
            </View>
          )}
          <View style={styles.validityContainer}>
            {lastResetAt && (
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Last Reset:</Text>
                <Text style={styles.validityText}>{formatDate(lastResetAt)}</Text>
              </View>
            )}
            {expiresAt && (
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Expires:</Text>
                <Text style={styles.validityText}>{formatDate(expiresAt)}</Text>
              </View>
            )}
            {subscriptionStatus?.days_remaining !== undefined && (
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Days Left:</Text>
                <Text style={styles.validityText}>{subscriptionStatus.days_remaining} days</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.quotasContainer}>
          {quotas.map((quotaItem, index) => (
            <QuotaItem
              key={index}
              icon={quotaItem.icon}
              title={quotaItem.title}
              consumed={quotaItem.consumed}
              limit={quotaItem.limit}
              remaining={quotaItem.remaining}
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
    backgroundColor: '#000000',
    padding: 16,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  packageCard: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#D4AF37',
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
    marginTop: 12,
    gap: 8,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
  },
  validityText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    opacity: 0.7,
  },
  quotasContainer: {
    gap: 16,
  },
  quotaCard: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#D4AF37',
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
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quotaInfo: {
    flex: 1,
  },
  quotaTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  quotaConsumed: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
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
    color: '#000000',
    fontSize: 20,
    fontWeight: '700',
  },
  quotaRemaining: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    // paddingVertical: 2,
  },
  progressText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '600',
  },
  unlimitedBox: {
    backgroundColor: '#D4AF37',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlimitedText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '700',
  },
  unlimitedRemainingText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
    opacity: 1,
  },
  unlimitedProgressContainer: {
    height: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  unlimitedProgressBar: {
    height: '100%',
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
  },
  unlimitedProgressText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '700',
  },
});

