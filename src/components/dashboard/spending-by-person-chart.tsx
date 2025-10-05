"use client"

import * as React from "react"
import { useMemo } from "react"
import { Pie, PieChart, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { useAppContext } from "@/context/app-provider"
import { calculateInstallments, formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function SpendingByPersonChart() {
  const { people, purchases, cards, isLoaded } = useAppContext()

  const chartData = useMemo(() => {
    if (!isLoaded) return [];

    const allInstallments = purchases.flatMap(purchase => {
      const card = cards.find(c => c.id === purchase.cardId);
      return card ? calculateInstallments(purchase, card) : [];
    });

    const data = people.map(person => {
      const totalOwed = allInstallments
        .filter(inst => inst.personId === person.id)
        .reduce((sum, inst) => sum + inst.amount, 0);
      return {
        name: person.name,
        totalOwed,
        fill: CHART_COLORS[people.indexOf(person) % CHART_COLORS.length]
      };
    }).filter(p => p.totalOwed > 0);

    return data;
  }, [people, purchases, cards, isLoaded])

  const chartConfig = useMemo(() => {
    const config: any = {};
    chartData.forEach(item => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      };
    });
    return config;
  }, [chartData]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Dívida por Pessoa</CardTitle>
        <CardDescription>Distribuição do valor total devido entre as pessoas.</CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoaded ? (
          <div className="flex justify-center items-center h-[250px]">
            <Skeleton className="h-full w-full" />
          </div>
        ) : chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(value as number)}
                    hideLabel
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="totalOwed"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
                paddingAngle={5}
              >
                 {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
               <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-mt-2"
              />
            </PieChart>
          </ChartContainer>
        ) : (
           <div className="flex flex-col items-center justify-center h-[250px] text-center">
            <h3 className="text-lg font-semibold">Sem dados para exibir</h3>
            <p className="text-sm text-muted-foreground">Adicione compras para ver o gráfico.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
