interface paymentMethodProps {
  name: string;
  code: string;
}

export const CASH: paymentMethodProps = {
  name: "CASH",
  code: "CH",
};

export const CARD: paymentMethodProps = {
  name: "CARD",
  code: "CD",
};

export const CREDIT: paymentMethodProps = {
  name: "CREDIT",
  code: "CR",
};
