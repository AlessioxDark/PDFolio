📱 PDFOLIO — Documents And Notes Manager

Live Demo: pd-folio.kappa.vercel.app  ·  Ottimizzata per mobile
🎯 Il Problema che risolve

PDFolio is a web platform for managing, organizing, and intelligently annotating PDF documents. The application allows users to structure their files into personal folders, add contextual notes, and interact with an integrated AI assistant to analyze, summarize, or simplify extracted text.
✨ Funzionalità Chiave

FeatureDescrizione📅 Creazione EventiTitolo, data, luogo, immagine di copertina e dettagli personalizzabili✅ RSVP Real-timePartecipanti, assenti e indecisi aggiornati istantaneamente per tutti💬 Chat di GruppoMessaggistica integrata via WebSocket all'interno di ogni gruppo👥 Gestione GruppiCreazione, personalizzazione e gestione dei membri del gruppo🤝 Sistema AmicizieInvio, accettazione e annullamento di richieste di amicizia⭐ Karma SystemPunteggio di gamification calcolato algoritmicamente sulla partecipazione🕵️ Modalità OspiteGuest Session con dati reali temporanei — nessuna registrazione richiesta📱 Mobile-FirstUI progettata per smartphone, con redirect di cortesia per desktop
🛠️ Stack Tecnologico

Frontend Backend Database & Auth Deploy
───────── ────────── ─────────────── ──────
React + Vite Node.js Supabase Vercel
TypeScript Express.js PostgreSQL
TailwindCSS REST API JWT Auth
React Context WebSocket (WS)

Scelte Architetturali

React Context API — Gestione dello stato globale attraverso context dedicati (AuthContext, SocketContext, ChatContext, FriendsContext, ...) senza librerie esterne di state management.
WebSocket nativo (ws) — Canale real-time per messaggi e notifiche, con gestione degli handler separata dalla logica di routing.
Supabase — Utilizzato sia come database PostgreSQL che come layer di autenticazione (JWT), delegando la gestione delle sessioni utente.
Middleware di autenticazione centralizzato — Tutti i route protetti passano per un authMiddleware che verifica il JWT, evitando duplicazione della logica auth tra controller e model.
Architettura MVC — Backend strutturato in controllers, models, routes e handlers per separare chiaramente le responsabilità.
🚀 Sfide Affrontate

1. Sincronizzazione Real-time

La sfida più complessa è stata mantenere lo stato coerente tra database e WebSocket. Ogni azione dell'utente (RSVP, messaggio, richiesta di amicizia) deve aggiornarsi istantaneamente sullo schermo di tutti gli utenti connessi. Ho risolto strutturando un sistema di eventi WebSocket tipizzati con handler dedicati lato server. 2. Architettura del Frontend

Con oltre 10 context React interagenti, ho imparato a isolare le responsabilità: ogni context gestisce un dominio specifico (autenticazione, socket, chat, notifiche, profilo...) per evitare re-render inutili e rendere il codice manutenibile. 3. Guest Session

Implementare una modalità ospite con dati reali ma temporanei ha richiesto di ripensare il flusso di autenticazione: l'utente guest ottiene un token valido, accede a dati di demo pre-popolati e, al logout, tutto viene pulito senza lasciare tracce nel database. 4. UX Mobile-First

Progettare esclusivamente per mobile ha significato prendere decisioni nette sul layout, la navigazione e le interazioni tattili. Ho scelto di bloccare l'accesso da desktop con una schermata di redirect, mantenendo l'esperienza coerente e intenzionale.
📁 Struttura del Progetto

hangie-web/
├── backend/
│ ├── controllers/ # Logica di business (auth, events, group)
│ ├── models/ # Query al database Supabase
│ ├── routes/ # Definizione degli endpoint REST
│ ├── handlers/ # Handlers WebSocket
│ ├── middlewares/ # Auth middleware JWT
│ └── server.js # Entry point, setup Express + WS
│
└── frontend/hangie-frontend/
└── src/
├── app/ # Pagine dell'applicazione
├── components/ # Componenti UI riutilizzabili
├── contexts/ # State management (10+ context)
├── features/ # Componenti specifici per funzionalità
├── hooks/ # Custom hooks
├── services/ # Chiamate API

🧪 Come Testare l'App

Visita hangie.vercel.app da smartphone (o DevTools mobile)
Clicca "Entra come ospite" per accedere senza registrazione
Esplora la dashboard, vota gli eventi, apri la chat di gruppo
📖 Contesto

Questo è il mio primo progetto full-stack completo, iniziato ad ottobre 2025. L'obiettivo era costruire qualcosa di reale da zero — non un tutorial, ma un'app con un problema concreto da risolvere — affrontando le complessità di un'architettura client-server, autenticazione, real-time e deployment in produzione.
Realizzato con impegno da Alessio Quaranta — alessio40aq@gmail.com
