"use client";

import {
  Home,
  Sofa,
  Ruler,
  Zap,
  Droplets,
  PaintRoller,
  Hammer,
  Trees,
  Building2,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Home,
  Sofa,
  Ruler,
  Zap,
  Droplets,
  PaintRoller,
  Hammer,
  Trees,
  Building2,
  Wrench,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const Icon = (name && ICONS[name]) || Building2;
  return <Icon className={className} />;
}
