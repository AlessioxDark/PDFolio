import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Qualcosa è andato storto",
  message = "Si è verificato un errore inaspettato. Per favore, riprova o torna alla pagina precedente.",
  onRetry,
  onGoBack,
}) => {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-6 text-center ">
      {/* Icona di Errore con effetto Glow */}
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
        <AlertCircle className="h-10 w-10 text-red-500 dark:text-red-400" />
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-10 dark:bg-red-500"></span>
      </div>

      {/* Titolo e Messaggio */}
      <h2 className="font-inter text-xl font-bold tracking-tight text-neutral-900 dark:text-zinc-50 sm:text-2xl">
        {title}
      </h2>
      <p className="mt-2 max-w-md font-inter text-sm leading-relaxed text-neutral-500 dark:text-zinc-400">
        {message}
      </p>

      {/* Azioni di Ripristino (Buttons) */}
      {(onRetry || onGoBack) && (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:bg-purple-600 dark:hover:bg-purple-700 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4" />
              Riprova
            </button>
          )}

          {onGoBack && (
            <button
              onClick={onGoBack}
              className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all duration-200"
            >
              <Home className="h-4 w-4" />
              Torna alla Home
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorState;
