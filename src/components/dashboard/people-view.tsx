
"use client";

import { useMemo } from 'react';
import { useAppContext } from '@/context/app-provider';
import { calculateInstallments, formatCurrency, cn } from '@/lib/utils';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Person } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';


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

  const peopleWithDetails = useMemo(() => {
    if (!isLoaded) return [];
    return people.map(person => {
      const personInstallments = allInstallments
        .filter(inst => inst.personId === person.id)
        .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        
      const totalOwed = personInstallments
        .filter(inst => !inst.isPaid)
        .reduce((sum, inst) => sum + inst.amount, 0);
        
      return { ...person, totalOwed, installments: personInstallments };
    });
  }, [people, allInstallments, isLoaded]);


  return (
    <div className={cn("mt-4", className)}>
       {!isLoaded ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
             <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
       ) : peopleWithDetails.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
            {peopleWithDetails.map(person => (
              <AccordionItem value={person.id} key={person.id}>
                <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                        <span className="font-medium">{person.name}</span>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{formatCurrency(person.totalOwed)}</span>
                             <AlertDialog>
                                <DropdownMenu onOpenChange={(open) => open && event?.stopPropagation()}>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                        <span className="sr-only">Abrir menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditPerson(person); }}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Editar
                                    </DropdownMenuItem>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-red-600" onClick={(e) => e.stopPropagation()}>
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
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                  {person.installments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Loja</TableHead>
                          <TableHead>Parcela</TableHead>
                          <TableHead>Vencimento</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {person.installments.map(inst => (
                          <TableRow key={inst.id} className={cn({'text-muted-foreground': inst.isPaid})}>
                            <TableCell className={cn({'line-through': inst.isPaid})}>{inst.store}</TableCell>
                            <TableCell className={cn({'line-through': inst.isPaid})}>{inst.installmentNumber}/{inst.totalInstallments}</TableCell>
                            <TableCell className={cn({'line-through': inst.isPaid})}>{format(new Date(inst.dueDate), 'dd/MM/yy', { locale: ptBR })}</TableCell>
                            <TableCell className={cn({'line-through': inst.isPaid})}>{formatCurrency(inst.amount)}</TableCell>
                            <TableCell>
                              <Badge variant={inst.isPaid ? 'secondary' : 'default'} className={cn({'bg-green-600 text-white': !inst.isPaid})}>
                                {inst.isPaid ? 'Pago' : 'Pendente'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      Nenhuma compra para esta pessoa.
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
       ) : (
        <div className="text-center py-10">
          <p>Nenhuma pessoa cadastrada.</p>
        </div>
       )}
    </div>
  );
}
