"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/app-provider';
import { useToast } from '@/hooks/use-toast';
import type { Card } from '@/lib/types';

const cardSchema = z.object({
  name: z.string().min(2, { message: 'Nome do cartão deve ter pelo menos 2 caracteres.' }),
  flag: z.string().min(2, { message: 'Bandeira deve ter pelo menos 2 caracteres.' }),
  dueDate: z.coerce.number().int().min(1).max(31, { message: 'Dia deve ser entre 1 e 31.' }),
  closingDate: z.coerce.number().int().min(1).max(31, { message: 'Dia deve ser entre 1 e 31.' }),
});

type AddCardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: Card;
};

export function AddCardDialog({ open, onOpenChange, card }: AddCardDialogProps) {
  const { addCard, updateCard } = useAppContext();
  const { toast } = useToast();
  const isEditMode = !!card;

  const form = useForm<z.infer<typeof cardSchema>>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      name: '',
      flag: '',
      dueDate: '' as any,
      closingDate: '' as any,
    },
  });

  useEffect(() => {
    if (isEditMode) {
      form.reset(card);
    } else {
      form.reset({
        name: '',
        flag: '',
        dueDate: '' as any,
        closingDate: '' as any,
      });
    }
  }, [card, isEditMode, form, open]);


  const onSubmit = (values: z.infer<typeof cardSchema>) => {
    if(isEditMode) {
      updateCard({ id: card.id, ...values });
      toast({
        title: "Sucesso!",
        description: "Cartão atualizado com sucesso.",
      });
    } else {
      addCard(values);
      toast({
        title: "Sucesso!",
        description: "Cartão adicionado com sucesso.",
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Cartão' : 'Adicionar Cartão'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Atualize os dados do cartão de crédito.' : 'Preencha os dados do novo cartão de crédito.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cartão</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cartão Principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="flag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bandeira</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Visa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia do Vencimento</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="closingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia do Fechamento</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
