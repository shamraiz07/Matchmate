// import React, { useState, useRef } from 'react';
// import { View, Text, StyleSheet, LayoutChange } from 'react-native';
// import {
//   GestureHandlerRootView,
//   PanGestureHandler,
//   State,
// } from 'react-native-gesture-handler';

// interface RangeSliderProps {
//   min: number;
//   max: number;
//   initialMin: number;
//   initialMax: number;
//   onValueChange: (min: number, max: number) => void;
// }

// export default function RangeSlider({
//   min,
//   max,
//   initialMin,
//   initialMax,
//   onValueChange,
// }: RangeSliderProps) {
//   const [minValue, setMinValue] = useState(initialMin);
//   const [maxValue, setMaxValue] = useState(initialMax);
//   const [trackWidth, setTrackWidth] = useState(0);
//   const trackRef = useRef<View>(null);
//   const minStartX = useRef(0);
//   const maxStartX = useRef(0);

//   const getValueFromPosition = (position: number) => {
//     if (trackWidth === 0) return min;
//     const value = (position / trackWidth) * (max - min) + min;
//     return Math.round(Math.max(min, Math.min(max, value)));
//   };

//   const getPositionFromValue = (value: number) => {
//     if (trackWidth === 0) return 0;
//     return ((value - min) / (max - min)) * trackWidth;
//   };

//   const handleMinGesture = (event: any) => {
//     const { state, translationX } = event.nativeEvent;

//     if (state === State.BEGAN) {
//       minStartX.current = getPositionFromValue(minValue);
//     } else if (state === State.ACTIVE) {
//       const newPos = Math.max(0, Math.min(trackWidth, minStartX.current + translationX));
//       const newValue = getValueFromPosition(newPos);

//       if (newValue < maxValue && newValue >= min) {
//         setMinValue(newValue);
//         onValueChange(newValue, maxValue);
//       }
//     }
//   };

//   const handleMaxGesture = (event: any) => {
//     const { state, translationX } = event.nativeEvent;

//     if (state === State.BEGAN) {
//       maxStartX.current = getPositionFromValue(maxValue);
//     } else if (state === State.ACTIVE) {
//       const newPos = Math.max(0, Math.min(trackWidth, maxStartX.current + translationX));
//       const newValue = getValueFromPosition(newPos);

//       if (newValue > minValue && newValue <= max) {
//         setMaxValue(newValue);
//         onValueChange(minValue, newValue);
//       }
//     }
//   };

//   const onTrackLayout = (e: LayoutChange) => {
//     const { width } = e.nativeEvent.layout;
//     if (width > 0) {
//       setTrackWidth(width);
//     }
//   };

//   const minPos = getPositionFromValue(minValue);
//   const maxPos = getPositionFromValue(maxValue);

//   return (
//     <GestureHandlerRootView style={styles.container}>
//       <View style={styles.labelContainer}>
//         <Text style={styles.label}>Age Range</Text>
//         <Text style={styles.valueText}>
//           {minValue} - {maxValue}
//         </Text>
//       </View>
//       <View style={styles.sliderContainer}>
//         <View style={styles.track} ref={trackRef} onLayout={onTrackLayout}>
//           <View
//             style={[
//               styles.activeTrack,
//               {
//                 left: minPos,
//                 width: Math.max(0, maxPos - minPos),
//               },
//             ]}
//           />
//           <PanGestureHandler  onHandlerStateChange={handleMinGesture} onGestureEvent={handleMinGesture}>
//             <View style={[styles.handle, { left: minPos - 12 }]}>
//               <View style={styles.handleInner} />
//             </View>
//           </PanGestureHandler>
//           <PanGestureHandler onHandlerStateChange={handleMaxGesture} onGestureEvent={handleMaxGesture}>
//             <View style={[styles.handle, { left: maxPos - 12 }]}>
//               <View style={styles.handleInner} />
//             </View>
//           </PanGestureHandler>
//         </View>
//         <View style={styles.valuesContainer}>
//           <Text style={styles.rangeText}>{min}</Text>
//           <Text style={styles.rangeText}>{max}</Text>
//         </View>
//       </View>
//     </GestureHandlerRootView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 24,
//   },
//   labelContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   label: {
//     color: '#D4AF37',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   valueText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   sliderContainer: {
//     paddingVertical: 20,
//   },
//   track: {
//     height: 4,
//     backgroundColor: '#333333',
//     borderRadius: 2,
//     position: 'relative',
//     width: '100%',
//   },
//   activeTrack: {
//     height: 4,
//     backgroundColor: '#D4AF37',
//     borderRadius: 2,
//     position: 'absolute',
//     top: 0,
//   },
//   handle: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: '#D4AF37',
//     position: 'absolute',
//     top: -10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   handleInner: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: '#FFFFFF',
//   },
//   valuesContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 8,
//   },
//   rangeText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     opacity: 0.7,
//   },
// });

// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const RangeSlider = () => {
//   return (
//     <View>
//       <Text>RangeSlider</Text>
//     </View>
//   )
// }

// export default RangeSlider

// const styles = StyleSheet.create({})

import Slider from '@react-native-community/slider';
import { View, Text, StyleSheet } from 'react-native';

const RangeSlider = ({ minAge, maxAge, setMinAge, setMaxAge }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Age Preference</Text>
      <Text style={styles.subtitle}>
        Selected Age:{' '}
        <Text style={styles.value}>
          {minAge} - {maxAge}
        </Text>
      </Text>

      {/* Min Age */}
      <View style={styles.section}>
        <Text style={styles.label}>Minimum Age</Text>
        <Text style={styles.selected}>({minAge})</Text>
      </View>

      <Slider
        minimumValue={18}
        maximumValue={60}
        value={minAge}
        step={1}
        minimumTrackTintColor="#D4AF37"
        maximumTrackTintColor="#808080"
        thumbTintColor="#D4AF37"
        onValueChange={value => setMinAge(value)}
      />

      {/* Max Age */}
      <View style={[styles.section, { marginTop: 20 }]}>
        <Text style={styles.label}>Maximum Age</Text>
        <Text style={styles.selected}>({maxAge})</Text>
      </View>

      <Slider
        minimumValue={18}
        maximumValue={60}
        value={maxAge}
        step={1}
        minimumTrackTintColor="#D4AF37"
        maximumTrackTintColor="#808080"
        thumbTintColor="#D4AF37"
        onValueChange={value => setMaxAge(value)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#fff',
    // padding: 20,
    borderRadius: 12,
    marginVertical: 5,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D4AF37',
  },
  subtitle: {
    marginTop: 5,
    fontSize: 16,
    color: '#ffff',
    marginBottom: 20,
  },
  value: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '800',
  },
  selected: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4AF37',
  },
});

export default RangeSlider;
