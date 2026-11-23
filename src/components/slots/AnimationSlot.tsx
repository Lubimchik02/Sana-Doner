// src/components/slots/AnimationSlot.tsx
// Универсальная рамка под анимации владельца (Lottie / GIF / видео).
// Пока children не передан — показывается прозрачная рамка-подсказка.
// Как только передадите children — рамка исчезнет, останется только ваша анимация.
"use client";

import type { ReactNode } from "react";
import { Film } from "lucide-react";

interface Props {
  label: string; // «Девочка», «Вертел», «Комбо»
  hint: string; // куда положить файл
  aspect?: string; // tailwind-класс пропорций
  className?: string;
  children?: ReactNode;
}

export default function AnimationSlot({
  label,
  hint,
  aspect = "aspect-square",
  className = "",
  children,
}: Props) {
  return (
    <div className={`relative w-full ${aspect} ${className}`}>
      {children ?? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-current/20 bg-white/30 p-4 text-center backdrop-blur-sm">
          <Film className="h-6 w-6 opacity-40" />
          <p className="text-sm font-semibold opacity-60">Слот: {label}</p>
          <p className="max-w-[14rem] text-[11px] leading-snug opacity-40">{hint}</p>
        </div>
      )}
    </div>
  );
}
