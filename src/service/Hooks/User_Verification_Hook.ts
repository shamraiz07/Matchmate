import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../store/Auth_store';
import { CNIC_Verification_Upload } from '../Api_service/User_Verification_Service';

// ! ||--------------------------------------------------------------------------------||
// ! ||                         // CNIC Verification Upload Hook                        ||
// ! ||--------------------------------------------------------------------------------||
export const useCNIC_Verification_Upload = () => {
  const token = useAuthStore(state => state.token);
  console.log('token of CNIC_Verification_Upload Hook called===========================', token);
  return useMutation({
    mutationFn: async ({ payload }: { payload: any }) => {
      return CNIC_Verification_Upload(payload, token || '');
    },
  });
};
