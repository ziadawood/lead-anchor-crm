import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useDeals } from '../../hooks/use-api';
import { DealCard } from '../../components/DealCard';

export default function PipelineScreen() {
  const { data: deals, isLoading, error } = useDeals();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error loading pipeline.</Text>
      </View>
    );
  }

  // Group deals by stage for a simple Kanban view
  const stages = [...new Set(deals?.map(d => d.stage?.name).filter(Boolean) as string[])];

  return (
    <ScrollView horizontal style={styles.container} snapToInterval={300} decelerationRate="fast">
      {stages.map(stageName => {
        const stageDeals = deals?.filter(d => d.stage?.name === stageName);
        return (
          <View key={stageName} style={styles.column}>
            <Text variant="titleMedium" style={styles.columnTitle}>
              {stageName} ({stageDeals?.length})
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {stageDeals?.map(deal => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  column: {
    width: 300,
    padding: 16,
    borderRightWidth: 1,
    borderColor: '#e0e0e0',
  },
  columnTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
