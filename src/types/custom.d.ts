// src/types/custom.d.ts

import 'react-native-gifted-chat';

declare module 'react-native-gifted-chat' {
  export interface IMessage {
    _id: string | number;
    text: string;
    createdAt: Date;
    user: {
      _id: string;
      name: string;
    };
  
  }
}
