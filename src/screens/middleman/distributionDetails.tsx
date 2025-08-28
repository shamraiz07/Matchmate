import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';

const Distribution = [
  {
    distributionName: 'DIST-1',
    status: 'VERIFIED',
    totalQuantity: '50.00 KG',
    totalValue: 'N/A',
    createdDate: 'Aug 26, 2025 13:51',
    updatedDate: 'Aug 26, 2025 13:52',
    tripId: 'TRIP-20250826-001',
    boatName: 'Sea Explorer',
    departureSite: 'karachi_fish_harbor',
    landingSite: 'korangi_fish_harbor',
    tripStatus: 'Completed',
    tripCompleted: 'Yes',
    lot1Number: 'LOT-20250826-001',
    lot1Species: 'Tuna',
    lot1Quantity: '25.00 KG',
    lot1Notes: 'Nothing',
    lot2Number: 'LOT-20250826-002',
    lot2Species: 'Shrimp',
    lot2Quantity: '25.00 KG',
    lot2Notes: 'Nothing',
    totalLots: 2,
    lotsTotalQuantity: '50.00 KG',
    verifiedBy: 'MFD Staff',
    verifiedAt: 'Aug 26, 2025 13:52',
    fishermanCode: 'F',
    fishermanName: 'Fisher Man',
    fishermanGroup: 'Fishermen',
    fishermanEmail: 'fisher.man@gmail.com',
    fishermanPhone: '03004554587',
    middleManCode: 'M',
    middleManName: 'Middle Man',
    middleManGroup: 'Middle_man',
    middleManEmail: 'middle.man@gmail.com',
    middleManPhone: '03215487963',
  },
];

export default function distributionDetails() {
  return (
    <SafeAreaView>
      <View style={styles.distributionHead}>
        <Text>For name of distribution</Text>
      </View>

      <View style={styles.upperCard}>
        <Text>Fisher Man</Text>
      </View>

      <View style={styles.upperCard}>
        <Text>Middle Man</Text>
      </View>

      <View style={styles.upperCard}>
        <Text>For Distribution Information</Text>
      </View>

      <View style={styles.upperCard}>
        <Text>For Trip Information</Text>
      </View>

      <View style={styles.upperCard}>
        <Text>Distributed Lots</Text>
      </View>

      <View style={styles.upperCard}>
        <Text>Verification Details</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  distributionHead: {
    backgroundColor: '#076013ff',
    borderRadius: 30,
    padding: 10,
    marginVertical: 5,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  upperCard: {
    backgroundColor: '#c6c6c6ff',
    borderRadius: 20,
    padding: 20,
    margin: 15,
  },
});
