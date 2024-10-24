
import { ADD_CUSTOMER, CANCEL_PRESET, FINISH_TRANSACTION, LOCK_FUELLING_POINT, LOCK_PRESET_TRANSACTION, LOCK_TRANSACTION, SEARCH_CUSTOMER, TOGGLE_FUELLING_POINT_AUTHORIZATION, UNLOCK_FUELLING_POINT, UNLOCK_PRESET_TRANSACTION, UNLOCK_TRANSACTION } from "../constants/request";
import { AddCustomerRequest, CancelPresetRequest, ChangeLockFuellingPointRequest, ChangePresetTransactionRequest, ChangeTransactionRequest, FinishTransactionRequest, FuellingPointElement, SearchCustomerRequest, Transaction } from "../interfaces/ForecourtInterfaces";
import { IMessage } from "../interfaces/GlobalInterfaces";
import { isPrepay } from "./TransactionUtil";

const send = (message: string, sendMessage: any) => {
  sendMessage(message)
  console.log(message)
}

/**
 * Enviamos una instrucción para alternar un surtidor entre autorizado y desautorizado.
 *
 * @param fuellingPoint surtidor a autorizar/desautorizar
 */
export const sendToggleFuellingPointAuthorization = (
  fuellingPoint: FuellingPointElement,
  posId: number,
  sendMessage: (message: string) => void
) => {
  const toggleFuellingPointAuthorizationMessageData: ChangeLockFuellingPointRequest =
  {
    FuellingPointId: fuellingPoint.FuellingPointId,
    ControllerNumber: fuellingPoint.ControllerNumber,
    PosId: posId,
  };

  const toggleFuellingPointAuthorizationMessage: IMessage = {
    MessageCode: TOGGLE_FUELLING_POINT_AUTHORIZATION,
    MessageData: JSON.stringify(toggleFuellingPointAuthorizationMessageData),
  };

  //sendMessage(JSON.stringify(toggleFuellingPointAuthorizationMessage));
  send( JSON.stringify(toggleFuellingPointAuthorizationMessage), sendMessage);
};

/**
 * Enviamos una orden de bloqueo al surtidor.
 *
 * @param fuellingPoint surtidor a bloquear
 * @param posId identificador del pos en la estación
 * @param sendMessage método para enviar mensajes
 */
export const sendLockFuellingPoint = (
  fuellingPoint: FuellingPointElement,
  posId: number,
  sendMessage: (message: string) => void
) => {
  const lockFuellingPointMessageData: ChangeLockFuellingPointRequest = {
    FuellingPointId: fuellingPoint.FuellingPointId,
    ControllerNumber: fuellingPoint.ControllerNumber,
    PosId: posId,
  };

  const lockFuellingPointMessage: IMessage = {
    MessageCode: LOCK_FUELLING_POINT,
    MessageData: JSON.stringify(lockFuellingPointMessageData),
  };

  //sendMessage(JSON.stringify(lockFuellingPointMessage));
  send( JSON.stringify(lockFuellingPointMessage), sendMessage);
};

/**
 * Enviamos una orden de desbloqueo al surtidor.
 *
 * @param fuellingPoint surtidor a desbloquear
 * @param posId identificador del pos en la estación
 * @param sendMessage método para enviar mensajes
 */
export const sendUnlockFuellingPoint = (
  fuellingPoint: FuellingPointElement,
  posId: number,
  sendMessage: (message: string) => void
) => {
  const CancelPresetMessageData: ChangeLockFuellingPointRequest = {
    FuellingPointId: fuellingPoint.FuellingPointId,
    ControllerNumber: fuellingPoint.ControllerNumber,
    PosId: posId,
  };

  const unlockFuellingPointMessage: IMessage = {
    MessageCode: UNLOCK_FUELLING_POINT,
    MessageData: JSON.stringify(CancelPresetMessageData),
  };

  //sendMessage(JSON.stringify(unlockFuellingPointMessage));
  send( JSON.stringify(unlockFuellingPointMessage), sendMessage);
};

/**
 * Enviamos una petición de bloqueo de transacción, la cual debe verse en el ticket al ser correctamente bloqueada.
 *
 * @param transaction transacción a bloquear
 * @param controllerNumber controller number del concentrador de la transacción
 * @param posId identificador del pos en la estación
 * @param sendMessage método para enviar mensajes
 */
