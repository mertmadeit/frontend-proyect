import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Infinity as InfinityIcon,
} from "lucide-react";
import sonyA7IV from "@/public/gear/sony-a7iv.jpg";

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-svh bg-[#f4f4f5] p-3 text-[#111827] sm:p-6 lg:p-8">
      <section className="mx-auto grid min-h-[calc(100svh-1.5rem)] max-w-[1180px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_18px_60px_-42px_rgba(0,0,0,0.35)] sm:min-h-[calc(100svh-3rem)] lg:min-h-[700px] lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden overflow-hidden bg-black p-8 text-white lg:flex lg:flex-col lg:p-10">
          <InfinityIcon
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 text-white/[0.035]"
            strokeWidth={0.4}
          />

          <Link href="/" className="relative z-10 flex w-fit items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black">
              <InfinityIcon className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span>
              <span className="block text-lg font-semibold leading-none tracking-[-0.04em]">
                Luminar
              </span>
              <span className="mt-1.5 block text-[9px] font-medium uppercase tracking-[0.18em] text-gray-500">
                Curaduría fotográfica
              </span>
            </span>
          </Link>

          <div className="relative z-10 mt-12 max-w-md">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              Acceso Luminar
            </p>
            <h1 className="mt-4 text-[clamp(2.4rem,4vw,4rem)] font-semibold leading-[0.98] tracking-[-0.06em]">
              Tu próxima historia comienza aquí.
            </h1>
            <p className="mt-5 max-w-sm leading-7 text-gray-400">
              Equipo seleccionado para creadores que buscan precisión, carácter
              y una imagen extraordinaria.
            </p>
          </div>

          <div className="relative z-10 mt-auto overflow-hidden rounded-xl border border-white/10 bg-[#f3f4f6]">
            <div className="absolute left-4 top-4 z-10 rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-black">
              Selección del editor
            </div>
            <div className="flex h-64 items-center justify-center p-7">
              <Image
                src={sonyA7IV}
                alt="Cámara profesional Sony Alpha 7 IV"
                className="h-full w-full object-contain mix-blend-multiply"
                sizes="(max-width: 1024px) 0px, 520px"
                priority
              />
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-5 py-3 text-black">
              <div>
                <p className="text-xs text-gray-500">Equipo destacado</p>
                <p className="mt-0.5 font-semibold tracking-[-0.02em]">
                  Sony Alpha 7 IV
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Disponible
              </span>
            </div>
          </div>
        </aside>

        <div className="flex min-h-full flex-col bg-white p-5 sm:p-8 lg:p-12">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-black lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
                <InfinityIcon className="h-5 w-5" strokeWidth={2.4} />
              </span>
              <span className="font-semibold tracking-[-0.04em]">Luminar</span>
            </Link>
            <Link
              href="/"
              className="ml-auto inline-flex items-center gap-2 text-xs font-medium text-gray-500 transition-colors hover:text-black"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver a la tienda
            </Link>
          </div>

          <div className="my-auto flex justify-center py-10">
            <div className="w-full max-w-md [&_[data-slot=card]]:rounded-none [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:shadow-none [&_[data-slot=card]]:ring-0 [&_[data-slot=card-content]]:px-0 [&_[data-slot=card-header]]:px-0">
              {children}
            </div>
          </div>

          <p className="text-center text-[11px] text-gray-400 lg:text-left">
            © 2026 Luminar · Precisión para cada historia.
          </p>
        </div>
      </section>
    </main>
  );
}
