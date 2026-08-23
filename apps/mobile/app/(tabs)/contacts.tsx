import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Searchbar, List, Avatar } from 'react-native-paper';
import { useContacts } from '../../hooks/use-api';
import type { IContact } from '@leadanchor/shared';

export default function ContactsScreen() {
  const { data: contacts, isLoading, error } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');

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
        <Text>Error loading contacts.</Text>
      </View>
    );
  }

  const filteredContacts = contacts?.filter(contact => {
    const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           (contact.phone && contact.phone.includes(searchQuery)) ||
           (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const renderContact = ({ item }: { item: IContact }) => {
    const initials = `${item.first_name?.[0] || ''}${item.last_name?.[0] || ''}`.toUpperCase() || '?';
    return (
      <List.Item
        title={`${item.first_name || ''} ${item.last_name || ''}`}
        description={item.phone || item.email || 'No contact info'}
        left={props => <Avatar.Text {...props} size={40} label={initials} />}
        style={styles.listItem}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search contacts..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  listItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    paddingHorizontal: 16,
  },
});
