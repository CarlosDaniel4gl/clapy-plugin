import { useEffect, useReducer, useState } from 'react';

import { useWebsocketTpvConnection } from '../../hooks/useWebsocketTpvConnection';
import {
  CustomerAddedResponse,
  FuellingPointElement,
  InformationMessage,
  InformationMessageInfo,
  LoginInfo,
  SettingsPar,
  Transaction,
  TransactionFinished,
  TransactionPartial,
} from '../../interfaces/ForecourtInterfaces';
import { IMessage } from '../../interfaces/GlobalInterfaces';
import { appStateValues, ForecourtState } from '../../interfaces/StateInterfaces';
import { Customer } from '../../interfaces/TicketInterfaces';
import { ForecourtContext } from './ForecourtContext';
import { forecourtReducer } from './forecourtReducer';
import { GradeOption } from '../../interfaces/ForecourtInterfaces';

interface props {
  children: JSX.Element | JSX.Element[];
}

const INITIAL_STATE: ForecourtState = {
  appState: 'interactive',
  posId: parseInt(window.location.href.replace('//', '').split('/')[1]!),
  fuellingPointElements: [],
  ticket: { Transactions: [], Customer: undefined },
  loginInfo: [],
  loginActive: 0,
  infoMessage: undefined,
  prices: {},
  customerList: [],
  settings: [],
};

