import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useMemo } from 'react';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/Feather';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {
  useAcceptConnection,
  useRejectConnection,
  useSeeAllFriendConnectionByOthers,
} from '../../service/Hooks/User_Connection_Hook';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useQueryClient } from '@tanstack/react-query';
import { BASE_URL_IMAGE } from '../../constants/config';
const Connection = ({ navigation }: any) => {
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };
  const queryClient = useQueryClient();
  const {
    data: connectiondata,
    isLoading,
    isFetching,
    refetch,
  } = useSeeAllFriendConnectionByOthers();
  const Accept_mutation = useAcceptConnection();
  const Reject_mutation = useRejectConnection();
  // Auto-refetch when screen becomes active
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Pull-to-refresh
  const onRefresh = () => {
    refetch();
  };
  const AcceptConnectionHandle = ({ item }: any) => {
    try {
      console.log('itemmmmmmmmmm', item);
      const payload = {
        connection_id: item?.connection_id,
      };
      Accept_mutation.mutateAsync(
        { payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['SeeAllConnected'] });
            queryClient.invalidateQueries({ queryKey: ['SeeAllFriendConnectionByOthers'] });
            refetch();
            Toast.show({
              type: 'success',
              text1: 'Connection Accepted',
              text2: 'You are now connected with this user',
            });
          },
          onError: err => {
            console.log('error', err, JSON.stringify(err));
          },
        },
      );
    } catch (error) {
      console.log('Errorrr_AcceptConnectionHandle', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
      });
    }
  };
  const RejectConnectionHandle = ({ item }: any) => {
    try {
      console.log('itemmmmmmmmmm', item);
      const payload = {
        connection_id: item?.connection_id,
      };
      Reject_mutation.mutateAsync(
        { payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['SeeAllConnected'] });
            queryClient.invalidateQueries({ queryKey: ['SeeAllFriendConnectionByOthers'] });
            refetch();
            Toast.show({
              type: 'success',
              text1: 'Connection Rejected',
              text2: 'The connection request has been rejected',
            });
          },
          onError: err => {
            console.log('error', err, JSON.stringify(err));
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to reject connection request',
            });
          },
        },
      );
    } catch (error) {
      console.log('Errorrr_RejectConnectionHandle', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred',
      });
    }
  };
  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        style={styles.connection_mainbox}
        onPress={() => {
          navigation.navigate('ConnectionRequestDetail', {
            connectionRequest: item,
          });
        }}
        activeOpacity={0.8}
      >
        {/* Left Side */}
        <View style={styles.connection_firstbox}>
          <Image
            source={{
              uri:
                `${BASE_URL_IMAGE}${item?.friend?.profile?.profile_picture}` ||
                'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d',
            }}
            style={styles.profileImage}
          />

          <View>
            <Text style={styles.connection_mainbox_text}>
              {item?.friend?.first_name} {item?.friend?.last_name}
            </Text>
            <Text style={styles.connection_mainbox_text}>{item?.friend?.profile?.candidate_name}</Text>
          </View>
        </View>

        {/* Right Side */}
        <View style={styles.connection_secondary_mainbox}>
          <TouchableOpacity
            style={styles.connection_secondarybox}
            onPress={(e) => {
              e.stopPropagation();
              AcceptConnectionHandle({ item });
            }}
          >
            <Icon name={'check'} size={25} color={'white'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.connection_secondarybox}
            onPress={(e) => {
              e.stopPropagation();
              RejectConnectionHandle({ item });
            }}
          >
            <EvilIcons name={'close'} size={25} color={'white'} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
  // Sort connection requests by latest first (most recent on top)
  const sortedConnectionData = useMemo(() => {
    const data = connectiondata?.data || [];
    return [...data].sort((a, b) => {
      // Sort by created_at if available, otherwise by id (higher id = newer)
      const aDate = a?.created_at ? new Date(a.created_at).getTime() : (a?.connection_id || a?.id || 0);
      const bDate = b?.created_at ? new Date(b.created_at).getTime() : (b?.connection_id || b?.id || 0);
      return bDate - aDate; // Descending order (newest first)
    });
  }, [connectiondata?.data]);

  console.log(
    'connectiondata------------------------------->>>>>>>>>>>',
    connectiondata,
  );

  return (
    <View>
      <Header title="Connections" onBack={handleBack} />
      <FlatList
        data={sortedConnectionData}
        keyExtractor={(item, index) => item?.connection_id?.toString() || item?.id?.toString() || index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        // Pull to Refresh
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={onRefresh}
            colors={['#D4AF37']}
          />
        }
        // Empty List UI
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>
              No connections found.
            </Text>
          ) : null
        }
        // Loading UI
        ListHeaderComponent={
          isLoading ? (
            <Text style={styles.loadingText}>
              Loading...
            </Text>
          ) : null
        }
      />
    </View>
  );
};

export default Connection;

const styles = StyleSheet.create({
  connection_mainbox: {
    backgroundColor: 'black',
    flexDirection: 'row',
    marginVertical: 7,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,

    // ✨ Gold Border Style
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderRadius: 15,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 100,
    elevation: 16, // For Android shadow
  },
  connection_firstbox: {
    flexDirection: 'row',
    gap: 15,
    // justifyContent: 'space-around',
    alignItems: 'center',
  },
  connection_secondarybox: {
    margin: 10,
    padding: 10,
    borderRadius: 100,
    // ✨ Gold Border Style
    borderWidth: 2,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0.8,
    // shadowRadius: 10,
    // elevation: 10, // For Android shadow
    // alignSelf: 'flex-end',
  },
  connection_secondary_mainbox: {
    flexDirection: 'row',
  },
  connection_mainbox_text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 500,
  },
  emptyText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 50,
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 100,
  },
});

