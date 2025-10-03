"use client";

import { useMemo, useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { useAppContext } from '@/context/app-provider';
import { calculateInstallments, formatCurrency } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import type { Person } from '@/lib/types';


interface PeopleViewProps {
  className?: string;
  onEditPerson: (person: Person) => void;
}

export function PeopleView({ className, onEditPerson }: PeopleViewProps) {
  const { people, purchases, cards, isLoaded, deletePerson } = useAppContext();
  
  const allInstallments = useMemo(() => {
    if (!isLoaded) return [];
    return purchases.flatMap(purchase => {
      const card = cards.find(c => c.id === purchase.cardId);
      return card ? calculateInstallments(purchase, card) : [];
    });
  }, [purchases, cards, isLoaded]);

  const peopleWithTotals = useMemo(() => {
    if (!isLoaded) return [];
    return people.map(person => {
      const totalOwed = allInstallments
        .filter(inst => inst.personId === person.id)
        .reduce((sum, inst) => sum + inst.amount, 0);
      return { ...person, totalOwed };
    });
  }, [people, allInstallments, isLoaded]);


  return (
    <div className={className}>
      <TabsContent value="people" className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Total Devido</TableHead>
              <TableHead><span className="sr-only">Ações</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoaded ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : peopleWithTotals.length > 0 ? (
              peopleWithTotals.map(person => (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell>{formatCurrency(person.totalOwed)}</TableCell>
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
                          <DropdownMenuItem onClick={() => onEditPerson(person)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente a pessoa e todas as suas compras associadas.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deletePerson(person.id)} className="bg-red-600 hover:bg-red-700">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Nenhuma pessoa cadastrada.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TabsContent>
    </div>
  );
}
