import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface PlanCelebrationAnimationProps {
  visible: boolean;
  planName: string;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export default function PlanCelebrationAnimation({
  visible,
  planName,
  onClose,
}: PlanCelebrationAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkScaleAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const textSlideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      checkScaleAnim.setValue(0);
      confettiAnim.setValue(0);
      textSlideAnim.setValue(50);

      // Start celebration animation sequence
      Animated.sequence([
        // Fade in background
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Scale up circle and check icon
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(checkScaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 50,
            delay: 200,
            useNativeDriver: true,
          }),
          Animated.timing(confettiAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(textSlideAnim, {
            toValue: 0,
            friction: 5,
            tension: 40,
            delay: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Confetti particles animation
  const confettiAnimations = useRef(
    Array.from({ length: 20 }).map(() => ({
      translateY: new Animated.Value(-20),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
      startX: Math.random() * width,
      duration: 2000 + Math.random() * 1000,
      delay: Math.random() * 500,
    })),
  ).current;

  useEffect(() => {
    if (visible) {
      confettiAnimations.forEach((anim, index) => {
        anim.translateY.setValue(-20);
        anim.translateX.setValue(0);
        anim.rotate.setValue(0);
        anim.opacity.setValue(1);

        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: height + 20,
            duration: anim.duration,
            delay: anim.delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: (Math.random() - 0.5) * 100,
            duration: anim.duration,
            delay: anim.delay,
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.timing(anim.rotate, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ),
          Animated.sequence([
            Animated.delay(anim.duration - 500),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    }
  }, [visible]);

  const confettiColors = ['#D4AF37', '#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Confetti */}
        {confettiAnimations.map((anim, index) => {
          const rotation = anim.rotate.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.confetti,
                {
                  left: anim.startX,
                  backgroundColor: confettiColors[index % confettiColors.length],
                  transform: [
                    { translateY: anim.translateY },
                    { translateX: anim.translateX },
                    { rotate: rotation },
                  ],
                  opacity: anim.opacity,
                },
              ]}
            />
          );
        })}

        {/* Main celebration content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: opacityAnim,
            },
          ]}>
          {/* Circle background */}
          <Animated.View
            style={[
              styles.circle,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}>
            {/* Check icon */}
            <Animated.View
              style={[
                styles.checkContainer,
                {
                  transform: [{ scale: checkScaleAnim }],
                },
              ]}>
              <Icon name="checkmark-circle" size={80} color="#FFFFFF" />
            </Animated.View>
          </Animated.View>

          {/* Plan name text */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                transform: [{ translateY: textSlideAnim }],
              },
            ]}>
            <Text style={styles.successText}>Success!</Text>
            <Text style={styles.planNameText}>{planName} Plan</Text>
            <Text style={styles.selectedText}>Selected Successfully</Text>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#D4AF37',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  checkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  successText: {
    color: '#D4AF37',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  planNameText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
