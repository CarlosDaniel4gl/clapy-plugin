import { createContext } from "react";
import { appStateValues, ForecourtState } from "../../interfaces/StateInterfaces";
import { CustomerAddedResponse, FuellingPointElement, InformationMessage, LoginInfo, Transaction } from "../../interfaces/ForecourtInterfaces";
import { Customer } from "../../interfaces/TicketInterfaces";
import { useWebsocketTpvConnection } from "../../hooks/useWebsocketTpvConnection";

export interface ForecourtContextProps {
  forecourtState: ForecourtState;
  websocketTpvConnection: ReturnType<typeof useWebsocketTpvConnection>;
  setForecourtConfiguration: (
    forecourtConfiguration: FuellingPointElement[]
  ) => void;
  setLoginInfo: (loginInfo: LoginInfo[]) => void;
  setCustomerList: (customerList: Customer[]) => void;
  setCustomerTicket: (customerAddedResponse: CustomerAddedResponse) => void;
  deleteCustomerTicket: () => void;
  changeFuellingPointMainState: (
    fuellingPointId: number,
    fuellingPointMainState: string
  ) => void;
  changeFuellingPointLockedFlag: (
    fuellingPointId: number,
    locked: boolean,
    posId: number | undefined
  ) => void;
  changeFuellingPointPresetFlag: (
    fuellingPointId: number,
    preset: boolean
  ) => void;
  changeTransaction: (transaction: Transaction) => void;
  removeLineFromTicket: (transaction: Transaction) => void;
  changeAppState: (appState: appStateValues) => void;
  changeInformationMessage: (infoMessage: InformationMessage) => void;
}

export const ForecourtContext = createContext<ForecourtContextProps>(
  {} as ForecourtContextProps
);
