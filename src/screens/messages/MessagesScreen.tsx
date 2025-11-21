import React, { useState } from 'react';
import { Text, FlatList, Pressable, StyleSheet, View } from 'react-native';
import Screen from '../../components/Screen';
import Icon from 'react-native-vector-icons/Ionicons';

const CHATS = Array.from({ length: 6 }).map((_, i) => ({
  id: String(i + 1),
  name: `Chat ${i + 1}`,
  last: 'Assalam o Alaikum',
  isFavorite: i < 2, // First 2 chats are favorites for demo
}));

export default function MessagesScreen({ navigation }: any) {
  const [chats, setChats] = useState(CHATS);
  const [showFavorites, setShowFavorites] = useState(false);

  const favoriteChats = chats.filter(chat => chat.isFavorite);
  const displayChats = showFavorites ? favoriteChats : chats;

  const toggleFavorite = (chatId: string) => {
    setChats(chats.map(chat => 
      chat.id === chatId ? { ...chat, isFavorite: !chat.isFavorite } : chat
    ));
  };

  return (
    <Screen>
      <Text style={styles.title}>Messages</Text>
      
      <Pressable 
        style={styles.favoriteBar}
        onPress={() => setShowFavorites(!showFavorites)}>
        <Icon 
          name={showFavorites ? "star" : "star-outline"} 
          size={20} 
          color="#D4AF37" 
        />
        <Text style={styles.favoriteBarText}>Favourite Chats</Text>
        {showFavorites && favoriteChats.length > 0 && (
          <Text style={styles.favoriteCount}>({favoriteChats.length})</Text>
        )}
        <Icon 
          name={showFavorites ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#D4AF37" 
          style={styles.chevronIcon}
        />
      </Pressable>

      <FlatList
        data={displayChats}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="star-outline" size={48} color="#8C8A9A" />
            <Text style={styles.emptyText}>No favorite chats yet</Text>
            <Text style={styles.emptySubtext}>Tap the star icon on a chat to add it to favorites</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('Chat', { id: item.id })}
            style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.last}</Text>
              </View>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
                style={styles.favoriteButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon 
                  name={item.isFavorite ? "star" : "star-outline"} 
                  size={24} 
                  color="#D4AF37" 
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

