"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PeopleView } from './people-view';
import { CardsView } from './cards-view';
import { AllPurchasesView } from './all-purchases-view';
import type { Person, Card as CardType, Purchase } from '@/lib/types';

interface ManagementTabsProps {
  className?: string;
  onEditPerson: (person: Person) => void;
  onEditCard: (card: CardType) => void;
  onEditPurchase: (purchase: Purchase) => void;
}

export function ManagementTabs({ className, onEditPerson, onEditCard, onEditPurchase }: ManagementTabsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Gerenciamento</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="people">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="people">Pessoas</TabsTrigger>
            <TabsTrigger value="cards">Cartões</TabsTrigger>
            <TabsTrigger value="purchases">Compras</TabsTrigger>
          </TabsList>
          <TabsContent value="people">
            <PeopleView onEditPerson={onEditPerson} />
          </TabsContent>
          <TabsContent value="cards">
            <CardsView onEditCard={onEditCard} />
          </TabsContent>
          <TabsContent value="purchases">
            <AllPurchasesView onEditPurchase={onEditPurchase}/>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
