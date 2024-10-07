import { Transaction } from "../interfaces/ForecourtInterfaces";

/**
 * Evalúa si una transacción es prepago
 *
 * @param transaction transacción a evaluar
 * @returns true si es prepago y falso en caso contrario
 */
export const isPrepay = (transaction: Transaction): boolean => {
  return (
    transaction.TransactionSequenceNumber === -1 && transaction.PresetValue > 0
  );
};

/**
 * Retorna un total en función de las transacciones del ticket.
 *
 * @returns total del ticket
 */
export const sumTransactions = (transactions: Transaction[]) => {
  let total = 0;
  transactions.forEach((transaction) => {
    total =
      total + (transaction.Money ? transaction.Money : transaction.PresetValue);
    transaction.PromotionList &&
      transaction.PromotionList.forEach((promotion) => {
        total = total - promotion.Value * 100;
      });
  });
  return total / 100;
};
