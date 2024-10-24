import {
  FuellingPointElement,
  InformationMessageInfo,
  LoginInfo,
  SettingsPar,
  Transaction,
  TransactionPartial,
} from '../../interfaces/ForecourtInterfaces';
import { appStateValues, ForecourtState } from '../../interfaces/StateInterfaces';
import { Customer } from '../../interfaces/TicketInterfaces';
import { isPrepay } from '../../utils/TransactionUtil';

type ForecourtAction =
  | {
      type: 'setForecourtConfiguration';
      payload: FuellingPointElement[];
    }
  | {
      type: 'setLoginInfo';
      payload: LoginInfo[];
    }
  | {
      type: 'setSettings';
      payload: SettingsPar[];
    }
  | {
      type: 'setCustomerList';
      payload: Customer[];
    }
  | {
      type: 'setCustomerTicket';
      payload: {
        customer: Customer | undefined;
        transactions: Transaction[];
      };
    }
  | {
      type: 'deleteCustomerTicket';
    }
  | {
      type: 'changeFuellingPointMainState';
      payload: { fuellingPointId: number; fuellingPointMainState: string };
    }
  | {
      type: 'changeFuellingPointLockedFlag';
      payload: {
        fuellingPointId: number;
        locked: boolean;
        posId: number | undefined;
      };
    }
  | {
      type: 'changeFuellingPointPresetFlag';
      payload: { fuellingPointId: number; preset: boolean };
    }
  | {
      type: 'transactionPartial';
      payload: { transaction: TransactionPartial };
    }
  | {
      type: 'changeTransaction';
      payload: { transaction: Transaction };
    }
  | {
      type: 'removeLineFromTicket';
      payload: { transaction: Transaction };
    }
  | {
      type: 'changeAppState';
      payload: { appState: appStateValues };
    }
  | {
      type: 'changeInformationMessage';
      payload: { infoMessage: InformationMessageInfo };
    }
  | { type: 'setLoginInfo'; payload: LoginInfo[] };

