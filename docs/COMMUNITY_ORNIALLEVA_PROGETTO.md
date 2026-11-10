# Community OrniAlleva — progetto per Sviluppo

Stato: PROGETTAZIONE, non attivato. Repository: OrniAlleva-Sviluppo. Nessuna modifica a Clienti.

## Blocco di sicurezza prima dell'implementazione
L'index.html del repository Sviluppo attualmente contiene SUPABASE_URL=https://mddsmqwfufzebahemxcn.supabase.co, corrispondente al progetto Supabase denominato OrniAlleva. Il secondo progetto disponibile, OrniAlleva-Test-Ospiti (pystaqeovjgbfmraaxnl), NON risulta configurato nell'index.html. Non creare tabelle o chat sul progetto OrniAlleva finché non è confermato l'ambiente di sviluppo e verificata la separazione degli utenti. Non cambiare semplicemente URL senza verificare che il database di test abbia lo schema e gli utenti necessari.

## Obiettivo
Una Community facoltativa per gli utenti autenticati: chat generale, stanze per specie, messaggi privati individuali, profili pubblici opt-in. Gli utenti ospiti non possono inviare messaggi. Nessun dato privato di allevamento è pubblicato automaticamente.

## Esperienza utente
- Nuova voce «Community» nella Home e nel menu, con indicatore dei messaggi non letti.
- Prima apertura: consenso e scelta nickname pubblico univoco; facoltativi nome allevamento, RNA, specie allevate e località generica; nessun indirizzo esatto o e-mail pubblica.
- Tre schede: Generale; Stanze (Canarini, Esotici, Psittacidi, Alimentazione, Riproduzione, Genetica); Privati.
- Messaggi: testo, data/ora, nome pubblico, stato invio, paginazione; allegati foto solo dopo moderazione, limiti dimensione e controlli MIME.
- Privati: avvio da profilo con consenso/richiesta chat, possibilità di bloccare e segnalare.
- Controlli: disattivazione Community, notifiche opt-in, elimina propri messaggi, segnalazioni e gestione moderatori.

## Schema proposto (da implementare esclusivamente nel DB di sviluppo confermato)
- community_profiles: user_id PK -> auth.users, nickname unique, display_name, aviary_name, species, region, visible, created_at.
- community_rooms: id, slug unique, title, category, active, created_at.
- community_conversations: id, created_at, created_by.
- community_conversation_members: conversation_id, user_id, accepted_at, last_read_at, unique(conversation_id,user_id).
- community_messages: id, author_id, room_id nullable, conversation_id nullable, body, created_at, edited_at, deleted_at; vincolo exactly-one-of(room_id,conversation_id).
- community_blocks: blocker_id, blocked_id, created_at; unique(blocker_id,blocked_id).
- community_reports: id, reporter_id, message_id, reason, status, created_at; lettura limitata ai moderatori.
- community_moderators: user_id, granted_by, created_at; autorizzazione gestita lato DB, non in user_metadata.

## Sicurezza
- RLS abilitata per tutte le tabelle esposte; invio solo se auth.uid() = author_id e utente non bloccato/sospeso.
- Stanze pubbliche ai soli utenti autenticati e iscritti alla Community; conversazioni private leggibili esclusivamente dai due membri accettati e da eventuali procedure di moderazione autorizzate.
- Membership privata: impedire inserimento arbitrario di membri e accesso alle chat altrui; proteggere UPDATE con USING e WITH CHECK.
- Realtime: canali privati autorizzati; niente broadcast pubblico per i messaggi privati. Storico persistito in Postgres; nessuna chiave service_role nel browser.
- Antispam: limiti messaggi per minuto, lunghezza, media, segnalazioni, sospensioni e rate-limit lato server.
- Privacy: informativa, policy conservazione/cancellazione, età minima e gestione delle richieste dati; non esporre e-mail o dati dei soggetti.

## Implementazione a fasi
1. Confermare DB di sviluppo e allineamento schema/auth; testare che non si tocchi Clienti.
2. Creare schema, indici, RLS e test di isolamento utenti (A/B/C), compreso utente bloccato.
3. Integrare UI direttamente nell'index.html originale, senza patch CSS esterne; Home/menu, profilo pubblico e chat generale.
4. Stanze per specie e moderazione.
5. Chat privata con richiesta accettazione, unread, blocco e report.
6. Realtime, riconnessione, paginazione, caricamento leggero on-demand; non caricare chat né librerie extra durante intro/Home.
7. Test su iPhone PWA e PC: permessi, rete lenta/offline, riconnessione, notifiche, XSS, immagini, carico, accessibilità; solo dopo valutare rilascio Clienti.

## Criteri di accettazione
- Utente A non legge messaggi privati di B/C, nemmeno tramite API dirette.
- Ospite non invia messaggi; utente non iscritto non legge contenuti riservati.
- La Community non rallenta intro/Home perché inizializzata soltanto quando aperta.
- Funzioni Soggetti/Coppie/Genetica continuano a funzionare.
- Nessun aggiornamento al repository Clienti o al DB Clienti senza approvazione separata.
