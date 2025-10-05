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
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Purchase } from '@/lib/types';


interface UpcomingInstallmentsProps {
  className?: string;
  onEdit: (purchase: Purchase) => void;
}

export function UpcomingInstallments({ className, onEdit }: UpcomingInstallmentsProps) {
  const { purchases, cards, people, isLoaded, deletePurchase } = useAppContext();

  const upcomingInstallments = useMemo(() => {
    if (!isLoaded) return [];
    const now = new Date();
    const currentMonth = getMonth(now);
    const currentYear = getYear(now);

    return purchases
      .flatMap(purchase => {
        const card = cards.find(c => c.id === purchase.cardId);
        const allInstallments = card ? calculateInstallments(purchase, card) : [];
        return allInstallments.map(inst => ({...inst, originalPurchase: purchase}));
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
  }, [purchases, cards, people, isLoaded]);

  const emptyStateImage = PlaceHolderImages.find(img => img.id === 'empty-state-illustration');

  const findPurchaseById = (purchaseId: string) => {
    return purchases.find(p => p.id === purchaseId);
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Parcelas a Vencer no Mês</CardTitle>
        <CardDescription>
          Vencimentos em {format(new Date(), 'MMMM', { locale: ptBR })}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoaded ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
        ) : upcomingInstallments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pessoa</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Parcela</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingInstallments.map(installment => (
                <TableRow key={installment.id}>
                  <TableCell className="font-medium">{installment.personName}</TableCell>
                  <TableCell>{installment.store}</TableCell>
                  <TableCell>{`${installment.installmentNumber}/${installment.totalInstallments}`}</TableCell>
                  <TableCell>{formatCurrency(installment.amount)}</TableCell>
                   <TableCell className="text-right">
                       <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              const purchase = findPurchaseById(installment.purchaseId);
                              if(purchase) onEdit(purchase);
                            }}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar Compra
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir Compra
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação não pode ser desfeita. Isso excluirá permanentemente a compra e todas as suas parcelas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deletePurchase(installment.purchaseId)} className="bg-red-600 hover:bg-red-700">
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-center py-10 h-[250px]">
            {emptyStateImage && (
              <Image
                src={emptyStateImage.imageUrl}
                alt={emptyStateImage.description}
                width={200}
                height={150}
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
