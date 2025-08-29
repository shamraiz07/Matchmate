// src/screens/Fisherman/AddTrip/components/sections/CrewSafetySection.tsx
import React from 'react';
import TextField from '../fields/TextField';

export default function CaptainInfo() {
  return (
    <>
      <TextField
        name="captainNameId"
        label="Captain Name"
        placeholder="e.g, Captain Ahmed Khan"
        rules={{ required: 'Captain name is required' }}
      />
      <TextField
        name="captainPhone"
        label="Captain Mobile Number"
        placeholder="+92 300 1234567"
        keyboardType="phone-pad"
        rules={{ required: 'Captain Mobile Number is required' }}
      />
      <TextField
        name="crewNo"
        label="Number of Crew"
        placeholder="e.g. 5"
        keyboardType="numeric"
        rules={{
          required: 'Crew count is required',
        }}
      />
      <TextField
        name="port_clearance_no"
        label="Port Clearance No"
        placeholder="eg. PC-2024-001"
        rules={{ required: 'Port clearance No. is required' }}
      />
    </>
  );
}
