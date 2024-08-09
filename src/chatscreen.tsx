import React, { useState, useEffect } from 'react';
import { GiftedChat, IMessage, MessageProps } from 'react-native-gifted-chat';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import CustomMessage from './CustomMessage';

const qualifications=['B.E', 'B.Tech', 'B.Sc', 'M.E', 'M.Tech', 'M.Sc', 'PhD'];

const isValidName=(name:string):boolean=>/^[A-Za-z]+$/.test(name);
const isValidPhoneNumber=(phone:string):boolean=>/^\d{10}$/.test(phone);

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
  const [showQualificationMenu, setShowQualificationMenu] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [inputError, setInputError] = useState<{ [key: string]: boolean }>({
    name:false,
    phone:false,
  });

  const steps = [
    'Welcome! Please tell me your name.',
    'What is your qualification?',
    'Enter your phone number.',
    'Tell me a bit about yourself.',
    'What are your skills?',
  ];

  const handleSend = (newMessages: IMessage[]) => {
    const userMessage = newMessages[0].text;

    if (userMessage.trim()==='1') {
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
      return;
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
            setInputError((prev)=>({...prev, name: false }));
          } else {
            setErrorMessage('Name must contain only letters.');
            sendBotMessage(errorMessage, true);
            setInputError((prev)=>({...prev, name: true }));
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
              sendBotMessage('Please choose a valid qualification from the menu.');
            }
          } 
          break;
        case 2:
          if (isValidPhoneNumber(userMessage)) {
            updatedUserData.phone = userMessage;
            setUserData(updatedUserData);
            setStep(3);
            setInputError((prev) => ({ ...prev, phone: false }));
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
          } else {
            sendBotMessage('Please provide valid information about yourself.');
          }
          break;
        case 4:
          if (userMessage.trim()) {
            updatedUserData.skills = userMessage;
            setUserData(updatedUserData);
            sendBotMessage('Thank you! For the information you provided:');
            console.log('User Data:', updatedUserData);
            setStep(5);
          } else {
            sendBotMessage('Please provide valid information about your skills.');
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
    return null;
  };

  useEffect(() => {
    if (step === 0) {
      sendBotMessage(steps[0]);
    } else if (step < steps.length) {
      sendBotMessage(steps[step]);
    }
  }, [step]);

  const renderMessage = (props: MessageProps<IMessage>) => {
    const { currentMessage } = props;

    if (!currentMessage) {
      return null;
    }

    const isUserMessage = currentMessage.user._id === 1;

    return (
      <View
        style={[
          styles.messageContainer,
          isUserMessage ? styles.userMessage : styles.botMessage
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUserMessage ? styles.userText : styles.botText
          ]}
        >
          {currentMessage.text}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={(newMessages) => handleSend(newMessages)}
        user={{
          _id: 1,
        }}
        renderActions={renderCustomActions}
        renderMessage={renderMessage}
        placeholder="Type a message..."
        scrollToBottom
        scrollToBottomComponent={() => (
          <View style={styles.scrollToBottomButton}>
            <Text style={styles.scrollToBottomText}>↑</Text>
          </View>
        )}
      />
      {step === 1 && (
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              inputError.phone ? styles.errorBorder : styles.normalBorder
            ]}
            placeholder="Enter your phone number"
            keyboardType="numeric"
            maxLength={10}
            onChangeText={(text) => handleSend([{ text, user: { _id: 1 }, createdAt: new Date(), _id: new Date().getTime() }])}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  menuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  menuButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
  },
  scrollToBottomButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 20,
    margin: 10,
  },
  scrollToBottomText: {
    color: '#fff',
    fontSize: 20,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 20,
    margin: 5,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#007bff',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#e5e5e5',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#000',
  },
  inputContainer: {
    padding: 10,
    backgroundColor: '#fff',
  },
  input: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  errorBorder: {
    borderColor: 'red',
  },
  normalBorder: {
    borderColor: '#ddd',
  },
});

export default ChatScreen;
