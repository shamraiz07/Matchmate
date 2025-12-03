import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Screen from '../../components/Screen';

const SearchResultsScreen = ({ route, navigation }) => {
  const { results } = route.params;
  console.log(
    'search_resulttt----------------////////////////////////',
    results,
  );
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
      </View>
      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('Chat', { id: item.id })}
            style={styles.card}
          >
            <ImageBackground
              source={{ uri: item?.profile_picture }}
              style={{
                height: '100%',
                width: '100%',
                justifyContent: 'center',
                // alignItems: 'center',
                // borderRadius: 120,
              }}
              blurRadius={1}
              resizeMode="cover"
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: '800',
                  textAlign: 'center',
                  textShadowColor: 'rgba(0, 0, 0, 0.9)',
                  textShadowOffset: { width: 2, height: 2 },
                  textShadowRadius: 6,
                }}
              >
                {item?.candidate_name}
              </Text>
              <View style={styles.main_head_boxed}>
                <View style={styles.head_boxed}>
                  <Text style={styles.head_boxed_text}>
                    {item?.marital_status}
                  </Text>
                </View>
                <View style={styles.head_boxed}>
                  <Text style={styles.head_boxed_text}>
                    {calculateAge(item?.date_of_birth || '')}
                  </Text>
                </View>
                <View style={styles.head_boxed}>
                  <Text style={styles.head_boxed_text}>{item?.caste}</Text>
                </View>
                <View style={styles.head_boxed}>
                  <Text style={styles.head_boxed_text}>{item?.city}</Text>
                </View>
                <View style={styles.head_boxed}>
                  <Text style={styles.head_boxed_text}>
                    {item?.education_level}
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        )}
        contentContainerStyle={{
          flexDirection: 'row',
          gap: 10,
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          // borderWidth:2,
          // borderColor:'white'
        }}
        numColumns={2}
      />
    </Screen>
  );
};

export default SearchResultsScreen;

const styles = StyleSheet.create({
  header: {
    height: 80,
    marginTop: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: '#D4AF37', fontSize: 22, fontWeight: '700' },
  filterText: { color: '#D4AF37' },
  card: {
    backgroundColor: '#1A1A1A',
    borderWidth: 0.75,
    borderColor: '#D4AF37',
    padding: 10,
    height: 240,
    margin: 4,
    width: 180,
    borderRadius: 12,
    // marginTop: 12,
  },
  cardTitle: { color: '#FFFFFF', fontWeight: '700' },
  cardSubtitle: { color: '#FFFFFF', opacity: 0.7 },
  head_boxed: {
    backgroundColor: 'white',
    width: 50,
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
  },
  main_head_boxed: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 },
  head_boxed_text: {
    textAlign: 'center',
  },
});
