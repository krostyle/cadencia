"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart2, Target, Plus, Dumbbell, History, ChevronLeft, ChevronRight, X } from "lucide-react";

interface Slide {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  body: React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    icon: <BarChart2 size={28} />,
    iconBg: "bg-primary/10 text-primary",
    title: "Inicio — tu semana",
    body: (
      <div className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p>
          Muestra el progreso de todas tus cuotas activas durante la semana actual
          (lunes a domingo).
        </p>
        <p>
          Cada tarjeta tiene una barra de progreso y el contador{" "}
          <span className="font-semibold text-foreground">puntos actuales / objetivo</span>.
          Cuando el número se pone verde, la cuota está cumplida para esa semana.
        </p>
        <div className="rounded-xl border bg-card p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
              <span className="font-medium text-foreground">Conexión</span>
            </div>
            <span className="font-semibold text-green-600">4/4</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-full rounded-full bg-green-500" />
          </div>
          <p className="text-xs text-green-600 font-medium">¡Cuota cumplida!</p>
        </div>
      </div>
    ),
  },
  {
    icon: <Target size={28} />,
    iconBg: "bg-rose-100 text-rose-600",
    title: "Cuotas",
    body: (
      <div className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p>
          Una cuota es el hábito o área que quieres sostener. Le das un nombre y defines
          cuántos <span className="font-semibold text-foreground">puntos</span> quieres acumular por semana.
        </p>
        <p>
          No importa en qué días lo hagas — solo que llegues al número antes del domingo.
          Un día difícil no rompe la semana.
        </p>
        <div className="rounded-xl border bg-card p-3 flex flex-col gap-1">
          <p className="text-xs font-medium text-foreground">Botones de cada cuota</p>
          <ul className="text-xs space-y-1 mt-1">
            <li>✏️ <span className="font-medium text-foreground">Editar</span> — cambia nombre, objetivo o actividades vinculadas</li>
            <li>📦 <span className="font-medium text-foreground">Archivar</span> — la oculta sin borrar su historial</li>
            <li>🗑️ <span className="font-medium text-foreground">Eliminar</span> — la borra permanentemente</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    icon: <Plus size={28} />,
    iconBg: "bg-primary text-primary-foreground",
    title: "Botón + — Registrar",
    body: (
      <div className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p>
          El botón circular del centro es para registrar que hiciste una actividad.
          Es el corazón de la app — úsalo cada vez que completes algo.
        </p>
        <div className="rounded-xl border bg-card p-3 flex flex-col gap-2">
          <p className="text-xs font-medium text-foreground">Cómo funciona</p>
          <ol className="text-xs space-y-1.5 mt-1 list-decimal list-inside">
            <li>Elige la actividad que hiciste</li>
            <li>Confirma la fecha (por defecto hoy, pero puedes cambiarla)</li>
            <li>Toca <span className="font-semibold text-foreground">Registrar</span></li>
          </ol>
        </div>
        <p>
          Ese registro suma los puntos de la actividad a la cuota correspondiente de esa semana.
        </p>
      </div>
    ),
  },
  {
    icon: <Dumbbell size={28} />,
    iconBg: "bg-teal-100 text-teal-600",
    title: "Actividades",
    body: (
      <div className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p>
          Las actividades son las cosas concretas que haces. Cada una tiene un{" "}
          <span className="font-semibold text-foreground">peso</span> según el esfuerzo que requiere.
        </p>
        <div className="rounded-xl border bg-card p-3 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span>Liviana</span>
            <span className="font-semibold text-foreground">1 punto</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Media</span>
            <span className="font-semibold text-foreground">2 puntos</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Intensa</span>
            <span className="font-semibold text-foreground">3 puntos</span>
          </div>
        </div>
        <p>
          Vinculas cada actividad a una o más cuotas, y cada vez que la registras, sus puntos
          suman al contador de esa cuota en la semana.
        </p>
        <p className="text-xs">
          Puedes archivar actividades que ya no usas — desaparecen del registro pero no se pierden datos.
        </p>
      </div>
    ),
  },
  {
    icon: <History size={28} />,
    iconBg: "bg-amber-100 text-amber-600",
    title: "Historial y racha",
    body: (
      <div className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p>
          La <span className="font-semibold text-foreground">racha</span> cuenta cuántas semanas
          consecutivas cerraste con todas tus cuotas cumplidas.
        </p>
        <p>
          La semana actual no cuenta — solo las semanas ya cerradas (pasadas). Así la racha
          refleja logros reales, no potenciales.
        </p>
        <div className="rounded-xl border bg-card p-3 text-xs space-y-1.5">
          <p className="font-medium text-foreground">Debajo de la racha</p>
          <p>
            Un registro de las últimas 26 semanas — cada fila muestra si esa semana fue{" "}
            <span className="text-green-600 font-medium">✓ completa</span> o{" "}
            <span className="text-destructive font-medium">✗ incompleta</span>.
          </p>
        </div>
      </div>
    ),
  },
];

interface HelpTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpTour({ open, onOpenChange }: HelpTourProps) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isFirst = index === 0;
  const isLast = index === SLIDES.length - 1;

  function handleOpenChange(v: boolean) {
    if (!v) setIndex(0);
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden">
        {/* Header con icono */}
        <div className={`${slide.iconBg} flex items-center justify-center py-8`}>
          {slide.icon}
        </div>

        <div className="p-5 flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="text-lg">{slide.title}</DialogTitle>
          </DialogHeader>

          <div className="min-h-[180px]">{slide.body}</div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`rounded-full transition-all ${
                  i === index
                    ? "w-4 h-2 bg-primary"
                    : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Navegación */}
          <div className="flex gap-2">
            {!isFirst && (
              <Button
                variant="outline"
                className="flex-1 gap-1"
                onClick={() => setIndex((i) => i - 1)}
              >
                <ChevronLeft size={16} />
                Anterior
              </Button>
            )}
            {!isLast ? (
              <Button
                className="flex-1 gap-1"
                onClick={() => setIndex((i) => i + 1)}
              >
                Siguiente
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button className="flex-1" onClick={() => handleOpenChange(false)}>
                Entendido
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
