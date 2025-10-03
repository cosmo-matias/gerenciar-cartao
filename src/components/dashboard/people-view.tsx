"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/context/app-provider';
import { calculateInstallments, formatCurrency } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMonth, getYear, setMonth, setYear } from 'date-fns';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export function PeopleView({ className }: { className?: string }) {
  const { people, purchases, cards, isLoaded } = useAppContext();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const handleMonthChange = (monthValue: string) => {
    setSelectedDate(currentDate => setMonth(currentDate, parseInt(monthValue)));
  };

  const handleYearChange = (yearValue: string) => {
    setSelectedDate(currentDate => setYear(currentDate, parseInt(yearValue)));
  };

  const selectedPersonInstallments = useMemo(() => {
    if (!selectedPersonId || !isLoaded) return [];
    return allInstallments.filter(inst => {
      const instDate = new Date(inst.dueDate);
      return (
        inst.personId === selectedPersonId &&
        getMonth(instDate) === getMonth(selectedDate) &&
        getYear(instDate) === getYear(selectedDate)
      );
    });
  }, [selectedPersonId, allInstallments, selectedDate, isLoaded]);

  const selectedPersonTotalForMonth = selectedPersonInstallments.reduce((sum, inst) => sum + inst.amount, 0);

  const years = useMemo(() => {
    const allYears = allInstallments.map(inst => getYear(new Date(inst.dueDate)));
    return [...new Set(allYears)].sort((a, b) => a - b);
  }, [allInstallments]);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(setMonth(new Date(), i), 'MMMM', { locale: ptBR }),
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Pessoas</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="details">Detalhes por Pessoa</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Total Devido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isLoaded ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : peopleWithTotals.length > 0 ? (
                  peopleWithTotals.map(person => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">{person.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(person.totalOwed)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">Nenhuma pessoa cadastrada.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="details" className="mt-4">
            <div className="space-y-4">
              <div>
                <Select onValueChange={setSelectedPersonId} disabled={!isLoaded}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma pessoa" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map(person => (
                      <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedPersonId && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={getMonth(selectedDate).toString()} onValueChange={handleMonthChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Mês" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month.value} value={month.value.toString()}>{month.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={getYear(selectedDate).toString()} onValueChange={handleYearChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Loja</TableHead>
                            <TableHead>Parcela</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedPersonInstallments.length > 0 ? (
                            selectedPersonInstallments.map(inst => (
                              <TableRow key={inst.id}>
                                <TableCell>{inst.store}</TableCell>
                                <TableCell>{`${inst.installmentNumber}/${inst.totalInstallments}`}</TableCell>
                                <TableCell className="text-right">{formatCurrency(inst.amount)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="h-24 text-center">
                                Nenhuma parcela para esta pessoa neste mês.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={2}>Total</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(selectedPersonTotalForMonth)}</TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}