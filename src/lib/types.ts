
export interface Person {
  id: string;
  name: string;
  phoneNumber: string;
}

export interface Card {
  id: string;
  name: string;
  brand: string;
  dueDate: number;
  closingDate: number;
}

export interface Purchase {
  id: string;
  personId: string;
  cardId: string;
  store: string;
  items: string;
  totalAmount: number;
  installments: number;
  purchaseDate: string; // ISO string
  paidInstallments: number[]; // Array of paid installment numbers
}

export interface Installment {
  id: string;
  purchaseId: string;
  personId: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: string; // ISO string
  store: string;
  isPaid: boolean;
}
