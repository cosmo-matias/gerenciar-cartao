"use client";

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { collection, doc, Firestore } from 'firebase/firestore';
import type { Person, Card, Purchase } from '@/lib/types';
import { initiateAnonymousSignIn, useAuth } from '@/firebase';

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

const getCollectionRef = (firestore: Firestore, userId: string, path: string) => {
  return collection(firestore, 'users', userId, path);
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const peopleCollectionRef = useMemoFirebase(
    () => (user ? getCollectionRef(firestore, user.uid, 'people') : null),
    [firestore, user]
  );
  const cardsCollectionRef = useMemoFirebase(
    () => (user ? getCollectionRef(firestore, user.uid, 'creditCards') : null),
    [firestore, user]
  );
  const purchasesCollectionRef = useMemoFirebase(
    () => (user ? getCollectionRef(firestore, user.uid, 'purchases') : null),
    [firestore, user]
  );

  const { data: peopleData, isLoading: peopleLoading } = useCollection<Person>(peopleCollectionRef);
  const { data: cardsData, isLoading: cardsLoading } = useCollection<Card>(cardsCollectionRef);
  const { data: purchasesData, isLoading: purchasesLoading } = useCollection<Purchase>(purchasesCollectionRef);
  
  const isLoaded = useMemo(() => {
    return !!user && !peopleLoading && !cardsLoading && !purchasesLoading;
  }, [user, peopleLoading, cardsLoading, purchasesLoading]);

  const addPerson = (personData: Omit<Person, 'id'>) => {
    if (!peopleCollectionRef) return;
    addDocumentNonBlocking(peopleCollectionRef, personData);
  };

  const updatePerson = (personData: Person) => {
    if (!user) return;
    const personDocRef = doc(firestore, 'users', user.uid, 'people', personData.id);
    const { id, ...dataToUpdate } = personData;
    updateDocumentNonBlocking(personDocRef, dataToUpdate);
  };

  const deletePerson = (personId: string) => {
    if (!user) return;
    const personDocRef = doc(firestore, 'users', user.uid, 'people', personId);
    deleteDocumentNonBlocking(personDocRef);
  };

  const addCard = (cardData: Omit<Card, 'id'>) => {
    if (!cardsCollectionRef) return;
    addDocumentNonBlocking(cardsCollectionRef, cardData);
  };

  const updateCard = (cardData: Card) => {
    if (!user) return;
    const cardDocRef = doc(firestore, 'users', user.uid, 'creditCards', cardData.id);
    const { id, ...dataToUpdate } = cardData;
    updateDocumentNonBlocking(cardDocRef, dataToUpdate);
  };

  const deleteCard = (cardId: string) => {
    if (!user) return;
    const cardDocRef = doc(firestore, 'users', user.uid, 'creditCards', cardId);
    deleteDocumentNonBlocking(cardDocRef);
  };

  const addPurchase = (purchaseData: Omit<Purchase, 'id'>) => {
    if (!purchasesCollectionRef) return;
    addDocumentNonBlocking(purchasesCollectionRef, purchaseData);
  };

  const updatePurchase = (purchaseData: Purchase) => {
    if (!user) return;
    const purchaseDocRef = doc(firestore, 'users', user.uid, 'purchases', purchaseData.id);
    const { id, ...dataToUpdate } = purchaseData;
    updateDocumentNonBlocking(purchaseDocRef, dataToUpdate);
  };

  const deletePurchase = (purchaseId: string) => {
    if (!user) return;
    const purchaseDocRef = doc(firestore, 'users', user.uid, 'purchases', purchaseId);
    deleteDocumentNonBlocking(purchaseDocRef);
  };

  const value = {
    people: peopleData || [],
    addPerson,
    updatePerson,
    deletePerson,
    cards: cardsData || [],
    addCard,
    updateCard,
    deleteCard,
    purchases: purchasesData || [],
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
