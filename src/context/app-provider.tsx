
"use client";

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { collection, doc, Firestore, arrayUnion, arrayRemove } from 'firebase/firestore';
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
  toggleInstallmentPaidStatus: (purchaseId: string, installmentNumber: number, isPaid: boolean) => void;
  isLoaded: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getCollectionRef = (firestore: Firestore, userId: string, path: string) => {
  return collection(firestore, 'users', userId, path);
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isAuthPage = pathname === '/login' || pathname === '/signup';
    // If auth is loaded, there's no user, and we are NOT on an auth page, redirect to login.
    if (!isUserLoading && !user && !isAuthPage) {
      router.push('/login');
    }
  }, [user, isUserLoading, router, pathname]);


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
    // Data is loaded only if auth is resolved and all firestore hooks are done.
    return !isUserLoading && user && !peopleLoading && !cardsLoading && !purchasesLoading;
  }, [user, isUserLoading, peopleLoading, cardsLoading, purchasesLoading]);


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
    const dataWithPaidArray = { ...purchaseData, paidInstallments: [] };
    addDocumentNonBlocking(purchasesCollectionRef, dataWithPaidArray);
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
  
  const toggleInstallmentPaidStatus = (purchaseId: string, installmentNumber: number, isPaid: boolean) => {
    if (!user) return;
    const purchaseDocRef = doc(firestore, 'users', user.uid, 'purchases', purchaseId);
    updateDocumentNonBlocking(purchaseDocRef, {
        paidInstallments: isPaid ? arrayUnion(installmentNumber) : arrayRemove(installmentNumber)
    });
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
    toggleInstallmentPaidStatus,
    isLoaded,
  };
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // If the user is not logged in AND we are on an auth page, render the children (login/signup page).
  if (!user && isAuthPage) {
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
  }

  // If the user is logged in or is loading, render the children for other pages.
  if (user || isUserLoading) {
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
  }

  // In other cases (e.g., not logged in and not on auth page), return null while redirecting.
  return null;
}

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
