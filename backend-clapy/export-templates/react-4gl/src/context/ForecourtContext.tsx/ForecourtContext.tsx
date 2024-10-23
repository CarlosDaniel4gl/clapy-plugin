import { createContext } from 'react';

import { useWebsocketTpvConnection } from '../../hooks/useWebsocketTpvConnection';
import {
  CustomerAddedResponse,
  FuellingPointElement,
  InformationMessage,
  LoginInfo,
  Transaction,
} from '../../interfaces/ForecourtInterfaces';
import { appStateValues, ForecourtState } from '../../interfaces/StateInterfaces';
import { Customer } from '../../interfaces/TicketInterfaces';
import { GradeOption } from '../../interfaces/ForecourtInterfaces';

export interface ForecourtContextProps {
  forecourtState: ForecourtState;
  selectedFp: FuellingPointElement| undefined;
  setSelectedFp: (fp: FuellingPointElement| undefined)=>void;
  selectedGo: GradeOption| undefined;
  setSelectedGo: (fp: GradeOption| undefined)=>void;
  websocketTpvConnection: ReturnType<typeof useWebsocketTpvConnection>;
  setForecourtConfiguration: (forecourtConfiguration: FuellingPointElement[]) => void;
  setLoginInfo: (loginInfo: LoginInfo[]) => void;
  setCustomerList: (customerList: Customer[]) => void;
  setCustomerTicket: (customerAddedResponse: CustomerAddedResponse) => void;
  deleteCustomerTicket: () => void;
  changeFuellingPointMainState: (fuellingPointId: number, fuellingPointMainState: string) => void;
  changeFuellingPointLockedFlag: (fuellingPointId: number, locked: boolean, posId: number | undefined) => void;
  changeFuellingPointPresetFlag: (fuellingPointId: number, preset: boolean) => void;
  changeTransaction: (transaction: Transaction) => void;
  removeLineFromTicket: (transaction: Transaction) => void;
  changeAppState: (appState: appStateValues) => void;
  changeInformationMessage: (infoMessage: InformationMessage) => void;
}

export const ForecourtContext = createContext<ForecourtContextProps>({} as ForecourtContextProps);
