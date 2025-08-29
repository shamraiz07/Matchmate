// src/screens/Fisherman/Boats/BoatsListScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import PALETTE from '../../../theme/palette';
import { getBoats, Boat } from '../../../services/boat';

export default function BoatsListScreen() {
  const navigation = useNavigation();
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchBoats();
  }, []);

  const fetchBoats = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setPage(1);
        setHasMore(true);
      }

      const response = await getBoats(pageNum, 10);
      
      if (refresh) {
        setBoats(response.data);
      } else {
        setBoats(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.data.length === 10);
      setPage(pageNum);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch boats');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBoats(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      fetchBoats(page + 1);
    }
  };

  const renderBoatItem = ({ item }: { item: Boat }) => (
    <TouchableOpacity
      style={styles.boatCard}
      onPress={() => navigation.navigate('BoatDetails' as never, { boatId: item.id } as never)}
    >
      <View style={styles.boatImageContainer}>
        {item.photos && item.photos.length > 0 ? (
          <Image source={{ uri: item.photos[0] }} style={styles.boatImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="directions-boat" size={40} color={PALETTE.text500} />
          </View>
        )}
      </View>
      
      <View style={styles.boatInfo}>
        <Text style={styles.boatName}>{item.name}</Text>
        <Text style={styles.boatRegistration}>Reg: {item.registration_number}</Text>
        <Text style={styles.boatType}>{item.type}</Text>
        
        <View style={styles.boatSpecs}>
          <View style={styles.specItem}>
            <Icon name="straighten" size={16} color={PALETTE.text500} />
            <Text style={styles.specText}>{item.length}m × {item.width}m</Text>
          </View>
          
          <View style={styles.specItem}>
            <Icon name="scale" size={16} color={PALETTE.text500} />
            <Text style={styles.specText}>{item.tonnage} tons</Text>
          </View>
          
          <View style={styles.specItem}>
            <Icon name="engineering" size={16} color={PALETTE.text500} />
            <Text style={styles.specText}>{item.engine_power}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.boatActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('BoatDetails' as never, { boatId: item.id } as never)}
        >
          <Icon name="visibility" size={20} color={PALETTE.green700} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditBoat' as never, { boatId: item.id } as never)}
        >
          <Icon name="edit" size={20} color={PALETTE.blue700} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={PALETTE.green700} />
        <Text style={styles.loadingText}>Loading more boats...</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PALETTE.green700} />
          <Text style={styles.loadingText}>Loading boats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={PALETTE.text900} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>All Boats</Text>
          <Text style={styles.headerSubtitle}>
            {boats.length} boat{boats.length !== 1 ? 's' : ''} registered
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddBoat' as never)}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={boats}
        renderItem={renderBoatItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="directions-boat" size={64} color={PALETTE.text400} />
            <Text style={styles.emptyTitle}>No Boats Found</Text>
            <Text style={styles.emptySubtitle}>
              Start by registering your first boat
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddBoat' as never)}
            >
              <Text style={styles.emptyButtonText}>Register Boat</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: PALETTE.text900,
  },
  headerSubtitle: {
    fontSize: 14,
    color: PALETTE.text500,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: PALETTE.green700,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  boatCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boatImageContainer: {
    marginRight: 16,
  },
  boatImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: PALETTE.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boatInfo: {
    flex: 1,
  },
  boatName: {
    fontSize: 18,
    fontWeight: '700',
    color: PALETTE.text900,
    marginBottom: 4,
  },
  boatRegistration: {
    fontSize: 14,
    color: PALETTE.text600,
    marginBottom: 4,
  },
  boatType: {
    fontSize: 14,
    color: PALETTE.green700,
    fontWeight: '600',
    marginBottom: 8,
  },
  boatSpecs: {
    gap: 4,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    fontSize: 12,
    color: PALETTE.text500,
  },
  boatActions: {
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: PALETTE.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: PALETTE.text500,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: PALETTE.text900,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: PALETTE.text500,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: PALETTE.green700,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
