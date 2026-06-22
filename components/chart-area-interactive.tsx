"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  cantidad: {
    label: "Piezas",
    color: "#111111",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({
  data,
}: {
  data: { nombre: string; cantidad: number }[];
}) {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Inventario por producto</CardTitle>
        <CardDescription>
          Existencias actuales de cada referencia del catálogo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <BarChart data={data} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="nombre"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={24}
                tickFormatter={(value: string) =>
                  value.length > 16 ? `${value.slice(0, 16)}…` : value
                }
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <ChartTooltip
                cursor={{ fill: "#f3f4f6" }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar
                dataKey="cantidad"
                fill="var(--color-cantidad)"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Agrega productos para visualizar el inventario.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
