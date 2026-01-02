import {
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import Header from '../../components/Header';
import {
  useAll_Friends_See,
  useRemove_userConnection,
} from '../../service/Hooks/User_Connection_Hook';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Entypo';
import Toast from 'react-native-toast-message';
import { useQueryClient } from '@tanstack/react-query';
import { BASE_URL_IMAGE } from '../../constants/config';
const AllUser_Friends = ({ navigation }: any) => {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const queryClient = useQueryClient();

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };
  const Remove_Connection_mutation = useRemove_userConnection();
  const {
    data: userdata,
    isLoading,
    isFetching,
    refetch,
  } = useAll_Friends_See();
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  // Pull-to-refresh
  const onRefresh = () => {
    refetch();
  };
  const renderItem = ({ item }: any) => {
    console.log('itemmmmmm--------------------',  item?.item);
    return (
      <>
        <TouchableOpacity
          style={styles.connection_mainbox}
          onPress={() =>
            navigation.navigate('Partnerprofile', {
              data: item?.item,
            })
          }
        >
          {/* Left Side */}
          <View style={styles.connection_firstbox}>
            <Image
              source={{
                uri:
                  `${BASE_URL_IMAGE}${item?.item?.friend?.profile?.profile_picture}` ||
                  'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d',
              }}
              style={{ width: 90, height: 90, borderRadius: 100 }}
            />

            <View>
              <Text style={styles.connection_mainbox_text}>
                {item?.item?.friend?.first_name} {item?.item?.friend?.last_name}
              </Text>
              <Text style={styles.connection_mainbox_text}>
                {item?.item?.friend?.username}
              </Text>
            </View>
          </View>

          {/* Right Side */}
          <View style={styles.connection_secondary_mainbox}>
            <TouchableOpacity
              style={styles.connection_secondarybox}
              onPress={() => setShowRemoveModal(true)}
            >
              <Icon name={'dots-three-horizontal'} size={25} color={'white'} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        {/* 
      // ! ||--------------------------------------------------------------------------------||
      // ! ||                                   Model_code                                   ||
      // ! ||--------------------------------------------------------------------------------||
            */}
        <Modal
          visible={showRemoveModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowRemoveModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Remove Connection?</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to remove this connection?
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setShowRemoveModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalConfirm}
                  onPress={() => {
                    setShowRemoveModal(false);
                    RemoveConnectionHandle({ item }); // call your function now
                  }}
                >
                  <Text style={styles.modalConfirmText}>Yes, Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  };

  const RemoveConnectionHandle = ({ item }) => {
    try {
      const payload = {
        connection_id: item?.item?.connection_id,
      };

      Remove_Connection_mutation.mutateAsync(
        { payload },
        {
          onSuccess: res => {
            Toast.show({
              type: 'success',
              text1: 'Remove Connection successfully',
            });

            // 🔥 Invalidate the query here
            queryClient.invalidateQueries(['SeeAllConnectedFriend']);
          },

          onError: err => {
            console.log('error', err, JSON.stringify(err));
          },
        },
      );
    } catch (error) {
      console.log('Errorrr_send_Connection', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
      });
    }
  };
  return (
    <View>
      <Header title="All Friends" onBack={handleBack} />
      <FlatList
        data={userdata?.data || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={item => renderItem({ item })}
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
          !isLoading && (
            <Text
              style={{ color: 'white', textAlign: 'center', marginTop: 50 }}
            >
              No Friendsss found.
            </Text>
          )
        }
        // Loading UI
        ListHeaderComponent={
          isLoading && (
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                marginVertical: 20,
              }}
            >
              Loading...
            </Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 240 }}
      />
    </View>
  );
};

export default AllUser_Friends;

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    width: '80%',
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },

  modalTitle: {
    fontSize: 18,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },

  modalMessage: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  modalCancel: {
    flex: 1,
    marginRight: 10,
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 10,
  },

  modalConfirm: {
    flex: 1,
    marginLeft: 10,
    padding: 12,
    backgroundColor: '#D4AF37',
    borderRadius: 10,
  },

  modalCancelText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },

  modalConfirmText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
