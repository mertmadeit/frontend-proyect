import {
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  PackageCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards({
  totalProductos,
  totalUnidades,
  valorInventario,
  productosBajoStock,
}: {
  totalProductos: number;
  totalUnidades: number;
  valorInventario: string;
  productosBajoStock: number;
}) {
  const cards = [
    {
      label: "Productos activos",
      value: totalProductos.toLocaleString("es-MX"),
      detail: "Referencias disponibles en el catálogo",
      badge: "Catálogo",
      icon: PackageCheck,
    },
    {
      label: "Unidades en inventario",
      value: totalUnidades.toLocaleString("es-MX"),
      detail: "Existencias acumuladas en la tienda",
      badge: "Stock",
      icon: Boxes,
    },
    {
      label: "Valor del inventario",
      value: valorInventario,
      detail: "Precio de venta por existencias actuales",
      badge: "MXN",
      icon: CircleDollarSign,
    },
    {
      label: "Stock por atender",
      value: productosBajoStock.toLocaleString("es-MX"),
      detail:
        productosBajoStock === 1
          ? "Producto con 5 piezas o menos"
          : "Productos con 5 piezas o menos",
      badge: productosBajoStock > 0 ? "Revisar" : "En orden",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.label}
            className="@container/card bg-gradient-to-b from-white to-gray-50 shadow-xs"
          >
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tracking-[-0.04em] tabular-nums @[250px]/card:text-3xl">
                {card.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline" className="bg-white">
                  <Icon className="size-3.5" />
                  {card.badge}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              {card.detail}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
