import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';

const PRIMARY = '#6b46c1';

interface BookingFormInputsProps {
  guests: string;
  setGuests: (val: string) => void;
  duration: string;
  options: string[];
  handleOptionPress: (item: string) => void;
  notes: string;
  setNotes: (val: string) => void;
}

export default function BookingFormInputs({
  guests,
  setGuests,
  duration,
  options,
  handleOptionPress,
  notes,
  setNotes,
}: BookingFormInputsProps) {
  // Filter out "Choose Date" if platform is web
  const filteredOptions = Platform.OS === 'web'
    ? options.filter((option) => option !== 'Choose Date')
    : options;

  return (
    <>
      {/* Guests */}
      <Text style={styles.sectionTitle}>Number of Guests</Text>
      <TextInput
        value={guests}
        onChangeText={setGuests}
        keyboardType="numeric"
        placeholder="e.g. 250"
        style={styles.input}
      />

      {/* Duration / Needed Date */}
      <Text style={styles.sectionTitle}>When do you need it?</Text>
      <View style={styles.options}>
        {filteredOptions.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => handleOptionPress(item)}
            style={[
              styles.option,
              duration === item && styles.optionActive,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                duration === item && styles.optionTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notes / Special Requests */}
      <Text style={styles.sectionTitle}>Questions or Special Requests</Text>
      <TextInput
        multiline
        value={notes}
        onChangeText={setNotes}
        placeholder="Tell us about your wedding theme, colours, flavours, delivery location or ask us any question..."
        style={styles.notes}
        textAlignVertical="top"
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    marginTop: 18,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  option: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  optionText: {
    color: '#374151',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#fff',
  },
  notes: {
    backgroundColor: '#fff',
    borderRadius: 16,
    minHeight: 130,
    padding: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
});

