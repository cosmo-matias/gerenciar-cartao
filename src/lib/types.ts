export interface Person {
  id: string;
  name: string;
  phone: string;
}

export interface Card {
  id: string;
  name: string;
  flag: string;
  dueDate: number;
  closingDate: number;
}

export interface Purchase {
  id:string;
  personId: string;
  cardId: string;
  store: string;
  totalAmount: number;
  installments: number;
  purchaseDate: string; // ISO string
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
}
