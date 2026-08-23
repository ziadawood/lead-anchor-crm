import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, useTheme, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import type { IDeal } from '@leadanchor/shared';

export function DealCard({ deal }: { deal: IDeal }) {
  const theme = useTheme();

  const getPriorityColor = () => {
    switch (deal.priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.primary;
      case 'low': return theme.colors.secondary;
      default: return theme.colors.outline;
    }
  };

  return (
    <Card 
      style={styles.card} 
      onPress={() => router.push(`/deal/${deal.id}`)}
    >
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>{deal.title}</Text>
        {deal.contact?.first_name && (
          <Text variant="bodyMedium">{deal.contact.first_name} {deal.contact.last_name}</Text>
        )}
        <View style={styles.footer}>
          <Text variant="bodySmall" style={{ color: getPriorityColor(), fontWeight: 'bold' }}>
            {deal.priority.toUpperCase()}
          </Text>
          {deal.value && (
            <Text variant="bodyMedium" style={styles.value}>
              ${deal.value.toFixed(2)}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  value: {
    fontWeight: 'bold',
  },
});
