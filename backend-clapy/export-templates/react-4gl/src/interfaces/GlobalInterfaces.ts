export interface IMessage {
  MessageCode: string;
  MessageData: string;
}

export interface IButton {
  text: string;
  onClick: () => void;
}
