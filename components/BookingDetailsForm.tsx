import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface BookingDetailsFormProps {
  guests: string;
  setGuests: (val: string) => void;
  duration: string;
  setDuration: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  showDatePicker: boolean;
  setShowDatePicker: (val: boolean) => void;
  showDateModal: boolean;
  setShowDateModal: (val: boolean) => void;
}

const options = ['Tomorrow', 'This Week', 'This Month', 'Choose Date'];
const PRIMARY = '#6b46c1';

export default function BookingDetailsForm({
  guests,
  setGuests,
  duration,
  setDuration,
  notes,
  setNotes,
  selectedDate,
  setSelectedDate,
  showDatePicker,
  setShowDatePicker,
  showDateModal,
  setShowDateModal,
}: BookingDetailsFormProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'ios') {
      if (date) setSelectedDate(date);
    } else {
      setShowDatePicker(false);
      if (date) {
        setSelectedDate(date);
        setDuration(formatDate(date));
      }
    }
  };

  const handleDateConfirm = () => {
    setShowDateModal(false);
    setDuration(formatDate(selectedDate));
  };

  const handleOptionPress = (item: string) => {
    if (item === 'Choose Date') {
      if (Platform.OS === 'ios') {
        setShowDateModal(true);
      } else {
        setShowDatePicker(true);
      }
    } else {
      setDuration(item);
    }
  };

  return (
    <View>
      {/* Guests */}
      <Text style={styles.sectionTitle}>Number of Guests</Text>
      <TextInput
        value={guests}
        onChangeText={setGuests}
        keyboardType="numeric"
        placeholder="e.g. 250"
        style={styles.input}
      />

      {/* Duration */}
      <Text style={styles.sectionTitle}>When do you need it?</Text>
      <View style={styles.options}>
        {options.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => handleOptionPress(item)}
            style={[styles.option, duration === item && styles.optionActive]}
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

      {/* Notes */}
      <Text style={styles.sectionTitle}>Questions or Special Requests</Text>
      <TextInput
        multiline
        value={notes}
        onChangeText={setNotes}
        placeholder="Tell us about your wedding theme, colours, flavours, delivery location or ask us any question..."
        style={styles.notes}
        textAlignVertical="top"
      />

      {/* iOS Date Picker Modal */}
      {Platform.OS === 'ios' && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDateModal}
          onRequestClose={() => setShowDateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDateModal(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity onPress={handleDateConfirm}>
                  <Text style={styles.modalDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android Date Picker */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </View>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  modalDoneText: {
    fontSize: 16,
    color: PRIMARY,
    fontWeight: '600',
  },
  datePicker: {
    height: 200,
  },
});

