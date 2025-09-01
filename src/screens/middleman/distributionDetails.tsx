import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList } from 'react-native';

const Distribution = [
  {
    id: '1',
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
    lots: [
      {
        number: 'LOT-20250826-001',
        species: 'Tuna',
        quantity: '25.00 KG',
        notes: 'Nothing',
      },
      {
        number: 'LOT-20250826-002',
        species: 'Shrimp',
        quantity: '25.00 KG',
        notes: 'Nothing',
      },
    ],
    totalLots: 2,
    lotsTotalQuantity: '50.00 KG',
    verifiedBy: 'MFD Staff',
    verifiedAt: 'Aug 26, 2025 13:52',
    fishermanName: 'Fisher Man',
    fishermanRole: 'Fishermen',
    fishermanEmail: 'fisher.man@gmail.com',
    fishermanPhone: '03004554587',
    middleManName: 'Middle Man',
    middleManRole: 'Middle_man',
    middleManEmail: 'middle.man@gmail.com',
    middleManPhone: '03215487963',
  },
];

export default function DistributionDetails() {
//   const [example, setExample] = useState([]);
//   useEffect(() => {
//     getExample();
//   }, []);
//   const getExample = () => {
//     const URL = '';
//     fetch(URL)
//       .then(res => {
//         return res.json();
//       })
//       .then(data => {
//         setExample(data);
//       });
//   };
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <FlatList
        data={Distribution}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const statusColor =
            item.status === 'VERIFIED'
              ? '#4CAF50'
              : item.status === 'PENDING'
              ? '#FF9800'
              : '#E53935';
          return (
            <View style={styles.distributionHead}>
              <Text style={styles.distributionName}>
                {item.distributionName}
              </Text>
              <View
                style={[styles.statusBadge, { backgroundColor: statusColor }]}
              >
                <Text style={styles.statusName}>{item.status}</Text>
              </View>
            </View>
          );
        }}
      />

      {/* Distribution Information */}
      <InfoCard title="ℹ️ Distribution Information">
        <FlatList
          data={Distribution}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <>
              <DataRow label="Total Quantity" value={item.totalQuantity} />
              <DataRow label="Total Value" value={item.totalValue} />
              <DataRow label="Created Date" value={item.createdDate} />
              <DataRow label="Updated Date" value={item.updatedDate} />
            </>
          )}
        />
      </InfoCard>

      {/* Trip Information */}
      <InfoCard title="🚢 Trip Information">
        <FlatList
          data={Distribution}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <>
              <DataRow label="TRIP ID" value={item.tripId} />
              <DataRow label="Boat Name" value={item.boatName} />
              <DataRow label="Departure Site" value={item.departureSite} />
              <DataRow label="Landing Site" value={item.landingSite} />
              <DataRow label="Trip Status" value={item.tripStatus} />
              <DataRow label="Trip Completed" value={item.tripCompleted} />
            </>
          )}
        />
      </InfoCard>

      {/* Distributed Lots */}
      <InfoCard title="🐟 Distributed Lots">
        <FlatList
          data={Distribution}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <>
              <View style={styles.lotTable}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderCell}>Lot Number</Text>
                  <Text style={styles.tableHeaderCell}>Species</Text>
                  <Text style={styles.tableHeaderCell}>Quantity</Text>
                  <Text style={styles.tableHeaderCell}>Notes</Text>
                </View>

                {/* Dynamic Rows */}
                {item.lots.map((lot, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tableRow,
                      index % 2 !== 0 && styles.altRow, // zebra striping
                    ]}
                  >
                    <Text style={styles.tableCell}>{lot.number}</Text>
                    <Text style={styles.tableCell}>{lot.species}</Text>
                    <Text style={styles.tableCell}>{lot.quantity}</Text>
                    <Text style={styles.tableCell}>{lot.notes}</Text>
                  </View>
                ))}
              </View>

              {/* Totals */}
              <DataRow label="Total Lots" value={item.totalLots} />
              <DataRow label="Total Quantity" value={item.lotsTotalQuantity} />
            </>
          )}
        />
      </InfoCard>

      {/* Verification Details */}
      <InfoCard title="✅ Verification Details">
        <FlatList
          data={Distribution}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <>
              <DataRow label="Verified By" value={item.verifiedBy} />
              <DataRow label="Verified At" value={item.verifiedAt} />
            </>
          )}
        />
      </InfoCard>

      {/* Fisherman */}
      <InfoCard title="👤 Fisher Man">
        <FlatList
          data={Distribution}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <>
              <Text style={styles.personName}>{item.fishermanName}</Text>
              <Text style={styles.personRole}>{item.fishermanRole}</Text>
              <DataRow label="Email" value={item.fishermanEmail} />
              <DataRow label="Phone" value={item.fishermanPhone} />
            </>
          )}
        />
      </InfoCard>

      {/* Middle Man */}
      <InfoCard title="👨‍💼 Middle Man">
        <FlatList
          data={Distribution}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <>
              <Text style={styles.personName}>{item.middleManName}</Text>
              <Text style={styles.personRole}>{item.middleManRole}</Text>
              <DataRow label="Email" value={item.middleManEmail} />
              <DataRow label="Phone" value={item.middleManPhone} />
            </>
          )}
        />
      </InfoCard>

      {/* Actions */}
      <InfoCard title="⚙️ Actions">
        <FlatList
          data={Distribution}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <></>}
        />
      </InfoCard>
    </ScrollView>
  );
}

/* Reusable Components */
const InfoCard = ({ title, children }) => (
  <View style={styles.upperCard}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const DataRow = ({ label, value }) => (
  <View style={styles.innerCard}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.mainData}>{value}</Text>
  </View>
);

/* Styles */
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
  },
  distributionHead: {
    backgroundColor: '#2E7D32',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  distributionName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  statusBadge: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  upperCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 12,
    color: '#333',
  },
  label: {
    color: '#555',
    fontSize: 14,
    marginBottom: 4,
  },
  innerCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  mainData: {
    fontWeight: '600',
    fontSize: 15,
    color: '#222',
  },
  lotTable: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: '700',
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  altRow: {
    backgroundColor: '#f9f9f9', // zebra striping
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    textAlign: 'center',
    color: '#333',
  },
  personName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 2,
  },
  personRole: {
    color: '#777',
    fontWeight: '500',
    marginBottom: 12,
    marginLeft: 4,
  },
});
