import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useInteractions } from '../../hooks/use-api';
import { InteractionItem } from '../../components/InteractionItem';

export default function InboxScreen() {
  const { data: interactions, isLoading, error } = useInteractions();

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
        <Text>Error loading inbox.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={interactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <InteractionItem interaction={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
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
  list: {
    padding: 16,
  },
});
