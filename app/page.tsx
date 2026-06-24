import Image from "next/image";
import Link from "next/link";
import cStand from "@/public/gear/c-stand.webp";
import mantispod from "@/public/gear/mantispod.jpg";
import rodeVideoMic from "@/public/gear/rode-videomic-ntg.webp";
import rodeWireless from "@/public/gear/rode-wireless-go.jpg";
import rolleiTripod from "@/public/gear/rollei-tripod.webp";
import sigma105 from "@/public/gear/sigma-105.jpg";
import sigma2470 from "@/public/gear/sigma-24-70.webp";
import sony1635 from "@/public/gear/sony16-35.jpg";
import sonyA7IV from "@/public/gear/sony-a7iv.jpg";
import sonyA7SIII from "@/public/gear/sony-a7s-mark-iii.jpg";
import {
  Camera,
  ShoppingCart,
  UserPlus,
  LogIn,
  Star,
  ShieldCheck,
  Truck,
  CreditCard,
  Aperture,
  Video,
  ArrowRight,
  CheckCircle2,
  Headphones,
  PackageCheck,
  Infinity as InfinityIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetchJson } from "@/lib/api";

const formatoPrecio = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const imagenesGear = [
  { imagen: sonyA7IV, alt: "Cámara Sony Alpha 7 IV" },
  { imagen: sonyA7SIII, alt: "Cámara Sony Alpha 7S III" },
  { imagen: sigma2470, alt: "Lente Sigma 24-70 mm" },
  { imagen: sony1635, alt: "Lente Sony 16-35 mm" },
  { imagen: sigma105, alt: "Lente Sigma 105 mm" },
  { imagen: rodeWireless, alt: "Micrófono RØDE Wireless GO II" },
  { imagen: rodeVideoMic, alt: "Micrófono RØDE VideoMic NTG" },
  { imagen: rolleiTripod, alt: "Trípode Rollei" },
  { imagen: mantispod, alt: "Trípode compacto Mantispod" },
  { imagen: cStand, alt: "Soporte profesional C-Stand" },
];

