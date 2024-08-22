import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import DocumentPicker from 'react-native-document-picker';

type FormDataKey = keyof typeof FormData;

const ChatScreen = () => {
  const [step, setStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState<FormDataKey | null>(null);
  const [inputValue, setInputValue] = useState(''); // Added for clearing the input field
  const [formData, setFormData] = useState({
    name: '',
    qualification: '',
    phone: '',
    about: '',
    skills: '',
    profilePhoto: '',
    document: '',
  });
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Welcome! Please tell me your name.' }
  ]);

  const chatSteps = [
    { type: 'text', prompt: 'Welcome! Please tell me your name.', key: 'name' },
    { 
      type: 'menu', 
      prompt: 'What is your qualification?', 
      key: 'qualification',
      options: ['B.Tech', 'B.E', 'B.Sc', 'M.Tech', 'M.Sc']
    },
    { 
      type: 'text', 
      prompt: 'Enter your phone number.', 
      key: 'phone', 
      validation: (value: string) => /^\d{10}$/.test(value)
    },
    { type: 'text', prompt: 'Tell me a bit about yourself.', key: 'about' },
    { type: 'text', prompt: 'What are your skills?', key: 'skills' },
    { type: 'image', prompt: 'Please upload a profile photo', key: 'profilePhoto' },
    { type: 'document', prompt: 'Please upload a document (PDF only)', key: 'document' },
    { type: 'final', prompt: 'Thank you! You can now review and save your information.' }
  ];

  const handleNextStep = (response: string) => {
    if (response.trim() === '') { // Check if the input is empty
      setMessages([...messages, { type: 'bot', text: 'Please fill the field.' }]);
      return;
    }

    const key = chatSteps[step].key as FormDataKey;

    if (chatSteps[step].validation && !chatSteps[step].validation(response)) {
      setMessages([...messages, { type: 'bot', text: 'Invalid input, please try again.' }]);
      return;
    }

    setFormData(prevFormData => ({ ...prevFormData, [key]: response }));
    setInputValue(''); // Clear the input field after submission

    let newMessages = [...messages, { type: 'user', text: response }];

    if (step < chatSteps.length - 1) {
      newMessages = [...newMessages, { type: 'bot', text: chatSteps[step + 1].prompt }];
      setStep(step + 1);
    } else {
      newMessages = [...newMessages, { type: 'bot', text: 'All set! You can now review and save your information.' }];
      setStep(step + 1);
    }

    setMessages(newMessages);
  };

  const handleImagePick = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images],
      });
      if (result) {
        const fileName = result.name || result.uri.split('/').pop();
        setFormData(prevFormData => ({ ...prevFormData, profilePhoto: result.uri }));
        handleNextStep(fileName || ''); // Ensure handleNextStep gets a string
      }
    } catch (err) {
      console.error('Image picking error: ', err);
    }
  };
  
  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf],
      });
      if (result) {
        const fileName = result.name || result.uri.split('/').pop();
        setFormData(prevFormData => ({ ...prevFormData, document: result.uri }));
        handleNextStep(fileName || ''); // Ensure handleNextStep gets a string
      }
    } catch (err) {
      console.error('Document picking error: ', err);
    }
  };
  

  const handleEdit = () => {
    setMessages([
      ...messages,
      { type: 'bot', text: 'Which field would you like to edit?' },
    ]);
    setIsEditing(true);
  };

  const handleEditField = (field: FormDataKey) => {
    setEditField(field);
    setIsEditing(false);
    const stepIndex = chatSteps.findIndex(step => step.key === field);
    setStep(stepIndex);
    setMessages([
      ...messages,
      { type: 'bot', text: chatSteps[stepIndex].prompt }
    ]);
  };

  const handleSaveInformation = () => {
    Alert.alert('Success', 'Your details are saved successfully.');
    setMessages([
      ...messages,
      { type: 'bot', text: 'Information saved!' }
    ]);
    setIsEditing(false);
    setStep(chatSteps.findIndex(step => step.type === 'final'));
  };

  const renderEditOptions = () => {
    return (
      <View style={styles.editOptionsContainer}>
        {Object.keys(formData).map((key) => (
          <Button
            key={key}
            title={`Edit ${key.charAt(0).toUpperCase() + key.slice(1)}`}
            onPress={() => handleEditField(key as FormDataKey)}
            color="#007bff"
          />
        ))}
        <Button title="Save Information" onPress={handleSaveInformation} color="#28a745" />
      </View>
    );
  };

  const renderInputField = () => {
    if (isEditing && editField) {
      return (
        <TextInput
          placeholder={`Update ${editField}`}
          style={styles.input}
          onSubmitEditing={(e) => {
            const key = editField as FormDataKey;
            handleNextStep(e.nativeEvent.text);
            setEditField(null); // Clear the edit field after submission
          }}
          value={inputValue}
          onChangeText={setInputValue} // Added to track input value
        />
      );
    }

    const currentStep = chatSteps[step];
    
    if (!currentStep) return null;

    switch (currentStep.type) {
      case 'text':
        return (
          <TextInput
            placeholder="Type your response..."
            style={styles.input}
            onSubmitEditing={(e) => handleNextStep(e.nativeEvent.text)}
            value={inputValue}
            onChangeText={setInputValue} // Added to track input value
          />
        );
      case 'menu':
        return (
          <View style={styles.buttonContainer}>
            {currentStep.options?.map((option, index) => (
              <Button key={index} title={option} onPress={() => handleNextStep(option)} color="#007bff" />
            ))}
          </View>
        );
      case 'image':
        return <Button title="Upload Photo" onPress={handleImagePick} color="#007bff" />;
      case 'document':
        return <Button title="Upload Document" onPress={handleDocumentPick} color="#007bff" />;
      case 'final':
        return (
          <View style={styles.finalReviewContainer}>
            <Text style={styles.finalReviewText}>Name: {formData.name}</Text>
            <Text style={styles.finalReviewText}>Qualification: {formData.qualification}</Text>
            <Text style={styles.finalReviewText}>Phone: {formData.phone}</Text>
            <Text style={styles.finalReviewText}>About: {formData.about}</Text>
            <Text style={styles.finalReviewText}>Skills: {formData.skills}</Text>
            {formData.profilePhoto ? (
              <Image source={{ uri: formData.profilePhoto }} style={styles.image} />
            ) : null}
            {formData.document ? <Text style={styles.finalReviewText}>Document: Uploaded</Text> : null}
            <Button title="Edit Information" onPress={handleEdit} color="#007bff" />
            <Button title="Save Information" onPress={handleSaveInformation} color="#28a745" />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatContainer}>
        {messages.map((msg, index) => (
          <View key={index} style={[styles.message, msg.type === 'user' ? styles.userMessage : styles.botMessage]}>
            {msg.type === 'user' && msg.text.includes('http') ? (
              <Image source={{ uri: msg.text }} style={styles.image} />
            ) : (
              <Text style={styles.messageText}>{msg.text}</Text>
            )}
          </View>
        ))}
      </ScrollView>
      {isEditing ? renderEditOptions() : renderInputField()}
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  chatContainer: {
    flex: 1,
    marginBottom: 16,
  },
  message: {
    marginVertical: 4,
    padding: 8,
    borderRadius: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f1f1',
  },
  messageText: {
    color: '#000',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  finalReviewContainer: {
    marginTop: 16,
  },
  finalReviewText: {
    marginBottom: 8,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  editOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 16,
  },
});

export default ChatScreen;
