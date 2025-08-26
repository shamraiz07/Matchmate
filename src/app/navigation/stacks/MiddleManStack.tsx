// src/navigation/stacks/MiddleManStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MiddleManHome from '../../../screens/middleman/MiddleManHome';
import LotDetails from '../../../screens/middleman/lotDetails';
import ExporterDetails from '../../../screens/middleman/exporterDetails';

export type MiddleManStackParamList = {
  MiddleManHome: undefined;
  lotDetails: { id: number | string };
  exporterDetails: { id: number | string };
};

const Stack = createNativeStackNavigator<MiddleManStackParamList>();

export default function MiddleManStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MiddleManHome" component={MiddleManHome} />
      <Stack.Screen
        name="lotDetails"
        component={LotDetails}
        options={{ headerShown: true, title: 'Lot Details' }}
      />
      <Stack.Screen
        name="exporterDetails"
        component={ExporterDetails}
        options={{ headerShown: true, title: 'Exporter Details' }}
      />
    </Stack.Navigator>
  );
}
