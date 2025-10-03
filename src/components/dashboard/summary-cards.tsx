"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-provider';
import { calculateInstallments, formatCurrency } from '@/lib/utils';
import { Users, CreditCard, Landmark } from 'lucide-react';

export function SummaryCards() {
  const { people, cards, purchases } = useAppContext();

  const totalOwed = useMemo(() => {
    return purchases
      .flatMap(purchase => {
        const card = cards.find(c => c.id === purchase.cardId);
        return card ? calculateInstallments(purchase, card) : [];
      })
      .reduce((sum, installment) => sum + installment.amount, 0);
  }, [purchases, cards]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dívida Total</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalOwed)}</div>
          <p className="text-xs text-muted-foreground">Soma de todas as parcelas futuras</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pessoas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{people.length}</div>
          <p className="text-xs text-muted-foreground">Total de pessoas cadastradas</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cartões</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cards.length}</div>
          <p className="text-xs text-muted-foreground">Total de cartões cadastrados</p>
        </CardContent>
      </Card>
    </div>
  );
}
