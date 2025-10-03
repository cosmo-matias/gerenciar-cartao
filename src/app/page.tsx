"use client";

import { useState } from 'react';
import { Header } from '@/components/header';
import { AddPersonDialog } from '@/components/dialogs/add-person-dialog';
import { AddCardDialog } from '@/components/dialogs/add-card-dialog';
import { AddPurchaseDialog } from '@/components/dialogs/add-purchase-dialog';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { UpcomingInstallments } from '@/components/dashboard/upcoming-installments';
import { ManagementTabs } from '@/components/dashboard/management-tabs';
import type { Person, Card, Purchase } from '@/lib/types';

export default function Home() {
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [addPurchaseOpen, setAddPurchaseOpen] = useState(false);

  const [editingPerson, setEditingPerson] = useState<Person | undefined>(undefined);
  const [editingCard, setEditingCard] = useState<Card | undefined>(undefined);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | undefined>(undefined);

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
    setAddPersonOpen(true);
  };
  
  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setAddCardOpen(true);
  };
  
  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setAddPurchaseOpen(true);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header
        onAddPerson={() => { setEditingPerson(undefined); setAddPersonOpen(true); }}
        onAddCard={() => { setEditingCard(undefined); setAddCardOpen(true); }}
        onAddPurchase={() => { setEditingPurchase(undefined); setAddPurchaseOpen(true); }}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <SummaryCards />
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-12">
          <UpcomingInstallments className="lg:col-span-7" onEdit={handleEditPurchase} />
          <ManagementTabs 
            className="lg:col-span-5" 
            onEditPerson={handleEditPerson}
            onEditCard={handleEditCard}
            onEditPurchase={handleEditPurchase}
          />
        </div>
      </main>
      <AddPersonDialog 
        key={editingPerson?.id || 'new-person'}
        open={addPersonOpen} 
        onOpenChange={setAddPersonOpen} 
        person={editingPerson}
      />
      <AddCardDialog 
        key={editingCard?.id || 'new-card'}
        open={addCardOpen} 
        onOpenChange={setAddCardOpen}
        card={editingCard}
      />
      <AddPurchaseDialog 
        key={editingPurchase?.id || 'new-purchase'}
        open={addPurchaseOpen} 
        onOpenChange={setAddPurchaseOpen} 
        purchase={editingPurchase}
      />
    </div>
  );
}
