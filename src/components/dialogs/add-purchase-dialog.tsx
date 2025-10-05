
"use client";

import { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppContext } from '@/context/app-provider';
import { useToast } from '@/components/ui/use-toast';
import type { Purchase } from '@/lib/types';
import { extractPurchaseInfo } from '@/ai/flows/extract-purchase-info-flow';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';


const purchaseSchema = z.object({
  personId: z.string({ required_error: 'Selecione uma pessoa.' }),
  cardId: z.string({ required_error: 'Selecione um cartão.' }),
  store: z.string().min(2, { message: 'Nome da loja deve ter pelo menos 2 caracteres.' }),
  items: z.string().min(2, { message: 'A descrição dos itens deve ter pelo menos 2 caracteres.' }),
  totalAmount: z.coerce.number().positive({ message: 'Valor deve ser positivo.' }),
  installments: z.coerce.number().int().min(1, { message: 'Mínimo de 1 parcela.' }),
  purchaseDate: z.date({ required_error: 'Selecione a data da compra.' }),
});

type AddPurchaseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase?: Purchase;
};

export function AddPurchaseDialog({ open, onOpenChange, purchase }: AddPurchaseDialogProps) {
  const { people, cards, addPurchase, updatePurchase } = useAppContext();
  const { toast } = useToast();
  const isEditMode = !!purchase;
  const [aiText, setAiText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const form = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      store: '',
      items: '',
      totalAmount: '' as any,
      installments: 1,
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && purchase) {
        form.reset({
          ...purchase,
          purchaseDate: new Date(purchase.purchaseDate),
        });
      } else {
        form.reset({
          personId: undefined,
          cardId: undefined,
          store: '',
          items: '',
          totalAmount: '' as any,
          installments: 1,
          purchaseDate: new Date(),
        });
      }
      setAiText(''); // Reset AI text field when dialog opens
    }
  }, [purchase, isEditMode, form, open]);


  const handleExtract = async () => {
    if (!aiText) {
      toast({
        variant: 'destructive',
        title: 'Texto vazio',
        description: 'Por favor, descreva a compra para usar a IA.',
      });
      return;
    }
    setIsExtracting(true);
    try {
      const availablePeople = people.map(({ id, name }) => ({ id, name }));
      const availableCards = cards.map(({ id, name }) => ({ id, name }));

      const result = await extractPurchaseInfo({
        text: aiText,
        people: availablePeople,
        cards: availableCards,
      });

      if (result.personId) form.setValue('personId', result.personId);
      if (result.cardId) form.setValue('cardId', result.cardId);
      if (result.store) form.setValue('store', result.store);
      if (result.totalAmount) form.setValue('totalAmount', result.totalAmount);
      if (result.installments) form.setValue('installments', result.installments);
      if (result.items) form.setValue('items', result.items);

      toast({
        title: 'Dados extraídos!',
        description: 'O formulário foi preenchido com as informações da sua descrição.',
      });

    } catch (error) {
      console.error('Error extracting purchase info:', error);
      toast({
        variant: 'destructive',
        title: 'Erro da IA',
        description: 'Não foi possível extrair as informações. Tente ser mais específico.',
      });
    } finally {
      setIsExtracting(false);
    }
  };


  const onSubmit = (values: z.infer<typeof purchaseSchema>) => {
    const purchaseData = {
      ...values,
      purchaseDate: values.purchaseDate.toISOString(),
    };

    if (isEditMode && purchase) {
      updatePurchase({ id: purchase.id, ...purchaseData });
       toast({
        title: "Sucesso!",
        description: "Compra atualizada com sucesso.",
      });
    } else {
      addPurchase(purchaseData);
      toast({
        title: "Sucesso!",
        description: "Compra adicionada com sucesso.",
      });
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Compra' : 'Adicionar Compra'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Atualize os dados da compra ou use a IA para preencher.' : 'Descreva a compra para a IA ou preencha os dados manualmente.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
            <Label htmlFor="ai-text">Assistente de Compras</Label>
            <Textarea
              id="ai-text"
              placeholder="Ex: Comprei 2 pizzas para a Maria por R$ 80, no crédito em 1x no Inter."
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
            />
            <Button onClick={handleExtract} disabled={isExtracting} size="sm" className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              {isExtracting ? 'Analisando...' : 'Preencher com IA'}
            </Button>
        </div>

        <div className="relative my-4">
          <Separator />
          <span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-background px-2 text-xs text-muted-foreground">
            OU
          </span>
        </div>


        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="personId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pessoa</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a pessoa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {people.map(person => (
                        <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="store"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loja</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da loja" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="items"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Itens Comprados</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Camisa, Calça, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="100.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parcelas</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cardId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cartão</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cartão" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cards.map(card => (
                          <SelectItem key={card.id} value={card.id}>{card.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2">
                    <FormLabel>Data da Compra</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: ptBR })
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
