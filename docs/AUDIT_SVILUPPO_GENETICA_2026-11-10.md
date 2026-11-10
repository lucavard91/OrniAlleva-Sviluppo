# Audit ambiente Sviluppo e genetica — 10 novembre 2026

## Risultati verificati (lettura, nessuna modifica ai database)
- GitHub Sviluppo index.html usa URL Supabase `mddsmqwfufzebahemxcn` (progetto OrniAlleva, ambiente Clienti).
- Progetto Supabase destinato ai test: `pystaqeovjgbfmraaxnl` (OrniAlleva-Test-Ospiti).
- Test ha soltanto le tabelle di base ob_taxa, ob_breeds, ob_mutations, ob_genetic_rules, ob_sources, ob_allelic_loci, ob_allelic_locus_mutations e tabelle ospiti. Clienti contiene anche numerose tabelle operative e viste genetiche.
- Non modificare l'URL dell'index prima di migrare/validare schema, RLS, dati test e autenticazione: si rischia di rompere login e sezioni dell'app.

## Varianti numerate osservate nel database Test
- Agapornis fischeri: Blu 1 e Blu 2 — PARTIAL.
- Agapornis nigrigenis: Blu 1 e Blu 2 — PARTIAL.
- Kakariki di Forbes: Blu 1 e Blu 2 — PARTIAL.
- Kakariki fronte rossa: Blu 1 e Blu 2 — PARTIAL.
- Parrocchetto monaco: Blu 1 e Blu 2 — PARTIAL.
- Ondulato di colore: Faccia Gialla Tipo 1 e Tipo 2 — PARTIAL, inheritance_mode non valorizzata.
- Agapornis roseicollis: Violet Tipo 2 — VERIFIED nel campo stato mutazione; la singola regola va comunque verificata indipendentemente.

## Criteri genetici
- Non assimilare i tipi numerati di specie diverse.
- Mosaico tipo 1/2 nei canarini: descrizioni fenotipiche linea femminile/maschile, non trattare automaticamente come due alleli indipendenti.
- Blu 1/2: nomenclatura specifica della specie, da documentare prima di usare per calcolo accoppiamenti.
- Distinguere stato della mutazione, stato della regola, evidenza e sicurezza del motore.

## Prossime operazioni
1. Confrontare schemi e permessi; predisporre migrazione di sviluppo senza dati personali clienti.
2. Verificare login, profili e principali sezioni su Test prima di cambiare endpoint.
3. Continuare audit delle varianti numerate e loro fonti; inserire spiegazioni solo se supportate.
4. Implementare Community soltanto sul DB Test dopo isolamento confermato.
5. Non modificare GitHub Clienti né Supabase Clienti.
