"use client";

import { Toaster as Sonner, toast, type ToasterProps } from "sonner";

import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";
// CSS puro: non viene processato da Tailwind, quindi gli stili
// sono sempre presenti nel bundle indipendentemente dall'uso dinamico.

import "./sonner.css";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      key="light-richColors"
      theme="light"
      icons={{
        success: (
          <CircleCheckIcon className="size-5 text-emerald-600 flex-shrink-0" />
        ),
        info: (
          <CircleCheckIcon className="size-5 text-emerald-600 flex-shrink-0" />
        ),
        warning: (
          <TriangleAlertIcon className="size-5 text-amber-600 flex-shrink-0" />
        ),
        error: <OctagonXIcon className="size-5 text-red-600 flex-shrink-0" />,
        loading: (
          <Loader2Icon className="size-5 animate-spin text-slate-500 flex-shrink-0" />
        ),
      }}
      {...props}
    />
  );
};

export { Toaster };