export default async function Home() {
  let productosBD: { id: number; nombre: string; precio: number; cantidad: number }[] = [];
  try {
    const data = await apiFetchJson<{ id: number; nombre: string; precio: number; cantidad: number }[]>("/productos");
    productosBD = data;
    productosBD.sort((a, b) => b.id - a.id);
  } catch {
    // API not available, use fallback data
  }

  const productos =
    productosBD.length > 0
      ? productosBD
      : [
          {
            id: 1,
            nombre: "Sony Alpha 7 IV",
            precio: 44999,
            cantidad: 8,
          },
          {
            id: 2,
            nombre: "Sony Alpha 7S III",
            precio: 67999,
            cantidad: 5,
          },
          {
            id: 3,
            nombre: "Sigma 24-70mm f/2.8 DG DN II",
            precio: 24999,
            cantidad: 10,
          },
          {
            id: 4,
            nombre: "Sony FE 16-35mm F2.8 GM",
            precio: 39999,
            cantidad: 15,
          },
        ];

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#111827]">
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-black shadow-sm transition-transform group-hover:scale-105">
              <InfinityIcon className="h-5 w-5" strokeWidth={2.4} />
            </div>

            <div>
              <h1 className="text-lg font-semibold leading-none tracking-[-0.04em]">Luminar</h1>
              <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-gray-500">
                Curaduría fotográfica
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex">
            <Link href="#inicio" className="relative py-2 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-black after:transition-transform hover:text-gray-500 hover:after:scale-x-100">
              Inicio
            </Link>
            <Link href="#categorias" className="relative py-2 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-black after:transition-transform hover:text-gray-500 hover:after:scale-x-100">
              Categorías
            </Link>
            <Link href="#productos" className="relative py-2 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-black after:transition-transform hover:text-gray-500 hover:after:scale-x-100">
              Productos
            </Link>
            <Link href="#beneficios" className="relative py-2 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-black after:transition-transform hover:text-gray-500 hover:after:scale-x-100">
              Beneficios
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="hidden h-9 rounded-md px-3 shadow-none sm:inline-flex"
              asChild
            >
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </Link>
            </Button>

            <Button
              size="sm"
              className="h-9 rounded-md px-3 shadow-sm sm:px-4"
              asChild
            >
              <Link href="/signup">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Registrarse</span>
                <span className="sm:hidden">Cuenta</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-center text-xs text-gray-600 sm:text-sm">
        <span className="inline-flex items-center gap-2 font-semibold">
          <Truck className="h-4 w-4" />
          Envío gratis en compras mayores a $5,000 MXN
        </span>
        <span className="mx-3 hidden text-gray-300 sm:inline">•</span>
        <span className="hidden text-gray-500 sm:inline">
          Compra protegida y garantía incluida
        </span>
      </section>

      <section
        id="inicio"
        className="relative max-w-none scroll-mt-24 overflow-hidden border-b border-gray-200 bg-white px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28"
      >
        <div className="mx-auto max-w-[1200px]">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="reveal-up mb-6 rounded-full border-0 bg-gray-100 px-3 py-1.5 text-xs font-medium text-black shadow-none">
            <Aperture className="mr-1 h-4 w-4" />
            Nueva colección 2026
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Badge>

          <h2 className="reveal-up-delay-1 mx-auto max-w-4xl text-[clamp(2.75rem,6vw,4rem)] font-bold leading-[1.04] tracking-[-0.055em] text-black">
            Equipo profesional para imágenes extraordinarias.
          </h2>

          <p className="reveal-up-delay-2 mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-xl">
            Encuentra cámaras DSLR, mirrorless, instantáneas, lentes y
            accesorios para fotografía, video y creación de contenido.
          </p>

          <div className="reveal-up-delay-3 mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12 rounded-md px-6 text-base shadow-sm" asChild>
              <Link href="#productos">
                Ver productos
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" className="h-12 rounded-md border-gray-300 bg-white px-6 text-base shadow-sm" asChild>
              <Link href="#categorias">Explorar categorías</Link>
            </Button>
          </div>

          <div className="reveal-up-delay-3 mx-auto mt-9 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-gray-500">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-black" />
              Compra protegida
            </span>
            <span className="inline-flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-black" />
              Envío asegurado
            </span>
            <span className="inline-flex items-center gap-2">
              <Headphones className="h-4 w-4 text-black" />
              Asesoría especializada
            </span>
          </div>
        </div>

        <div className="group/showcase reveal-up-delay-3 mt-16 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-md">
          <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 text-sm">
              <span className="rounded-md bg-white px-3 py-1.5 font-semibold text-black shadow-sm">
                Destacado
              </span>
              <span className="px-3 py-1.5 text-gray-500">Cámaras</span>
              <span className="px-3 py-1.5 text-gray-500">Lentes</span>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-gray-500">
              Selección del editor
            </span>
          </div>

          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative flex min-h-80 items-center justify-center border-b border-gray-200 bg-gray-50 p-8 lg:min-h-[430px] lg:border-b-0 lg:border-r">
              <span className="absolute left-5 top-5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold shadow-sm">
                Bestseller
              </span>
              <Image
                src={sonyA7IV}
                alt="Cámara profesional Sony Alpha 7 IV"
                className="animate-luminar-float h-full max-h-80 w-full object-contain mix-blend-multiply lg:max-h-96"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            </div>

            <div className="flex flex-col justify-center bg-white p-6 text-[#111827] sm:p-8 lg:p-10">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                Sony Alpha · Full Frame
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-black">
                Sony Alpha 7 IV
              </h3>
              <p className="mt-4 leading-7 text-gray-600">
                Rendimiento híbrido para fotografía y video profesional, con
                enfoque preciso y un cuerpo diseñado para trabajar todos los días.
              </p>

              <div className="mt-7 grid grid-cols-3 divide-x divide-gray-200 border-y border-gray-200 py-4 text-center">
                <div>
                  <p className="font-semibold text-black">Full frame</p>
                  <p className="mt-1 text-xs text-gray-500">Sensor</p>
                </div>
                <div>
                  <p className="font-semibold text-black">4K</p>
                  <p className="mt-1 text-xs text-gray-500">Video</p>
                </div>
                <div>
                  <p className="font-semibold text-black">Wi-Fi</p>
                  <p className="mt-1 text-xs text-gray-500">Conexión</p>
                </div>
              </div>

              <div className="mt-7 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Desde</p>
                  <p className="text-3xl font-semibold tracking-[-0.04em] text-black">
                    $44,999
                  </p>
                </div>
                <Badge className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-black shadow-none hover:bg-gray-100">
                  Disponible
                </Badge>
              </div>

              <Button className="mt-7 h-11 w-full rounded-md text-sm" asChild>
                <Link href="#productos">
                  Ver en el catálogo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section className="overflow-hidden border-b border-gray-200 bg-white px-4 py-7 sm:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5 sm:flex-row">
          <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            Equipo seleccionado de
          </p>
          <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="animate-luminar-marquee flex w-max items-center gap-12 pr-12 text-sm font-black tracking-[-0.02em] text-gray-400 sm:text-base">
              <span>SONY</span>
              <span>SIGMA</span>
              <span>RØDE</span>
              <span>ROLLEI</span>
              <span>SONY</span>
              <span>SIGMA</span>
              <span>RØDE</span>
              <span>ROLLEI</span>
            </div>
          </div>
        </div>
      </section>

      <section id="categorias" className="mx-auto max-w-[1200px] scroll-mt-24 px-4 py-20 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <Badge variant="outline" className="mb-3 rounded-md border-gray-200 bg-gray-50 font-mono text-[11px] uppercase tracking-wider text-gray-600">
              Categorías
            </Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Compra por categoría</h2>
            <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
              Elige el tipo de equipo que necesitas.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-0 transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md">
            <CardHeader>
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-black text-white transition-colors group-hover/card:bg-white group-hover/card:text-black">
                <Camera className="h-6 w-6" />
              </div>
              <CardTitle className="flex items-center justify-between">
                DSLR
                <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover/card:translate-x-1 group-hover/card:text-black" />
              </CardTitle>
              <CardDescription className="transition-colors group-hover/card:text-gray-400">
                Cámaras resistentes para fotografía profesional.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-0 transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md">
            <CardHeader>
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-black transition-colors group-hover/card:bg-white">
                <Aperture className="h-6 w-6" />
              </div>
              <CardTitle className="flex items-center justify-between">
                Mirrorless
                <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover/card:translate-x-1 group-hover/card:text-black" />
              </CardTitle>
              <CardDescription className="transition-colors group-hover/card:text-gray-400">
                Cámaras compactas con gran calidad de imagen.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-0 transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md">
            <CardHeader>
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-black transition-colors group-hover/card:bg-white">
                <Video className="h-6 w-6" />
              </div>
              <CardTitle className="flex items-center justify-between">
                Video
                <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover/card:translate-x-1 group-hover/card:text-black" />
              </CardTitle>
              <CardDescription className="transition-colors group-hover/card:text-gray-400">
                Equipo para grabación, streaming y contenido.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-0 transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md">
            <CardHeader>
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-black transition-colors group-hover/card:bg-white">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <CardTitle className="flex items-center justify-between">
                Accesorios
                <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover/card:translate-x-1 group-hover/card:text-black" />
              </CardTitle>
              <CardDescription className="transition-colors group-hover/card:text-gray-400">
                Trípodes, mochilas, memorias, baterías y más.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section id="productos" className="scroll-mt-24 border-y border-gray-200 bg-[#f9fafb] py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <Badge variant="outline" className="mb-3 rounded-md border-gray-200 bg-white font-mono text-[11px] uppercase tracking-wider text-gray-600">
              Tienda
            </Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Productos destacados</h2>
          </div>

        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {productos.map((producto, index) => (
            <Card
              key={producto.id}
              className="group h-full overflow-hidden rounded-xl border border-gray-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7f7f7_100%)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-0 transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md"
            >
              <div className="relative flex h-52 items-center justify-center overflow-hidden border-b border-gray-200 bg-white p-5">
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-100 to-transparent" />
                <Image
                  src={imagenesGear[index % imagenesGear.length].imagen}
                  alt={imagenesGear[index % imagenesGear.length].alt}
                  className="relative h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-1"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />
              </div>

              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="secondary" className="rounded-md bg-gray-100 font-mono text-[10px] uppercase text-gray-700">
                    {producto.cantidad > 0 ? "Disponible" : "Agotado"}
                  </Badge>

                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-black text-black" />
                    4.8
                  </div>
                </div>

                <CardTitle className="line-clamp-1">
                  {producto.nombre}
                </CardTitle>

                <CardDescription>
                  Equipo seleccionado para producción profesional y creación
                  de contenido.
                </CardDescription>
              </CardHeader>

              <CardContent className="mt-auto">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Precio</p>
                    <p className="text-2xl font-semibold tracking-[-0.04em]">
                      {formatoPrecio.format(producto.precio)}
                    </p>
                  </div>

                  <p className="rounded-full bg-muted px-3 py-1 text-sm">
                    {producto.cantidad} piezas
                  </p>
                </div>
              </CardContent>

            </Card>
          ))}
        </div>
        </div>
      </section>

      <section id="beneficios" className="scroll-mt-24 border-y border-gray-200 bg-[#f9fafb] px-4 py-20 text-[#111827] sm:px-6">
        <div className="mx-auto mb-10 max-w-[1200px] text-center">
          <Badge className="mb-4 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-black shadow-none hover:bg-white">
            Compra con confianza
          </Badge>
          <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
            Tu equipo merece el mejor respaldo.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-500">
            Una experiencia de compra clara, segura y acompañada por personas
            que conocen el equipo que venden.
          </p>
        </div>
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-3">
          <Card className="rounded-xl border border-gray-200 bg-white text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-0 transition-colors hover:bg-gray-50">
            <CardHeader>
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-black text-white">
                <Truck className="h-5 w-5" />
              </div>
              <CardTitle>Envíos seguros</CardTitle>
              <CardDescription className="leading-6 text-gray-500">
                Protegemos tu equipo fotográfico hasta que llegue a tu domicilio.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-xl border border-gray-200 bg-white text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-0 transition-colors hover:bg-gray-50">
            <CardHeader>
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-black text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle>Garantía incluida</CardTitle>
              <CardDescription className="leading-6 text-gray-500">
                Todos los productos cuentan con garantía por defecto de compra.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-xl border border-gray-200 bg-white text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-0 transition-colors hover:bg-gray-50">
            <CardHeader>
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-black text-white">
                <CreditCard className="h-5 w-5" />
              </div>
              <CardTitle>Pagos flexibles</CardTitle>
              <CardDescription className="leading-6 text-gray-500">
                Aceptamos pagos con tarjeta y promociones seleccionadas.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white px-4 py-8 text-gray-500 sm:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-5 text-sm md:flex-row">
          <Link href="/" className="flex items-center gap-2 text-black">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-black">
              <InfinityIcon className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <span className="font-bold">Luminar</span>
          </Link>

          <p>© 2026 Luminar. Precisión para cada historia.</p>

          <div className="flex gap-4">
            <Link href="#" className="transition-colors hover:text-black">Privacidad</Link>
            <Link href="#" className="transition-colors hover:text-black">Términos</Link>
            <Link href="#" className="transition-colors hover:text-black">Contacto</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
