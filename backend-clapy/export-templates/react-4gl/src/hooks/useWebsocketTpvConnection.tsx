import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import { GREEN, GREY, ORANGE, RED, YELLOW } from '../constants/colors';
import { useRouteParams } from '../routes/useRouteParams';

export const useWebsocketTpvConnection = () => {
  const { t } = useTranslation();
  const { wsUrl, wsToken } = useRouteParams()
  const socketUrl = `${wsUrl}/?token=${wsToken}`; //process.env.REACT_APP_WEBSOCKET_URL!;

  const [websocketOnline, setWebsocketOnline] = useState(false);

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    socketUrl,
    // Código para la reconexión. Ver documentación.
    {
      shouldReconnect: closeEvent => true,
      reconnectAttempts: 20,
      reconnectInterval: 5000,
      onOpen: () => setWebsocketOnline(true),
      onReconnectStop: () => setWebsocketOnline(false),
    },
  );

  const [statusColor, setStatusColor] = useState<string>('transparent');

  useEffect(() => {
    switch (readyState) {
      case ReadyState.CONNECTING:
        setStatusColor(YELLOW);
        break;
      case ReadyState.OPEN:
        setStatusColor(GREEN);
        break;
      case ReadyState.CLOSING:
        setStatusColor(ORANGE);
        break;
      case ReadyState.CLOSED:
        setStatusColor(RED);
        break;
      case ReadyState.UNINSTANTIATED:
        setStatusColor(GREY);
        break;
      default:
        break;
    }
  }, [readyState]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: t('websocket-connecting'),
    [ReadyState.OPEN]: t('websocket-open'),
    [ReadyState.CLOSING]: t('websocket-closing'),
    [ReadyState.CLOSED]: t('websocket-closed'),
    [ReadyState.UNINSTANTIATED]: t('websocket-uninstantiated'),
  }[readyState];

  return {
    connectionStatus,
    statusColor,
    sendMessage,
    lastMessage,
    websocketOnline,
  };
};
