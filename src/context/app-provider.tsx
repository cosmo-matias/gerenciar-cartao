"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Person, Card, Purchase } from '@/lib/types';

interface AppContextType {
  people: Person[];
  addPerson: (personData: Omit<Person, 'id'>) => void;
  updatePerson: (personData: Person) => void;
  deletePerson: (personId: string) => void;
  cards: Card[];
  addCard: (cardData: Omit<Card, 'id'>) => void;
  updateCard: (cardData: Card) => void;
  deleteCard: (cardId: string) => void;
  purchases: Purchase[];
  addPurchase: (purchaseData: Omit<Purchase, 'id'>) => void;
  updatePurchase: (purchaseData: Purchase) => void;
  deletePurchase: (purchaseId: string) => void;
  isLoaded: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialData = {
  people: [],
  cards: [],
  purchases: [],
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [people, setPeople] = useLocalStorage<Person[]>('cardbuddy_people', initialData.people);
  const [cards, setCards] = useLocalStorage<Card[]>('cardbuddy_cards', initialData.cards);
  const [purchases, setPurchases] = useLocalStorage<Purchase[]>('cardbuddy_purchases', initialData.purchases);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after initial render
    // which avoids hydration errors.
    setIsLoaded(true);
  }, []);

  const addPerson = (personData: Omit<Person, 'id'>) => {
    const newPerson: Person = { id: crypto.randomUUID(), ...personData };
    setPeople(prev => [...prev, newPerson]);
  };

  const updatePerson = (personData: Person) => {
    setPeople(prev => prev.map(p => p.id === personData.id ? personData : p));
  };
  
  const deletePerson = (personId: string) => {
    setPeople(prev => prev.filter(p => p.id !== personId));
  };

  const addCard = (cardData: Omit<Card, 'id'>) => {
    const newCard: Card = { id: crypto.randomUUID(), ...cardData };
    setCards(prev => [...prev, newCard]);
  };
  
  const updateCard = (cardData: Card) => {
    setCards(prev => prev.map(c => c.id === cardData.id ? cardData : c));
  };

  const deleteCard = (cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
  };

  const addPurchase = (purchaseData: Omit<Purchase, 'id'>) => {
    const newPurchase: Purchase = { id: crypto.randomUUID(), ...purchaseData };
    setPurchases(prev => [...prev, newPurchase]);
  };
  
  const updatePurchase = (purchaseData: Purchase) => {
    setPurchases(prev => prev.map(p => p.id === purchaseData.id ? purchaseData : p));
  };

  const deletePurchase = (purchaseId: string) => {
    setPurchases(prev => prev.filter(p => p.id !== purchaseId));
  }

  const value = {
    people,
    addPerson,
    updatePerson,
    deletePerson,
    cards,
    addCard,
    updateCard,
    deleteCard,
    purchases,
    addPurchase,
    updatePurchase,
    deletePurchase,
    isLoaded,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
