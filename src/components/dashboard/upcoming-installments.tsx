
"use client";

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppContext } from '@/context/app-provider';
import { calculateInstallments, formatCurrency, cn } from '@/lib/utils';
import { getMonth, getYear, format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const { purchases, cards, people, isLoaded, deletePurchase, toggleInstallmentPaidStatus } = useAppContext();
  const [displayedDate, setDisplayedDate] = useState(new Date());

  const handlePrevMonth = () => {
    setDisplayedDate(current => subMonths(current, 1));
  };

  const handleNextMonth = () => {
    setDisplayedDate(current => addMonths(current, 1));
  };


  const installmentsForMonth = useMemo(() => {
    if (!isLoaded) return [];
    const displayedMonth = getMonth(displayedDate);
    const displayedYear = getYear(displayedDate);

    return purchases
      .flatMap(purchase => {
        const card = cards.find(c => c.id === purchase.cardId);
        const allInstallments = card ? calculateInstallments(purchase, card) : [];
        return allInstallments.map(inst => ({...inst, originalPurchase: purchase}));
      })
      .filter(installment => {
        const dueDate = new Date(installment.dueDate);
        return getMonth(dueDate) === displayedMonth && getYear(dueDate) === displayedYear;
      })
      .map(installment => {
        const person = people.find(p => p.id === installment.personId);
        return {
          ...installment,
          personName: person?.name || 'N/A',
        };
      })
      .sort((a, b) => {
        if (a.isPaid !== b.isPaid) {
          return a.isPaid ? 1 : -1;
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      });
  }, [purchases, cards, people, isLoaded, displayedDate]);

  const emptyStateImage = PlaceHolderImages.find(img => img.id === 'empty-state-illustration');

  const findPurchaseById = (purchaseId: string) => {
    return purchases.find(p => p.id === purchaseId);
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>Parcelas a Vencer</CardTitle>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium capitalize w-28 text-center">
                    {format(displayedDate, 'MMMM', { locale: ptBR })}
                </span>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <CardDescription>
          Vencimentos em {format(displayedDate, 'MMMM \'de\' yyyy', { locale: ptBR })}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoaded ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
        ) : installmentsForMonth.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">Pago</TableHead>
                <TableHead>Pessoa</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Parcela</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installmentsForMonth.map(installment => (
                <TableRow key={installment.id} data-state={installment.isPaid ? "paid" : ""}>
                  <TableCell>
                      <Checkbox
                        checked={installment.isPaid}
                        onCheckedChange={(checked) => {
                            toggleInstallmentPaidStatus(installment.purchaseId, installment.installmentNumber, !!checked);
                        }}
                        aria-label="Marcar como pago"
                      />
                  </TableCell>
                  <TableCell className={cn("font-medium", { "line-through text-muted-foreground": installment.isPaid })}>{installment.personName}</TableCell>
                  <TableCell className={cn({ "line-through text-muted-foreground": installment.isPaid })}>{installment.store}</TableCell>
                  <TableCell className={cn({ "line-through text-muted-foreground": installment.isPaid })}>{`${installment.installmentNumber}/${installment.totalInstallments}`}</TableCell>
                  <TableCell className={cn({ "line-through text-muted-foreground": installment.isPaid })}>{formatCurrency(installment.amount)}</TableCell>
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
            <h3 className="text-lg font-semibold">Nenhuma parcela encontrada!</h3>
            <p className="text-sm text-muted-foreground">Não há parcelas vencendo neste mês.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