export const ForecourtProvider = ({ children }: props) => {
  const websocketTpvConnection: ReturnType<typeof useWebsocketTpvConnection> = useWebsocketTpvConnection();

  const [forecourtState, dispatch] = useReducer(forecourtReducer, INITIAL_STATE);
  const [selectedFp, setSelectedFp] = useState<FuellingPointElement | undefined>(undefined);
  const [selectedGo, setSelectedGo] = useState<GradeOption | undefined>(undefined);

  const setForecourtConfiguration = (forecourtConfiguration: FuellingPointElement[]) => {
    dispatch({
      type: 'setForecourtConfiguration',
      payload: forecourtConfiguration,
    });
  };

  const setLoginInfo = (loginInfo: LoginInfo[]) => {
    dispatch({
      type: 'setLoginInfo',
      payload: loginInfo,
    });
  };

  const setSettings = (settings: SettingsPar[]) => {
    dispatch({
      type: 'setSettings',
      payload: settings,
    });
  };

  const setCustomerList = (customerList: Customer[]) => {
    dispatch({
      type: 'setCustomerList',
      payload: customerList,
    });
  };

  const setCustomerTicket = (customerAddedResponse: CustomerAddedResponse) => {
    dispatch({
      type: 'setCustomerTicket',
      payload: {
        customer: customerAddedResponse.Customer,
        transactions: customerAddedResponse.Transactions,
      },
    });
  };

  const deleteCustomerTicket = () => {
    dispatch({
      type: 'deleteCustomerTicket',
    });
  };

  const changeFuellingPointMainState = (fuellingPointId: number, fuellingPointMainState: string) => {
    dispatch({
      type: 'changeFuellingPointMainState',
      payload: {
        fuellingPointId,
        fuellingPointMainState,
      },
    });
  };

  const changeFuellingPointLockedFlag = (fuellingPointId: number, locked: boolean, posId: number | undefined) => {
    dispatch({
      type: 'changeFuellingPointLockedFlag',
      payload: {
        fuellingPointId,
        locked,
        posId,
      },
    });
  };

  const changeFuellingPointPresetFlag = (fuellingPointId: number, preset: boolean) => {
    dispatch({
      type: 'changeFuellingPointPresetFlag',
      payload: {
        fuellingPointId,
        preset,
      },
    });
  };

  const changeTransaction = (transaction: Transaction) => {
    dispatch({
      type: 'changeTransaction',
      payload: {
        transaction,
      },
    });
  };

  const transactionPartial = (transaction: TransactionPartial) => {
    dispatch({
      type: 'transactionPartial',
      payload: {
        transaction,
      },
    });
  };

  const removeLineFromTicket = (transaction: Transaction) => {
    dispatch({
      type: 'removeLineFromTicket',
      payload: {
        transaction,
      },
    });
  };

  /**
   * Este método comprueba que la finalización de transacción sea mia para cambiar de nuevo a estado de manejor de la app
   *
   * @param transactionFinished
   */
  const transactionFinished = (transactionFinished: TransactionFinished) => {
    forecourtState.posId === transactionFinished.PosId &&
      forecourtState.appState === 'payment' &&
      setCustomerTicket({
        PosId: forecourtState.posId,
        Customer: undefined,
        Transactions: [],
      });
    changeAppState('interactive');
  };

  const changeAppState = (appState: appStateValues) => {
    dispatch({
      type: 'changeAppState',
      payload: {
        appState,
      },
    });
  };

  /**
   * Este método gestiona la recepción de un mensaje informativo dirigido a un posId por parte del servidor.
   *
   * @param informationMessage
   */
  const informationMessage = (informationMessage: InformationMessage) => {
    forecourtState.posId === informationMessage.PosId &&
      forecourtState.appState === 'payment' &&
      changeInformationMessage(informationMessage);
  };

  const changeInformationMessage = (infoMessage: InformationMessageInfo) => {
    dispatch({
      type: 'changeInformationMessage',
      payload: {
        infoMessage,
      },
    });
  };

  useEffect(() => {
    websocketTpvConnection.websocketOnline ? changeAppState('interactive') : changeAppState('connection-offline');
  }, [websocketTpvConnection.websocketOnline]);

  useEffect(() => {
    if (websocketTpvConnection.lastMessage !== null) {
      const message: IMessage = JSON.parse(websocketTpvConnection.lastMessage.data);
      console.log(message.MessageCode, JSON.parse(message.MessageData));
      switch (message.MessageCode) {
        case 'FC':
          setForecourtConfiguration(JSON.parse(message.MessageData));
          break;
        case 'LI':
          setLoginInfo(JSON.parse(message.MessageData));
          break;
        case 'ST':
          setSettings(JSON.parse(message.MessageData));
          break;
        case 'CL':
          setCustomerList(JSON.parse(message.MessageData));
          break;
        case 'CA':
          setCustomerTicket(JSON.parse(message.MessageData));
          break;
        case 'FS':
          changeFuellingPointMainState(
            JSON.parse(message.MessageData).FuellingPointId,
            JSON.parse(message.MessageData).FuellingPointMainState,
          );
          break;
        case 'FL':
          changeFuellingPointLockedFlag(
            JSON.parse(message.MessageData).FuellingPointId,
            JSON.parse(message.MessageData).Locked,
            JSON.parse(message.MessageData).PosId,
          );
          break;
        case 'FP':
          changeFuellingPointPresetFlag(
            JSON.parse(message.MessageData).FuellingPointId,
            JSON.parse(message.MessageData).Preset,
          );
          break;
        case 'FD':
          transactionPartial(JSON.parse(message.MessageData));
          break;
        case 'CT':
          changeTransaction(JSON.parse(message.MessageData));
          break;
        case 'TF':
          transactionFinished(JSON.parse(message.MessageData));
          break;
        case 'IM':
          informationMessage(JSON.parse(message.MessageData));
          break;
      }
    }
  }, [websocketTpvConnection.lastMessage]);

  return (
    <ForecourtContext.Provider
      value={{
        forecourtState,
        selectedFp,
        setSelectedFp,
        selectedGo, setSelectedGo,
        websocketTpvConnection,
        setForecourtConfiguration,
        setLoginInfo,
        setCustomerList,
        setCustomerTicket,
        deleteCustomerTicket,
        changeFuellingPointMainState,
        changeTransaction,
        removeLineFromTicket,
        changeAppState,
        changeInformationMessage,
        changeFuellingPointLockedFlag,
        changeFuellingPointPresetFlag,
      }}
    >
      {children}
    </ForecourtContext.Provider>
  );
};
