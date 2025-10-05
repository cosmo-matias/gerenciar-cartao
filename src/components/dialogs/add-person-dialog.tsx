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
import type { Person } from '@/lib/types';

const personSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres.' }),
  phoneNumber: z.string().min(10, { message: 'Telefone deve ter pelo menos 10 dígitos.' }),
});

type AddPersonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: Person;
};

export function AddPersonDialog({ open, onOpenChange, person }: AddPersonDialogProps) {
  const { addPerson, updatePerson } = useAppContext();
  const { toast } = useToast();
  const isEditMode = !!person;

  const form = useForm<z.infer<typeof personSchema>>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && person) {
        form.reset(person);
      } else {
        form.reset({ name: '', phoneNumber: '' });
      }
    }
  }, [person, isEditMode, form, open]);

  const onSubmit = (values: z.infer<typeof personSchema>) => {
    if(isEditMode && person) {
      updatePerson({ id: person.id, ...values });
      toast({
        title: "Sucesso!",
        description: "Pessoa atualizada com sucesso.",
      });
    } else {
      addPerson(values);
      toast({
        title: "Sucesso!",
        description: "Pessoa adicionada com sucesso.",
      });
    }
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Pessoa' : 'Adicionar Pessoa'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Atualize os dados da pessoa.' : 'Cadastre uma nova pessoa para associar às compras.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular</FormLabel>
                  <FormControl>
                    <Input placeholder="(99) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
