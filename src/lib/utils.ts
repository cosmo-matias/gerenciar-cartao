import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { addMonths, setDate, getDate, getMonth, getYear } from 'date-fns';
import type { Purchase, Card, Installment } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function calculateInstallments(purchase: Purchase, card: Card): Installment[] {
  const installments: Installment[] = [];
  const { totalAmount, installments: numInstallments, purchaseDate: purchaseDateStr, store, personId, id: purchaseId } = purchase;
  const installmentAmount = totalAmount / numInstallments;
  const purchaseDate = new Date(purchaseDateStr);

  let firstDueDate = new Date(purchaseDate);

  // If purchase is made after closing date, first payment is in the next-next month's bill
  if (getDate(purchaseDate) > card.closingDate) {
    firstDueDate = addMonths(firstDueDate, 2);
  } else {
    // Otherwise, it's in the next month's bill
    firstDueDate = addMonths(firstDueDate, 1);
  }

  // Set the day to the card's due date
  firstDueDate = setDate(firstDueDate, card.dueDate);

  for (let i = 1; i <= numInstallments; i++) {
    const dueDate = i === 1 ? firstDueDate : addMonths(installments[i - 2].dueDate, 1);
    
    installments.push({
      id: `${purchaseId}-${i}`,
      purchaseId,
      personId,
      installmentNumber: i,
      totalInstallments: numInstallments,
      amount: installmentAmount,
      dueDate: dueDate.toISOString(),
      store,
    });
  }

  return installments;
}