export const forecourtReducer = (state: ForecourtState, action: ForecourtAction): ForecourtState => {
  switch (action.type) {
    case 'setSettings':
      return {
        ...state,
        settings: action.payload,
      };
    case 'changeInformationMessage':
      return {
        ...state,
        infoMessage: action.payload.infoMessage,
      };
    case 'changeAppState':
      return {
        ...state,
        appState: action.payload.appState,
        infoMessage: undefined,
      };
    case 'setForecourtConfiguration':
      // posición en la que iniciamos la construcción del GridLayout
      let position = 0;
      // declarar y construir los nuevos precios que sustituirán los del estado
      let newPrices: {
        [key: number]: number;
      } = {};
      action.payload.forEach(fuellingPointElement => {
        fuellingPointElement.GradeOptions.forEach(gradeOption => {
          newPrices[gradeOption.GradeId] = gradeOption.Price;
        });
      });
      return {
        ...state,
        prices: newPrices,
        fuellingPointElements: [
          ...action.payload.map(fuellingPointElement => ({
            ...fuellingPointElement,
            i: fuellingPointElement.FuellingPointId.toString(),
            x: position++,
            y: 0,
            w: 1,
            h: 1,
            Transactions: fuellingPointElement.Transactions.filter(transaction => transaction.TransactionLockId === 0),
          })),
        ],
        // Aplana el array de transacciones con flatMap
        ticket: {
          ...state.ticket,
          Transactions: action.payload.flatMap(fuellingPointElement => {
            return fuellingPointElement.Transactions.filter(
              transaction =>
                transaction.TransactionLockId === state.posId,
            );
          }),
        },
      };
    case 'setLoginInfo':
      // Se asigna el primer personal de la colección
      return {
        ...state,
        loginActive: action.payload[0].IdPersonal,
        loginInfo: [...action.payload],
      };
    case 'setCustomerList':
      return {
        ...state,
        customerList: action.payload,
      };
    case 'changeFuellingPointMainState':
      return {
        ...state,
        fuellingPointElements: state.fuellingPointElements.map(fuellingPoint => {
          if (fuellingPoint.FuellingPointId === action.payload.fuellingPointId) {
            fuellingPoint.FuellingPointMainState = action.payload.fuellingPointMainState;
          }
          return fuellingPoint;
        }),
      };
    case 'changeFuellingPointLockedFlag':
      return {
        ...state,
        fuellingPointElements: state.fuellingPointElements.map(fuellingPoint => {
          if (fuellingPoint.FuellingPointId === action.payload.fuellingPointId) {
            fuellingPoint.Locked = action.payload.locked;
            fuellingPoint.PosIdLocked = action.payload.posId;
          }
          return fuellingPoint;
        }),
      };
    case 'changeFuellingPointPresetFlag':
      return {
        ...state,
        fuellingPointElements: state.fuellingPointElements.map(fuellingPoint => {
          if (fuellingPoint.FuellingPointId === action.payload.fuellingPointId) {
            fuellingPoint.Preset = action.payload.preset;
          }
          return fuellingPoint;
        }),
      };
    case 'removeLineFromTicket':
      return {
        ...state,
        ticket: {
          ...state.ticket,
          Transactions: state.ticket.Transactions.filter(transaction => {
            return !(
              transaction.TransactionSequenceNumber === action.payload.transaction.TransactionSequenceNumber &&
              transaction.FuellingPointId === action.payload.transaction.FuellingPointId
            );
          }),
        },
      };
    case 'transactionPartial':
      return {
        ...state,
        fuellingPointElements: state.fuellingPointElements.map(fuellingPoint => {
          if (fuellingPoint.FuellingPointId === action.payload.transaction.FuellingPointId) {
            // Retorno únicamente las transacciones o bien sin bloquear o bloqueadas por mi
            return {
              ...fuellingPoint,
            };
          } else {
            return fuellingPoint;
          }
        }),
      };
    case 'changeTransaction':
      return {
        ...state,
        fuellingPointElements: state.fuellingPointElements.map(fuellingPoint => {
          if (fuellingPoint.FuellingPointId === action.payload.transaction.FuellingPointId) {
            const transactionToUpdate = fuellingPoint.Transactions.find(
              transaction =>
                transaction.TransactionSequenceNumber === action.payload.transaction.TransactionSequenceNumber,
            );
            if (transactionToUpdate) {
              // La transacción existe, actualiza el TransactionLockId
              transactionToUpdate.TransactionLockId = action.payload.transaction.TransactionLockId;
            } else {
              // La transacción no existe, agrégala al array si no es prepago
              if (!isPrepay(action.payload.transaction)) {
                fuellingPoint.Transactions = [...fuellingPoint.Transactions, action.payload.transaction];
              }
            }
            // Retorno únicamente las transacciones o bien sin bloquear o bloqueadas por mi
            return {
              ...fuellingPoint,
              Transactions: fuellingPoint.Transactions.filter(t => t.TransactionLockId === 0),
            };
          } else {
            return fuellingPoint;
          }
        }),
        ticket: {
          ...state.ticket,
          Transactions:
            action.payload.transaction.TransactionLockId !== state.posId? state.ticket.Transactions.filter(
                  transacion =>
                    transacion.TransactionSequenceNumber !== action.payload.transaction.TransactionSequenceNumber ||
                    (isPrepay(transacion) && transacion.FuellingPointId !== action.payload.transaction.FuellingPointId),
                )
              : [...state.ticket.Transactions, action.payload.transaction],
        },
      };
    case 'setCustomerTicket':
      return {
        ...state,
        ticket: {
          ...state.ticket,
          Customer: action.payload.customer,
          Transactions: state.ticket.Transactions.map(transaction => {
            // Buscar la transacción correspondiente en el payload
            const updatedTransaction = action.payload.transactions.find(t =>
              isPrepay(t)
                ? t.TransactionSequenceNumber === transaction.TransactionSequenceNumber
                : t.FuellingPointId === transaction.FuellingPointId,
            );
            // Si se encuentra, actualizar la PromotionList
            if (updatedTransaction) {
              return {
                ...transaction,
                PromotionList: updatedTransaction.PromotionList,
              };
            } else {
              // Si no se encuentra, devolver la transacción original
              return transaction;
            }
          }),
        },
      };
    case 'deleteCustomerTicket':
      return {
        ...state,
        ticket: {
          ...state.ticket,
          Customer: undefined,
          Transactions: state.ticket.Transactions.map(transaction => {
            return {
              ...transaction,
              PromotionList: [],
            };
          }),
        },
      };
    default:
      return state;
  }
};
