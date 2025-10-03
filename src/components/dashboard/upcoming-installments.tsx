"use client";

import { useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/context/app-provider';
import { calculateInstallments, formatCurrency } from '@/lib/utils';
import { getMonth, getYear, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function UpcomingInstallments({ className }: { className?: string }) {
  const { purchases, cards, people } = useAppContext();

  const upcomingInstallments = useMemo(() => {
    const now = new Date();
    const currentMonth = getMonth(now);
    const currentYear = getYear(now);

    return purchases
      .flatMap(purchase => {
        const card = cards.find(c => c.id === purchase.cardId);
        return card ? calculateInstallments(purchase, card) : [];
      })
      .filter(installment => {
        const dueDate = new Date(installment.dueDate);
        return getMonth(dueDate) === currentMonth && getYear(dueDate) === currentYear;
      })
      .map(installment => {
        const person = people.find(p => p.id === installment.personId);
        return {
          ...installment,
          personName: person?.name || 'N/A',
        };
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [purchases, cards, people]);

  const emptyStateImage = PlaceHolderImages.find(img => img.id === 'empty-state-illustration');

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Parcelas a Vencer no Mês</CardTitle>
        <CardDescription>
          Estas são as parcelas com vencimento em {format(new Date(), 'MMMM', { locale: ptBR })}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingInstallments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pessoa</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Parcela</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingInstallments.map(installment => (
                <TableRow key={installment.id}>
                  <TableCell className="font-medium">{installment.personName}</TableCell>
                  <TableCell>{installment.store}</TableCell>
                  <TableCell>{`${installment.installmentNumber}/${installment.totalInstallments}`}</TableCell>
                  <TableCell className="text-right">{formatCurrency(installment.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-center py-10">
            {emptyStateImage && (
              <Image
                src={emptyStateImage.imageUrl}
                alt={emptyStateImage.description}
                width={300}
                height={225}
                className="rounded-lg"
                data-ai-hint={emptyStateImage.imageHint}
              />
            )}
            <h3 className="text-lg font-semibold">Tudo tranquilo por aqui!</h3>
            <p className="text-sm text-muted-foreground">Não há parcelas vencendo este mês.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
