import React, { useState, useEffect } from 'react';
import { GiftedChat, IMessage, MessageProps } from 'react-native-gifted-chat';
import { View, Text, TouchableOpacity, StyleSheet, Image, Button } from 'react-native';
import DocumentPicker from 'react-native-document-picker';

const qualifications = ['B.E', 'B.Tech', 'B.Sc', 'M.E', 'M.Tech', 'M.Sc', 'PhD'];

const isValidName = (name: string): boolean => /^[A-Za-z]+$/.test(name);
const isValidPhoneNumber = (phone: string): boolean => /^\d{10}$/.test(phone);

const ChatScreen = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [step, setStep] = useState<number>(0);
  const [userData, setUserData] = useState<Record<string, string>>({
    name: '',
    qualification: '',
    phone: '',
    about: '',
    skills: '',
  });
const [editMode, setEditMode] = useState<boolean>(false);
const [editField, setEditField] = useState<string | null>(null);

  const [showQualificationMenu, setShowQualificationMenu] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [inputError, setInputError] = useState<{ [key: string]: boolean }>({
    name: false,
    phone: false,
  });
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(undefined);
  const [pdfDocument, setPdfDocument] = useState<string | undefined>(undefined);

  const steps = [
    'Welcome! Please tell me your name.',
    'What is your qualification?',
    'Enter your phone number.',
    'Tell me a bit about yourself.',
    'What are your skills?',
    'Please upload a profile photo.',
    'Please upload a document (PDF only).',
    'Thank you! You can now review and save your information.',
  ];

  const handleSend = (newMessages: IMessage[]) => {
    const userMessage = newMessages[0].text;
  
    if (userMessage.trim() === '1') {
      // Handle reset logic
      setStep(0);
      setUserData({
        name: '',
        qualification: '',
        phone: '',
        about: '',
        skills: '',
      });
      setMessages([]);
      sendBotMessage(steps[0]);
      setShowQualificationMenu(false);
      setErrorMessage('');
      setProfilePhoto(undefined);
      setPdfDocument(undefined);
      return;
    }
    if (editMode) {
      switch (userMessage.trim()) {
        case '2':
          setEditField('name');
          sendBotMessage('Please enter your new name:');
          setEditMode(false);
          setStep(0);
          
          return;
        case '3':
          setEditField('qualification');
          sendBotMessage('Please enter your new qualification:');
          setEditMode(false);
          setStep(1);
          
          return;
          
        case '4':
          setEditField('phone');
          sendBotMessage('Please enter your new phone number:');
          setEditMode(false);
          setStep(2);
          
          return;
        case '5':
          setEditField('about');
          sendBotMessage('Please enter your new information about yourself:');
          setEditMode(false);
          setStep(3);
          
          return;
        case '6':
          setEditField('skills');
          sendBotMessage('Please enter your new skills:');
          setEditMode(false);
          setStep(4);
          return;
        default:
          sendBotMessage('Invalid option. Please press 1, 2, 3, 4, 5 or 6.');
          return;
      }
    }
  
  
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  
    if (step < steps.length) {
      const updatedUserData = { ...userData };
      switch (step) {
        case 0:
          if (isValidName(userMessage)) {
            updatedUserData.name = userMessage;
            setUserData(updatedUserData);
            setStep(1);
            setShowQualificationMenu(true);
            setErrorMessage('');
            setInputError((prev) => ({ ...prev, name: false }));
          } else {
            setErrorMessage('Name must contain only letters.');
            sendBotMessage(errorMessage, true);
            setInputError((prev) => ({ ...prev, name: true }));
          }
          break;
        case 1:
          if (showQualificationMenu) {
            if (qualifications.includes(userMessage)) {
              updatedUserData.qualification = userMessage;
              setUserData(updatedUserData);
              setShowQualificationMenu(false);
              setStep(2);
            } else {
              sendBotMessage('Please select a valid qualification from the list.');
            }
          }
          break;
        case 2:
          if (isValidPhoneNumber(userMessage)) {
            updatedUserData.phone = userMessage;
            setUserData(updatedUserData);
            setStep(3);
          } else {
            sendBotMessage('Please enter a valid 10-digit phone number.');
            setInputError((prev) => ({ ...prev, phone: true }));
          }
          break;
        case 3:
          if (userMessage.trim()) {
            updatedUserData.about = userMessage;
            setUserData(updatedUserData);
            setStep(4);
          }
          break;
        case 4:
          if (userMessage.trim()) {
            updatedUserData.skills = userMessage;
            setUserData(updatedUserData);
            sendBotMessage(steps[5]);
            setStep(5);
          }
          break;
        case 5:
          if (profilePhoto) {
            sendBotMessage(steps[6]);
            setStep(6);
          }
          break;
        case 6:
          if (pdfDocument) {
            sendBotMessage(steps[7]);
            setStep(7);
          }
          break;
        case 7:
          if (userMessage.trim() === 'Save Information') {
            const infoMessage = `Name: ${userData.name}\nQualification: ${userData.qualification}\nPhone: ${userData.phone}\nAbout: ${userData.about}\nSkills: ${userData.skills}`;
            sendBotMessage('Here is the information you provided:');
            sendBotMessage(infoMessage, true);
            setStep(8); // Move to a final step or end chat
          } else if (userMessage.trim() === 'Edit Information') {
            setEditMode(true);
            sendBotMessage('Which field would you like to edit? Please choose:\n1. Edit full details \n2. Edit Name\n3. Edit Qualification\n4. Edit Phone Number\n5. Edit About\n6. Edit Skills');
          }
            break;
        default:
          sendBotMessage('Thank you for chatting with us!');
          break;
      }
    }
  };
  
  const sendBotMessage = (text: string, isError: boolean = false) => {
    const botReply: IMessage = {
      _id: new Date().getTime(),
      text,
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'Bot',
      },
    };

    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [botReply])
    );
  };

  const renderCustomActions = () => {
    // Render qualification options
    if (step === 1 && showQualificationMenu) {
      return (
        <View style={styles.menuContainer}>
          {qualifications.map((qualification) => (
            <TouchableOpacity
              key={qualification}
              style={styles.menuButton}
              onPress={() => handleSend([{ text: qualification, user: { _id: 1 }, createdAt: new Date(), _id: new Date().getTime() }])}
            >
              <Text style={styles.menuText}>{qualification}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
  
    // profile photo upload button
    if (step === 5 && !profilePhoto) {
      return (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => pickFile('photo')}
        >
          <Text style={styles.menuText}>Upload Profile Photo</Text>
        </TouchableOpacity>
      );
    }
  
    //  pdf document upload button
    if (step === 6 && !pdfDocument) {
      return (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => pickFile('pdf')}
        >
          <Text style={styles.menuText}>Upload PDF Document</Text>
        </TouchableOpacity>
      );
    }
  
    return null;
  };
  

  const pickFile = async (type: 'photo' | 'pdf') => {
    try {
      const result = await DocumentPicker.pick({
        type: type === 'photo' ? ['image/jpeg', 'image/png'] : ['application/pdf'],
      });

      if (result && result.length > 0) {
        const file = result[0];
        if (type === 'photo') {
          setProfilePhoto(file.uri);
        } else {
          setPdfDocument(file.uri);
        }
        handleSend([{ text: '', user: { _id: 1 }, createdAt: new Date(), _id: new Date().getTime() }]);
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('User cancelled document picker');
      } else {
        console.error('DocumentPicker Error: ', error);
      }
    }
  };

  useEffect(() => {
    if (step < steps.length) {
      sendBotMessage(steps[step]);
    }
  }, [step]);

  const renderMessage = (props: MessageProps<IMessage>) => {
    const { currentMessage } = props;
  
    if (!currentMessage) {
      return null;
    }
  
    const isUserMessage = currentMessage.user._id === 1;
    const isStepMessage = steps.includes(currentMessage.text);
  
    return (
      <View
        style={[
          styles.messageContainer,
          isUserMessage ? styles.userMessage : styles.botMessage,
        ]}
      >
        {currentMessage.image && (
          <Image source={{ uri: currentMessage.image }} style={styles.messageImage} />
        )}
        {currentMessage.text && (
          <Text
            style={[
              styles.messageText,
              isUserMessage ? styles.userMessageText : styles.botMessageText,
              isStepMessage ? styles.stepMessageText : {},
            ]}
          >
            {currentMessage.text}
          </Text>
        )}
        {(currentMessage.text.includes('Thank you! You can now review and save your information.') ||
          currentMessage.text.includes('Thank you for chatting with us!')) && (
          <View style={styles.actionButtonsContainer}>
            <Button title="Edit Information" onPress={() => handleSend([{ text: 'Edit Information', user: { _id: 1 }, createdAt: new Date(), _id: new Date().getTime() }])} />
            <Button title="Save Information" onPress={() => handleSend([{ text: 'Save Information', user: { _id: 1 }, createdAt: new Date(), _id: new Date().getTime() }])} />
          </View>
        )}
      </View>
    );
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={handleSend}
      user={{ _id: 1 }}
      renderMessage={renderMessage}
      renderActions={renderCustomActions}
      onPressAvatar={() => {}}
      onPressActionButton={() => pickFile('photo')}
    />
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#000000',
  },
  botMessageText: {
    color: '#333333',
  },
  stepMessageText: {
    fontWeight: 'bold',
  },
  menuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  menuButton: {
    padding: 10,
    backgroundColor: '#EFEFEF',
    borderRadius: 5,
    margin: 5,
  },
  menuText: {
    fontSize: 16,
    color: '#000000',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
});

export default ChatScreen;
