
'use server';
/**
 * @fileOverview Um agente de IA que extrai informações de compras de texto em linguagem natural.
 * 
 * - extractPurchaseInfo - Uma função que lida com a extração de dados de um texto.
 * - ExtractPurchaseInfoInput - O tipo de entrada para a função extractPurchaseInfo.
 * - ExtractPurchaseInfoOutput - O tipo de retorno para a função extractPurchaseInfo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define o esquema para a entrada da IA (não exportado)
const ExtractPurchaseInfoInputSchema = z.object({
  text: z.string().describe('O texto em linguagem natural descrevendo a compra.'),
  people: z.array(z.object({ id: z.string(), name: z.string() })).describe('A lista de pessoas disponíveis para associar à compra.'),
  cards: z.array(z.object({ id: z.string(), name: z.string() })).describe('A lista de cartões de crédito disponíveis.'),
});
export type ExtractPurchaseInfoInput = z.infer<typeof ExtractPurchaseInfoInputSchema>;

// Define o esquema para a saída da IA (não exportado)
const ExtractPurchaseInfoOutputSchema = z.object({
  personId: z.string().optional().describe('O ID da pessoa que fez a compra, correspondendo à lista de pessoas fornecida.'),
  cardId: z.string().optional().describe('O ID do cartão de crédito usado, correspondendo à lista de cartões fornecida.'),
  store: z.string().optional().describe('O nome da loja onde a compra foi feita.'),
  totalAmount: z.number().optional().describe('O valor total da compra. Se múltiplos itens forem mencionados, este deve ser o total somado.'),
  installments: z.number().optional().describe('O número de parcelas da compra. O padrão é 1 se não for mencionado.'),
  items: z.string().optional().describe('Uma breve descrição dos itens comprados.'),
});
export type ExtractPurchaseInfoOutput = z.infer<typeof ExtractPurchaseInfoOutputSchema>;


/**
 * Função de invólucro que chama o fluxo da IA para extrair informações da compra.
 * @param input Os dados de entrada contendo o texto e as listas de pessoas/cartões.
 * @returns Uma promessa que resolve com as informações da compra extraídas.
 */
export async function extractPurchaseInfo(input: ExtractPurchaseInfoInput): Promise<ExtractPurchaseInfoOutput> {
  return extractPurchaseInfoFlow(input);
}


// Define o prompt da IA
const purchaseExtractorPrompt = ai.definePrompt({
    name: 'purchaseExtractorPrompt',
    input: { schema: ExtractPurchaseInfoInputSchema },
    output: { schema: ExtractPurchaseInfoOutputSchema },
    prompt: `Você é um assistente especialista em finanças. Sua tarefa é extrair informações de uma compra a partir de um texto e preencher os campos correspondentes.

Contexto Disponível:
- Lista de Pessoas: Você receberá uma lista de pessoas cadastradas ({{json people}}). Use o nome no texto para encontrar o 'personId' correto. Se o nome não corresponder a ninguém na lista, deixe o campo personId em branco.
- Lista de Cartões: Você receberá uma lista de cartões de crédito ({{json cards}}). Use o nome do cartão no texto para encontrar o 'cardId' correto. Se o nome do cartão não corresponder a nenhum na lista, deixe o campo cardId em branco.

Instruções:
1.  Analise o seguinte texto: {{{text}}}
2.  Identifique a pessoa. Associe ao 'personId' correspondente da lista fornecida.
3.  Identifique o cartão. Associe ao 'cardId' correspondente da lista fornecida.
4.  Identifique o nome da loja ('store').
5.  Calcule o valor total da compra ('totalAmount'). Se houver vários itens, some os valores.
6.  Identifique o número de parcelas ('installments'). Se não for mencionado, o valor padrão é 1.
7.  Descreva brevemente os itens comprados ('items').

Responda apenas com a estrutura de dados de saída solicitada.`,
});

// Define o fluxo da IA
const extractPurchaseInfoFlow = ai.defineFlow(
  {
    name: 'extractPurchaseInfoFlow',
    inputSchema: ExtractPurchaseInfoInputSchema,
    outputSchema: ExtractPurchaseInfoOutputSchema,
  },
  async (input) => {
    const { output } = await purchaseExtractorPrompt(input);
    return output!;
  }
);
    
