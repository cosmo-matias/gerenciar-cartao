"use client";

import { useState } from 'react';
import { Header } from '@/components/header';
import { AddPersonDialog } from '@/components/dialogs/add-person-dialog';
import { AddCardDialog } from '@/components/dialogs/add-card-dialog';
import { AddPurchaseDialog } from '@/components/dialogs/add-purchase-dialog';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { UpcomingInstallments } from '@/components/dashboard/upcoming-installments';
import { PeopleView } from '@/components/dashboard/people-view';

export default function Home() {
  const [isAddPersonOpen, setAddPersonOpen] = useState(false);
  const [isAddCardOpen, setAddCardOpen] = useState(false);
  const [isAddPurchaseOpen, setAddPurchaseOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header
        onAddPerson={() => setAddPersonOpen(true)}
        onAddCard={() => setAddCardOpen(true)}
        onAddPurchase={() => setAddPurchaseOpen(true)}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <SummaryCards />
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-12">
          <UpcomingInstallments className="lg:col-span-7" />
          <PeopleView className="lg:col-span-5" />
        </div>
      </main>
      <AddPersonDialog open={isAddPersonOpen} onOpenChange={setAddPersonOpen} />
      <AddCardDialog open={isAddCardOpen} onOpenChange={setAddCardOpen} />
      <AddPurchaseDialog open={isAddPurchaseOpen} onOpenChange={setAddPurchaseOpen} />
    </div>
  );
}
