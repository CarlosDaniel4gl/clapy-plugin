import { Layout } from 'react-grid-layout';

import { Customer, Promotion } from './TicketInterfaces';

export interface GradeOption {
  GradeOptionNo: number;
  GradeId: number;
  Price: number;
  GradeDescription: string;
  GradeImageBase64: string;
}

export interface Ticket {
  Transactions: Transaction[];
  Customer: Customer | undefined;
}

export interface Transaction {
  TransactionSequenceNumber: number;
  TransactionLockId: number;
  FuellingPointId: number;
  ControllerNumber: number;
  Money: number;
  Volume: number;
  GradeId: number;
  GradeOptionNo: number;
  PresetValue: number;
  PromotionList: Promotion[];
}

export interface TransactionPartial {
  FuellingPointId: number, 
  Money: number, 
  Volume: number
}

export interface TransactionFinished {
  PosId: number;
}

export interface InformationMessageInfo {
  Message: string;
  Dialog: boolean;
}

export interface InformationMessage extends InformationMessageInfo {
  PosId: number;
}

export interface ChangeTransactionRequest {
  TransactionSequenceNumber: number;
  ControllerNumber: number;
  PosId: number;
}

export interface ChangePresetTransactionRequest {
  Transaction: Transaction;
  PosId: number;
}

export interface ChangeLockFuellingPointRequest {
  FuellingPointId: number;
  ControllerNumber: number;
  PosId: number;
}

export interface CancelPresetRequest {
  FuellingPointId: number;
  ControllerNumber: number;
  PosId: number;
}

export interface SearchCustomerRequest {
  Text: string;
  Invoice: boolean;
}

export interface AddCustomerRequest {
  FuellingTransactions: FuellingTransaction[];
  PosId: number;
  IdCustomer: number | undefined;
  IdCardVehicleInfo: number | undefined;
}

export interface CustomerAddedResponse {
  PosId: number;
  Customer: Customer | undefined;
  Transactions: Transaction[];
}

export interface LoginInfo {
  IdPersonal: number;
  Login: string;
  Password: string;
}

export interface FuellingPointElement extends Layout {
  FuellingPointId: number;
  Number: string;
  FuellingPointMainState: string;
  ControllerNumber: number;
  Locked: boolean;
  PosIdLocked: number | undefined;
  Preset: boolean;
  Transactions: Transaction[];
  GradeOptions: GradeOption[];
}

export interface SettingsPar {
  Key: string;
  Value: string;
}

export interface Settings {
  CardPayment: boolean;
  BlankPumpScreenWithoutItems: boolean;
  CreditCustomerModule: boolean;
  StationName?: string;
}

export interface FinishTransactionRequest {
  FuellingTransactions: FuellingTransaction[];
  IdPersonal: number;
  PosId: number;
  PaymentMethodInfo: string;
  AmountDelivered: number;
  IdCustomer: number | undefined;
  IdCardVehicleInfo: number | undefined;
}

export interface FuellingTransaction {
  FuellingPointId: number;
  TransactionSequenceNumber: number;
  ControllerNumber: number;
  IsPrepay: boolean;
  PromotionList: Promotion[];
}
