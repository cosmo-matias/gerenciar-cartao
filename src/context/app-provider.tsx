"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Person, Card, Purchase } from '@/lib/types';

interface AppContextType {
  people: Person[];
  addPerson: (personData: Omit<Person, 'id'>) => void;
  cards: Card[];
  addCard: (cardData: Omit<Card, 'id'>) => void;
  purchases: Purchase[];
  addPurchase: (purchaseData: Omit<Purchase, 'id'>) => void;
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
    setIsLoaded(true);
  }, []);

  const addPerson = (personData: Omit<Person, 'id'>) => {
    const newPerson: Person = { id: crypto.randomUUID(), ...personData };
    setPeople(prev => [...prev, newPerson]);
  };

  const addCard = (cardData: Omit<Card, 'id'>) => {
    const newCard: Card = { id: crypto.randomUUID(), ...cardData };
    setCards(prev => [...prev, newCard]);
  };
  
  const addPurchase = (purchaseData: Omit<Purchase, 'id'>) => {
    const newPurchase: Purchase = { id: crypto.randomUUID(), ...purchaseData };
    setPurchases(prev => [...prev, newPurchase]);
  };

  const value = {
    people,
    addPerson,
    cards,
    addCard,
    purchases,
    addPurchase,
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