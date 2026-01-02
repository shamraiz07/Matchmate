import React, { useState, useEffect, useMemo } from 'react';
import { Text, FlatList, Pressable, StyleSheet, View } from 'react-native';
import Screen from '../../components/Screen';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSee_AllConservation } from '../../service/Hooks/User_Conservation_Hook';
import { useAuthStore } from '../../store/Auth_store';
import { buildConversationList } from '../../constants/ChatHelper';
import { useFocusEffect } from '@react-navigation/native';

interface ConversationItem {
  id: number;
  user: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  lastMessage?: string;
  latest_message?: {
    content: string;
    created_at: string;
  };
  timestamp: string;
  isFavorite?: boolean;
}

export default function MessagesScreen({ navigation }: any) {
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteChats, setFavoriteChats] = useState<Set<number>>(new Set());
  const user = useAuthStore(state => state.user);
  const { data: chatMutation } = useSee_AllConservation();
  const currentUserId = user?.meta?.user_id;

  // Load favorite chats from AsyncStorage
  const loadFavoriteChats = async () => {
    try {
      const stored = await AsyncStorage.getItem('favoriteChats');
      if (stored) {
        const favorites = JSON.parse(stored);
        setFavoriteChats(new Set(favorites));
      }
    } catch (error) {
      console.log('Error loading favorite chats:', error);
    }
  };

  // Load favorites on mount and when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadFavoriteChats();
    }, []),
  );

  useEffect(() => {
    loadFavoriteChats();
  }, []);

  // Build conversation list with latest messages at top
  const conversationList: ConversationItem[] = useMemo(() => {
    const list = buildConversationList(chatMutation?.data || [], currentUserId);
    return (list || []) as ConversationItem[];
  }, [chatMutation?.data, currentUserId]);

  // Add favorite status to conversation list
  const conversationListWithFavorites: ConversationItem[] = useMemo(() => {
    return conversationList.map((conv) => {
      const convItem = conv as ConversationItem;
      return {
        ...convItem,
        isFavorite: favoriteChats.has(convItem.id),
      };
    });
  }, [conversationList, favoriteChats]);

  // Filter favorites when showFavorites is true
  const displayChats: ConversationItem[] = useMemo(() => {
    if (showFavorites) {
      return conversationListWithFavorites.filter(chat => chat.isFavorite);
    }
    return conversationListWithFavorites;
  }, [showFavorites, conversationListWithFavorites]);

  const favoriteChatsCount = conversationListWithFavorites.filter(
    chat => chat.isFavorite,
  ).length;

  const toggleFavorite = async (userId: number) => {
    try {
      const updatedFavorites = new Set(favoriteChats);
      const isCurrentlyFavorite = updatedFavorites.has(userId);

      if (isCurrentlyFavorite) {
        updatedFavorites.delete(userId);
      } else {
        updatedFavorites.add(userId);
      }

      // Save to AsyncStorage
      const favoritesArray = Array.from(updatedFavorites);
      await AsyncStorage.setItem('favoriteChats', JSON.stringify(favoritesArray));

      // Update state
      setFavoriteChats(updatedFavorites);
    } catch (error) {
      console.log('Error toggling favorite:', error);
    }
  };
  return (
    <Screen>
      <Text style={styles.title}>Messages</Text>
      <Pressable
        style={styles.favoriteBar}
        onPress={() => setShowFavorites(!showFavorites)}
      >
        <Icon
          name={showFavorites ? 'star' : 'star-outline'}
          size={20}
          color="#D4AF37"
        />
        <Text style={styles.favoriteBarText}>Favourite Chats</Text>
        {showFavorites && favoriteChatsCount > 0 && (
          <Text style={styles.favoriteCount}>({favoriteChatsCount})</Text>
        )}
        <Icon
          name={showFavorites ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#D4AF37"
          style={styles.chevronIcon}
        />
      </Pressable>

      <FlatList
        data={displayChats}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="star-outline" size={48} color="#8C8A9A" />
            <Text style={styles.emptyText}>
              {showFavorites
                ? 'No favorite chats yet'
                : 'No conversations yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {showFavorites
                ? 'Tap the star icon on a chat to add it to favorites'
                : 'Start a conversation to see messages here'}
            </Text>
          </View>
        }
        renderItem={({ item }: { item: ConversationItem }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('Chat', {
                otherUserId: item.user.id,
                otherUser: item.user,
              })
            }
            style={styles.card}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>
                  {item?.user?.username || item?.user?.first_name || 'Unknown'}
                </Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>
                  {item?.latest_message?.content || item?.lastMessage || ''}
                </Text>
              </View>
              <Pressable
                onPress={e => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
                style={styles.favoriteButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon
                  name={item.isFavorite ? 'star' : 'star-outline'}
                  size={24}
                  color={item.isFavorite ? '#FFD700' : '#D4AF37'}
                />
              </Pressable>
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#D4AF37',
    fontSize: 22,
    fontWeight: '700',
    height: 50,
    marginTop: '10%',
  },
  favoriteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  favoriteBarText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  favoriteCount: {
    color: '#8C8A9A',
    fontSize: 14,
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 14,
  },
  favoriteButton: {
    padding: 4,
    marginLeft: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#8C8A9A',
    fontSize: 14,
    textAlign: 'center',
  },
});