export const sendLockTransaction = (
  transaction: Transaction,
  posId: number,
  sendMessage: (message: string) => void
) => {
  const lockTransactionMessageData: ChangeTransactionRequest = {
    TransactionSequenceNumber: transaction.TransactionSequenceNumber,
    ControllerNumber: transaction.ControllerNumber,
    PosId: posId,
  };

  const lockTransactionMessage: IMessage = {
    MessageCode: LOCK_TRANSACTION,
    MessageData: JSON.stringify(lockTransactionMessageData),
  };

  //sendMessage(JSON.stringify(lockTransactionMessage));
  send( JSON.stringify(lockTransactionMessage), sendMessage);
};

/**
 * Enviamos una petición de desbloqueo de transacción, la cual debe eliminarse del ticket y verse de nuevo en el surtidor.
 *
 * @param transaction transacción a bloquear
 * @param controllerNumber controller number del concentrador de la transacción
 * @param posId identificador del pos en la estación
 * @param sendMessage método para enviar mensajes
 */
export const sendUnlockTransaction = (
  transaction: Transaction,
  posId: number,
  sendMessage: (message: string) => void
) => {
  const unlockTransactionMessageData: ChangeTransactionRequest = {
    TransactionSequenceNumber: transaction.TransactionSequenceNumber,
    ControllerNumber: transaction.ControllerNumber,
    PosId: posId,
  };

  const unlockTransactionMessage: IMessage = {
    MessageCode: UNLOCK_TRANSACTION,
    MessageData: JSON.stringify(unlockTransactionMessageData),
  };
  //sendMessage(JSON.stringify(unlockTransactionMessage));
  send(JSON.stringify(unlockTransactionMessage), sendMessage);
};

/**
 * Este método sirve para crear una línea de prepago sin cobrar
 *
 * @param transaction transacción que modela el prepago
 * @param posId identificador del pos de la estación
 * @param sendMessage método para enviar mensajes
 */
export const sendLockPresetTransaction = (
  transaction: Transaction,
  posId: number,
  sendMessage: (message: string) => void
) => {
  const lockPresetTransactionMessageData: ChangePresetTransactionRequest = {
    Transaction: transaction,
    PosId: posId,
  };

  const lockPresetTransactionMessage: IMessage = {
    MessageCode: LOCK_PRESET_TRANSACTION,
    MessageData: JSON.stringify(lockPresetTransactionMessageData),
  };

  //sendMessage(JSON.stringify(lockPresetTransactionMessage));
  send( JSON.stringify(lockPresetTransactionMessage), sendMessage);
};

/**
 * Este método sirve para eliminar una línea de prepago sin cobrar
 *
 * @param transaction transacción que modela el prepago
 * @param posId identificador del pos de la estación
 * @param sendMessage método para enviar mensajes
 */
export const sendUnlockPresetTransaction = (
  transaction: Transaction,
  posId: number,
  sendMessage: (message: string) => void
) => {
  const unlockPresetTransactionMessageData: ChangePresetTransactionRequest = {
    Transaction: transaction,
    PosId: posId,
  };

  const unlockPresetTransactionMessage: IMessage = {
    MessageCode: UNLOCK_PRESET_TRANSACTION,
    MessageData: JSON.stringify(unlockPresetTransactionMessageData),
  };
  //sendMessage(JSON.stringify(unlockPresetTransactionMessage));
  send( JSON.stringify(unlockPresetTransactionMessage), sendMessage);
};

/**
 * Enviamos una orden de cancelación de prepago.
 *
 * @param fuellingPoint surtidor con el prepago a cancelar
 * @param posId identificador del pos en la estación
 * @param sendMessage método para enviar mensajes
 */
export const sendCancelPreset = (
  fuellingPoint: FuellingPointElement,
  posId: number,
  sendMessage: (message: string) => void
) => {
  const cancelPresetMessageData: CancelPresetRequest = {
    FuellingPointId: fuellingPoint.FuellingPointId,
    ControllerNumber: fuellingPoint.ControllerNumber,
    PosId: posId,
  };

  const cancelPresetMessage: IMessage = {
    MessageCode: CANCEL_PRESET,
    MessageData: JSON.stringify(cancelPresetMessageData),
  };

  //sendMessage(JSON.stringify(cancelPresetMessage));
  send( JSON.stringify(cancelPresetMessage), sendMessage);
};

