export interface Customer {
  IdCustomer: number;
  Name: string;
  DocumentId: string;
  Code: string;
  TypeCode: string;
  TypeName: string;
  IdCardVehicleInfo: number;
  Vehicle: string;
  Card: string;
}

export interface Promotion {
  IdPromotion: number;
  Name: string;
  Quantity: number;
  Value: number;
}
