📱 PDFOLIO — Documents And Notes Manager

> **Live Demo:** [pd-folio.kappa.vercel.app](https://pd-folio.kappa.vercel.app) &nbsp;·&nbsp;

---

## 🎯 Il Problema che risolve

PDFOLIO aiuta studenti, lavoratori e chiunque debba gestire una quantità elevata di documenti in formato PDF, a organizzarli, ritrovarli e approfondirli con estrema facilità. Permette di archiviare i PDF in modo ordinato, prendere appunti direttamente sui file, ritrovare facilmente i documenti grazie alla ricerca avanzata e all'uso di tag, e ricevere suggerimenti intelligenti su come migliorare la gestione dei propri file. Inoltre, PDFOLIO offre funzionalità avanzate per migliorare l'esperienza di apprendimento, come la possibilità di inserire note, evidenziare testi, creare riassunti automatici, tradurre contenuti e semplificare passaggi complessi. Il tutto è racchiuso in un'interfaccia moderna e user-friendly, ottimizzata per mobile ma accessibile anche da desktop.

---

## ✨ Funzionalità Chiave

| Feature                             | Descrizione                                                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| 📅 **Upload Documenti con OCR**     | Caricamento di file PDF con estrazione automatica e indicizzazione del testo tramite OCR. |
| ✅ **Note ed Evidenziazioni**       | Sistema di annotazione e formattazione contestuale sui singoli documenti per lo studio.   |
| 💬 **Chat AI Contestuale**          | Assistente AI integrato che utilizza il documento attivo come contesto per rispondere.    |
| 🧠 **Generazione Note e Riassunti** | Estrazione automatica di riassunti, concetti chiave e spiegazioni avanzate tramite AI.    |
| 🕵️ **Ricerca Avanzata con AI**      | Ricerca globale e locale per trovare qualsiasi informazione di cui tu abbia bisogno.      |
| 🔒 **Area Personale Protetta**      | Isolamento totale dei dati utente tramite politiche di sicurezza granulari sul database.  |

---

## 🛠️ Stack Tecnologico

```
Frontend          Backend           Database & Auth    Deploy
─────────         ──────────        ───────────────    ──────
React + Vite      Node.js           Supabase           Vercel
TypeScript        Express.js        PostgreSQL
TailwindCSS       REST API          JWT Auth
React Context     WebSocket (WS)
```

### Scelte Architetturali

- **React Context API** — Gestione dello stato globale attraverso context dedicati (`AuthContext`, `SocketContext`, `ChatContext`, `FriendsContext`, ...) senza librerie esterne di state management.
- **AI Orchestrator**: gestione tre stati per ogni ai per gestire il traffico messaggi
- **Supabase** — Utilizzato sia come database PostgreSQL che come layer di autenticazione (JWT), delegando la gestione delle sessioni utente.
- **Middleware di autenticazione centralizzato** — Tutti i route protetti passano per un `authMiddleware` che verifica il JWT, evitando duplicazione della logica auth tra controller e model.
- **Architettura MVC** — Backend strutturato in `controllers`, `models`, `routes` per separare chiaramente le responsabilità.

## 🚀 Sfide Affrontate

### 1. Formattazione dell'Output AI (XML e Markdown)

Ricevere risposte strutturate dai modelli linguistici (LLM) per integrarle nativamente nell'interfaccia non è banale. Ho risolto strutturando un sistema di prompt engineering avanzato che costringe l'AI a rispondere combinando tag XML (per i metadati) e sintassi Markdown (per il testo formattato), processando poi l'output in tempo reale nel frontend.

## 2. Ricerca Semantica Avanzata con LLM

La ricerca di testo semplice non è sufficiente per contesti complessi o termini specifici. Ho implementato un sistema di ricerca avanzata che sfrutta la potenza semantica degli LLM. Utilizzando un database vettoriale (tramite estensioni SQL) e modelli di embedding, l'applicazione non cerca solo parole chiave, ma comprende il significato del contesto richiesto, restituendo risultati molto più pertinenti e accurati rispetto ai motori di ricerca tradizionali.

## 3. Gestione degli Stati dell'AI

Interagire con sistemi di Intelligenza Artificiale comporta il rischio di errori, timeout o risposte incoerenti. Per garantire un'esperienza utente fluida, ho implementato un "AI Orchestrator" che gestisce tre stati distinti (attivo, in attesa, in errore) per ogni interazione AI. Questo permette all'applicazione di gestire gracefully qualsiasi imprevisto, mantenendo l'interfaccia reattiva e fornendo feedback chiari all'utente.

## 📁 Struttura del Progetto

```

pdfolio/
├── backend/
│ ├── controllers/ # Logica di business (auth, events, group)
│ ├── models/ # Query al database Supabase
│ ├── routes/ # Definizione degli endpoint REST
│ ├── orchestrator/ # Definizione degli orchestrator
│ ├── middlewares/ # Auth middleware JWT
│ └── server.js # Entry point, setup Express + WS
│
└── frontend/pdfolio/
└── src/
├── app/ # Pagine dell'applicazione
├── components/ # Componenti UI riutilizzabili
├── contexts/ # State management (10+ context)
├── features/ # Componenti specifici per funzionalità
├── hooks/ # Custom hooks
├── services/ # Chiamate API
```

## 🧪 Come Testare l'App

Visita pd-folio.kappa.vercel.app,
Crea un account e inizia a testare l'app

---

_Realizzato con impegno da **Alessio Quaranta** — [alessio40aq@gmail.com](mailto:alessio40aq@gmail.com)_
