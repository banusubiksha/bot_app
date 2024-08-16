// // src/CustomMessage.tsx

// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { IMessage } from 'react-native-gifted-chat';

// interface CustomMessageProps {
//   currentMessage?: IMessage; //  optional
// }

// const CustomMessage: React.FC<CustomMessageProps> = ({ currentMessage }) => {
//   if (!currentMessage) {
//     return null; // Render nothing if there is no currentMessage
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={currentMessage.text.includes('error') ? styles.errorText : styles.defaultText}>
//         {currentMessage.text}
//       </Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 10,
//     borderRadius: 5,
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 16,
//   },
//   defaultText: {
//     color: '#000',
//     fontSize: 16,
//   },
// });

// export default CustomMessage;