/**
 * Enviamos una petición de finalización de venta.
 *
 * @param transactions transacciones que componen el ticket
 * @param paymentMethodInfo tipo de medio de pago utilizado
 * @param idPersonal identificador del personal que realiza la venta
 * @param fuellingPointElements elementos de la estación, para recorrerlos y extraer el controller number de una transacción
 * @param posId identificador del pos en la estación
 * @param sendMessage método para enviar mensajes
 */
export const sendFinishTransaction = (
  transactions: Transaction[],
  paymentMethodInfo: string,
  idPersonal: number,
  posId: number,
  amountDelivered: number,
  idCustomer: number | undefined,
  idCardVehicleInfo: number | undefined,
  sendMessage: (message: string) => void
) => {
  const finishTransactionMessageData: FinishTransactionRequest = {
    FuellingTransactions: transactions.map((transaction) => {
      return {
        FuellingPointId: transaction.FuellingPointId,
        TransactionSequenceNumber: transaction.TransactionSequenceNumber,
        ControllerNumber: transaction.ControllerNumber,
        IsPrepay: isPrepay(transaction),
        PromotionList: transaction.PromotionList,
      };
    }),
    IdPersonal: idPersonal,
    PosId: posId,
    PaymentMethodInfo: paymentMethodInfo,
    AmountDelivered: amountDelivered,
    IdCustomer: idCustomer,
    IdCardVehicleInfo: idCardVehicleInfo,
  };

  const finishTransactionMessage: IMessage = {
    MessageCode: FINISH_TRANSACTION,
    MessageData: JSON.stringify(finishTransactionMessageData),
  };
  //sendMessage(JSON.stringify(finishTransactionMessage));
  send( JSON.stringify(finishTransactionMessage), sendMessage);
};

/**
 * Envíamos una petición de búsqueda de clientes.
 *
 * @param text texto usado de patrón de búsqueda
 * @param invoice indicativo de si estamos en la operativa de factura o no
 * @param sendMessage método para enviar mensajes
 */
export const searchCustomer = (
  text: string,
  invoice: boolean,
  sendMessage: (message: string) => void
) => {
  const searchCustomerMessageData: SearchCustomerRequest = {
    Text: text,
    Invoice: invoice,
  };

  const searchCustomerMessage: IMessage = {
    MessageCode: SEARCH_CUSTOMER,
    MessageData: JSON.stringify(searchCustomerMessageData),
  };

  //sendMessage(JSON.stringify(searchCustomerMessage));
  send( JSON.stringify(searchCustomerMessage), sendMessage);
};

/**
 *
 * @param transactions transacciones en el ticket actual
 * @param posId identificador de pos
 * @param idCustomer identificador del cliente
 * @param idCardVehicleInfo identificador del cliente tarjeta vehículo
 * @param sendMessage método para enviar mensajes al servidor
 */
export const sendAddCustomer = (
  transactions: Transaction[],
  posId: number,
  idCustomer: number | undefined,
  idCardVehicleInfo: number | undefined,
  sendMessage: (message: string) => void
) => {
  const addCustomerMessageData: AddCustomerRequest = {
    FuellingTransactions: transactions.map((transaction) => {
      return {
        FuellingPointId: transaction.FuellingPointId,
        TransactionSequenceNumber: transaction.TransactionSequenceNumber,
        ControllerNumber: transaction.ControllerNumber,
        IsPrepay: isPrepay(transaction),
        PromotionList: transaction.PromotionList,
      };
    }),
    PosId: posId,
    IdCustomer: idCustomer,
    IdCardVehicleInfo: idCardVehicleInfo,
  };

  const addCustomerMessage: IMessage = {
    MessageCode: ADD_CUSTOMER,
    MessageData: JSON.stringify(addCustomerMessageData),
  };
  //sendMessage(JSON.stringify(addCustomerMessage));
  send( JSON.stringify(addCustomerMessage), sendMessage);
};
