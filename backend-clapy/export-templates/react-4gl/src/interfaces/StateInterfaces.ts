import { Customer } from "./TicketInterfaces";
import { SettingsPar } from './ForecourtInterfaces';
import {
  FuellingPointElement,
  InformationMessageInfo,
  LoginInfo,
  Ticket,
} from "./ForecourtInterfaces";

export type appStateValues =
  | "interactive"
  | "payment"
  | "config-required"
  | "connection-offline";

export interface ForecourtState {
  appState: appStateValues;
  posId: number;
  fuellingPointElements: FuellingPointElement[];
  ticket: Ticket;
  loginInfo: LoginInfo[];
  loginActive: number;
  infoMessage: InformationMessageInfo | undefined;
  prices: { [key: number]: number };
  customerList: Customer[];
  settings: SettingsPar[]
}
