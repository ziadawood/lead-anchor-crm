import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Avatar } from 'react-native-paper';
import type { IInteraction } from '@leadanchor/shared';

export function InteractionItem({ interaction }: { interaction: IInteraction }) {
  const getIcon = () => {
    switch (interaction.type) {
      case 'call': return 'phone';
      case 'sms': return 'message';
      case 'chat': return 'chat';
      case 'booking': return 'calendar';
      case 'ghost_lead': return 'ghost';
      default: return 'bell';
    }
  };

  const getIconColor = () => {
    switch (interaction.type) {
      case 'ghost_lead': return '#ef4444'; // red
      case 'booking': return '#10b981'; // green
      case 'call': return '#3b82f6'; // blue
      default: return '#6b7280'; // gray
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Avatar.Icon size={40} icon={getIcon()} style={{ backgroundColor: getIconColor() }} />
        <View style={styles.textContainer}>
          <Text variant="titleSmall" style={styles.title}>{interaction.title}</Text>
          <Text variant="bodySmall" numberOfLines={2}>{interaction.body}</Text>
          <Text variant="labelSmall" style={styles.date}>
            {new Date(interaction.created_at).toLocaleString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  date: {
    marginTop: 4,
    color: '#888',
  },
});
