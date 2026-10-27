# OrniBreed — Checklist tecnica Sviluppo (27 ottobre 2026)

## Regola permanente
- **Modificare soltanto** il repository `OrniBreed-Sviluppo`; `Il-Mio-Allevamento-` resta stabile.
- Modifiche funzionali nell'originale `index.html`: sostituire blocchi e funzioni, non sovrascrivere tramite CSS o wrapper/patch.
- Per ogni commit comunicare righe, blocchi prima/dopo, peso file e link commit.
- **Nessun rilascio produzione** finché test e approvazione non sono conclusi.
- Le notifiche agli utenti dipendono da `ob_app_releases` e dal canale `production`: non modificare adesso.

## Stato reale
- [x] Index DEV con caricamento video obbligatorio 30–50 s.
- [x] Vecchi blocchi Premium AI rimossi nelle funzioni originali.
- [x] Frontend richiama soltanto `ornibreed-ai-eval` e non il vecchio endpoint AI.
- [x] Coppie: controlli specie, razza, disponibilità, genitori, fratelli e fratellastri.
- [x] Coppie: confronto morfologico indicativo con valutazioni AI quando presenti.
- [x] Punteggio complessivo FOI lasciato N/V finché i criteri non sono verificati lato server.
- [x] Preparati su GitHub DEV `supabase/sql/ai_foto_video_5_gratis_DEV.sql` e `supabase/functions/ornibreed-ai-eval/index.ts`.
- [ ] Creare ambiente Supabase DEV isolato. Costo ramo comunicato: 0,01344/ora (valuta del preventivo), **non autorizzato**; nessuna creazione.
- [ ] Eseguire schema SQL su DEV, non su produzione; controllare RLS e quote.
- [ ] Configurare secret `GEMINI_API_KEY` in DEV senza inserirlo in HTML/GitHub.
- [ ] Distribuire Edge Function solo su DEV con autenticazione attiva.
- [ ] Verificare privacy/consenso e limiti del piano API gratuito con utenti reali prima di lancio.
- [ ] Test end-to-end su PC/iPhone: quota 5/5, reset giornaliero, due invii simultanei, video 29/30/50/51 s, 60 MB, accesso a soggetti altrui, errori/riaccredito.
- [ ] Test coppie con pedigree incompleto, fratelli interi, fratellastri, valutazioni assenti e criteri non valutabili.
- [ ] Verificare il comportamento di cronologia, valutazione salvata, pulsanti e notifica aggiornamenti.
- [ ] Completare il catalogo mutazioni e combinazioni nell'ordine: canarini, cardellini, fringillidi, pappagalli, esotici.
- [ ] Rilascio ufficiale solo dopo approvazione, con `ob_app_releases` e notifica.

## Stato dei dati
- 703 mutazioni in `ob_mutations` nell'ultima verifica.
- 802 denominazioni di combinazioni canarini create nei SQL 54–56; **non tutte certificate come ufficiali**.
- SQL 57 non ancora confermato come eseguito.
- Progetto Supabase esistente: `Il Mio Allevamento` (produzione condivisa), senza branch DEV.

## Blocchi sostituiti nell'index
- Valutazione: foto sola e vecchio endpoint → foto+video e quota gestita da Edge Function.
- Premium: rimossi wrapper attorno a `apriValutazioneAI`, `eseguiValutazioneAI`, `suggerisciCoppieAI`.
- Formazione coppie: filtro solo fratelli completi → filtro anche fratellastri; analisi morfologica indicativa basata su ultime valutazioni.
- Testi e punteggi: non chiamare 'ufficiale FOI' una valutazione non verificata.
- Flusso aggiornamenti rimasto invariato.
