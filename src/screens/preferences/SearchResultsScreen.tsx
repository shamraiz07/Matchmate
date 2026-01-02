import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 16; // Horizontal padding of screen
const CARD_GAP = 8; // Gap between cards
const CARD_MARGIN = 4; // Margin around each card
// Calculate card width: (screen width - padding - gaps - margins) / 2
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP - CARD_MARGIN * 4) / 2;

interface SearchResultsScreenProps {
  route: {
    params?: {
      results?: any;
    };
  };
  navigation: any;
}

const SearchResultsScreen = ({ route, navigation }: SearchResultsScreenProps) => {
  const { results } = route.params || {};
  
  console.log('📥 SearchResultsScreen - Results:', results);
  
  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): string => {
    if (!dateOfBirth) return '';
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age.toString();
    } catch (error) {
      console.error('Error calculating age:', error);
      return '';
    }
  };

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  // Extract matching profiles from different possible response structures
  const matchingProfiles = 
    results?.matching_profiles || 
    results?.data?.matching_profiles || 
    results?.response?.data?.matching_profiles ||
    results?.results ||
    results?.data ||
    [];

  console.log('📋 Matching Profiles:', matchingProfiles);

  // Empty state
  if (!matchingProfiles || matchingProfiles.length === 0) {
    return (
      <Screen>
        <Header title="Search Results" onBack={handleBack} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No profiles found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search preferences
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Search Results" onBack={handleBack} />
      <View style={styles.header}>
        <Text style={styles.resultsCount}>
          {matchingProfiles.length} {matchingProfiles.length === 1 ? 'result' : 'results'} found
        </Text>
      </View>
      <FlatList
        data={matchingProfiles}
        keyExtractor={(item, index) => item?.id?.toString() || `profile-${index}`}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('Partnerprofile', { data: item })
            }
            style={styles.card}
          >
            <ImageBackground
              source={{
                uri: item?.profile_picture || 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d',
              }}
              style={styles.imageBackground}
              blurRadius={item?.is_public ? 1 : 0}
              resizeMode="cover"
            >
              <Text style={styles.cardTitleText}>
                {item?.candidate_name || item?.first_name || 'Name not available'}
              </Text>
              <View style={styles.main_head_boxed}>
                {item?.marital_status && (
                  <View style={styles.head_boxed}>
                    <Text style={styles.head_boxed_text} numberOfLines={1}>
                      {item.marital_status}
                    </Text>
                  </View>
                )}
                {item?.date_of_birth && (
                  <View style={styles.head_boxed}>
                    <Text style={styles.head_boxed_text} numberOfLines={1}>
                      {calculateAge(item.date_of_birth)}
                    </Text>
                  </View>
                )}
                {item?.caste && (
                <View style={styles.head_boxed}>
                    <Text style={styles.head_boxed_text} numberOfLines={1}>
                      {item.caste}
                  </Text>
                </View>
                )}
                {item?.city && (
                <View style={styles.head_boxed}>
                    <Text style={styles.head_boxed_text} numberOfLines={1}>
                      {item.city}
                  </Text>
                </View>
                )}
                {item?.education_level && (
                <View style={styles.head_boxed}>
                    <Text style={styles.head_boxed_text} numberOfLines={1}>
                      {item.education_level}
                    </Text>
                </View>
                )}
                {item?.profession && (
                <View style={styles.head_boxed}>
                    <Text style={styles.head_boxed_text} numberOfLines={1}>
                      {item.profession}
                    </Text>
                </View>
                )}
                {item?.sect && (
                <View style={styles.head_boxed}>
                    <Text style={styles.head_boxed_text} numberOfLines={1}>
                      {item.sect}
                  </Text>
                </View>
                )}
              </View>
            </ImageBackground>
          </Pressable>
        )}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No profiles found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search preferences
            </Text>
          </View>
        }
      />
    </Screen>
  );
};

export default SearchResultsScreen;

const styles = StyleSheet.create({
  header: {
    height: 50,
    paddingHorizontal: CARD_PADDING,
    justifyContent: 'center',
    marginTop: 8,
  },
  resultsCount: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: CARD_PADDING,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    gap: CARD_GAP,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderWidth: 0.75,
    borderColor: '#D4AF37',
    padding: 8,
    height: 240,
    borderRadius: 12,
    width: CARD_WIDTH,
    marginBottom: CARD_GAP,
    overflow: 'hidden',
  },
  imageBackground: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
  },
  cardTitleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  main_head_boxed: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  head_boxed: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    minWidth: 50,
    maxWidth: 70,
    height: 25,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  head_boxed_text: {
    color: '#2B2A2A',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#8C8A9A',
    fontSize: 14,
    textAlign: 'center',
  },
});
