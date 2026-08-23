import React, { useEffect } from 'react';
import { View, StyleSheet, Vibration } from 'react-native';
import { Text, IconButton, Avatar, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useCallStore } from '../../hooks/use-call-store';

export default function IncomingCallScreen() {
  const { callerName, callerNumber, isCallActive, endCall } = useCallStore();
  const theme = useTheme();

  useEffect(() => {
    // Vibrate when incoming call screen is active
    Vibration.vibrate([1000, 2000, 1000, 2000], true);
    
    // Auto-dismiss if call is no longer active
    if (!isCallActive) {
      Vibration.cancel();
      router.back();
    }

    return () => Vibration.cancel();
  }, [isCallActive]);

  const handleAccept = () => {
    Vibration.cancel();
    // Here we would integrate with WebRTC or Twilio/Telnyx Voice SDK to connect the call
    console.log('Call accepted');
    endCall(); 
    router.back();
  };

  const handleDecline = () => {
    Vibration.cancel();
    endCall();
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Incoming Call</Text>
      </View>
      
      <View style={styles.callerInfo}>
        <Avatar.Icon size={120} icon="account" style={styles.avatar} />
        <Text variant="displaySmall" style={styles.callerName}>
          {callerName || 'Unknown Caller'}
        </Text>
        <Text variant="titleLarge" style={styles.callerNumber}>
          {callerNumber}
        </Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <IconButton
            icon="phone-hangup"
            iconColor="white"
            containerColor={theme.colors.error}
            size={40}
            onPress={handleDecline}
          />
          <Text>Decline</Text>
        </View>
        <View style={styles.actionButton}>
          <IconButton
            icon="phone"
            iconColor="white"
            containerColor={theme.colors.primary}
            size={40}
            onPress={handleAccept}
          />
          <Text>Accept</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e', // Dark background for call screen
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    opacity: 0.8,
  },
  callerInfo: {
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#333',
    marginBottom: 20,
  },
  callerName: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  callerNumber: {
    color: '#ccc',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  actionButton: {
    alignItems: 'center',
  }
});
