CREATE OR REPLACE VIEW public.ob_global_verified_genetic_rules WITH (security_invoker=true) AS  SELECT g.id AS genetic_rule_id,
    g.taxon_id,
    m.name AS mutation_name,
    g.mutation_id,
    g.inheritance_mode,
    g.sex_linked,
    g.dominance,
    g.lethal,
    g.source_id,
        CASE
            WHEN g.status <> 'VERIFIED'::text THEN 'NOT_VERIFIED'::text
            WHEN g.source_id IS NULL THEN 'SOURCE_REQUIRED'::text
            WHEN COALESCE(g.carrier_inference_from_photo, false) THEN 'PHOTO_INFERENCE_BLOCKED'::text
            WHEN g.inheritance_mode = 'SEX_LINKED_COMBINATION' AND m.name = 'Isabella' AND EXISTS (SELECT 1 FROM public.ob_taxa t WHERE t.id=m.taxon_id AND t.scientific_name='Serinus canaria domestica') AND g.metadata->>'runtime_model' = 'CANARY_BRUNO_AGATA_NO_DOUBLE_HET_V1' AND g.metadata->>'verified_rule_end_to_end_tested' = 'true' AND m.metadata->>'specific_runtime_tested' = 'true' THEN 'READY'::text
            WHEN lower(COALESCE(m.metadata ->> 'specific_engine_required'::text, 'false'::text)) = 'true'::text THEN 'SPECIFIC_ENGINE_REQUIRED'::text
            WHEN lower(COALESCE(g.metadata ->> 'phase_aware'::text, 'false'::text)) = 'true'::text THEN 'PHASE_AWARE'::text
            WHEN g.inheritance_mode = ANY (ARRAY['AUTOSOMAL_RECESSIVE'::text, 'AUTOSOMAL_DOMINANT'::text, 'AUTOSOMAL_INCOMPLETE_DOMINANT'::text, 'SEX_LINKED_RECESSIVE'::text, 'SEX_LINKED_DOMINANT'::text]) THEN 'READY'::text
            ELSE 'SPECIFIC_ENGINE_REQUIRED'::text
        END AS runtime_status,
        CASE
            WHEN g.inheritance_mode = 'SEX_LINKED_COMBINATION' AND m.name = 'Isabella' AND EXISTS (SELECT 1 FROM public.ob_taxa t WHERE t.id=m.taxon_id AND t.scientific_name='Serinus canaria domestica') AND g.metadata->>'runtime_model' = 'CANARY_BRUNO_AGATA_NO_DOUBLE_HET_V1' AND g.metadata->>'verified_rule_end_to_end_tested' = 'true' AND m.metadata->>'specific_runtime_tested' = 'true' THEN 'CANARY_BRUNO_AGATA_NO_DOUBLE_HET_V1'::text
            WHEN lower(COALESCE(m.metadata ->> 'specific_engine_required'::text, 'false'::text)) = 'true'::text THEN m.metadata ->> 'required_engine'::text
            WHEN lower(COALESCE(g.metadata ->> 'phase_aware'::text, 'false'::text)) = 'true'::text THEN 'Z_LINKED_PHASE_RUNTIME'::text
            WHEN g.inheritance_mode = 'AUTOSOMAL_RECESSIVE'::text THEN 'AUTOSOMAL_RECESSIVE_V2'::text
            WHEN g.inheritance_mode = ANY (ARRAY['AUTOSOMAL_DOMINANT'::text, 'AUTOSOMAL_INCOMPLETE_DOMINANT'::text]) THEN 'AUTOSOMAL_FACTOR_RUNTIME'::text
            WHEN g.inheritance_mode = 'SEX_LINKED_RECESSIVE'::text THEN 'Z_LINKED_RECESSIVE_RUNTIME'::text
            WHEN g.inheritance_mode = 'SEX_LINKED_DOMINANT'::text THEN 'Z_LINKED_DOMINANT_RUNTIME'::text
            ELSE NULL::text
        END AS runtime_engine,
    false AS carrier_inference_from_photo
   FROM ob_genetic_rules g
     JOIN ob_mutations m ON m.id = g.mutation_id;

-- Applied separately after publishing and testing the app:
BEGIN;
INSERT INTO ob_sources(id,title,url,status,metadata) VALUES
('src:dkb:canary:colour-inheritance','Die Vererbung der Gefiederfarben — Norbert Schramm','https://www.vogelbund.de/die-vererbung-der-gefiederfarben/','VERIFIED','{"publisher":"DKB","reviewed_on":"2026-11-26","scope":"Avian ZZ/ZW recessive inheritance and linked-locus notation; no recombination rate established"}'),
('src:dkb:canary:classification','Vogelarten — Farbenkanarien','https://www.vogelbund.de/vogelarten/','VERIFIED','{"publisher":"DKB","reviewed_on":"2026-11-26","scope":"Isabell combination Achat + Braun; not an independent locus"}')
ON CONFLICT(id) DO NOTHING;
UPDATE ob_mutations SET metadata=coalesce(metadata,'{}'::jsonb)||'{"specific_runtime_tested":true,"pairing_prediction_allowed":true,"offspring_calculation_enabled":true,"offspring_calculation_allowed":true,"specific_engine_required":false,"genetic_engine_validation_pending":false,"runtime_specific_test_pending":false,"requires_manual_genetic_review":false,"genetic_validation_required":false,"validated_prediction_scope":"TWO_Z_LINKED_LOCI_KNOWN_GENOTYPES_NO_DOUBLE_HET_MALES","runtime_model":"CANARY_BRUNO_AGATA_NO_DOUBLE_HET_V1","runtime_audit_20261126":{"date":"2026-11-26","scope":"TWO_Z_LINKED_LOCI_KNOWN_GENOTYPES_NO_DOUBLE_HET_MALES","runtime_model":"CANARY_BRUNO_AGATA_NO_DOUBLE_HET_V1","positive_cases":34,"negative_cases":19,"regression_positive":267,"regression_negative":240,"commit":"decf985d2148cbbde664bfadd520213f484b6fa3","status":"PASS","double_heterozygote_allowed":false,"recombination_rate_assumed":false,"photo_inference":false,"iphone_manual_test":false}}'::jsonb WHERE id='b777ddaa-f454-40d1-9bf3-fa7dacd6159b' AND inheritance_mode='SEX_LINKED_COMBINATION';
UPDATE ob_genetic_rules SET source_id='src:dkb:canary:classification', metadata=coalesce(metadata,'{}'::jsonb)||'{"runtime_model":"CANARY_BRUNO_AGATA_NO_DOUBLE_HET_V1","verified_rule_end_to_end_tested":true,"offspring_calculation_allowed":true,"pairing_prediction_allowed":true,"calculation_ready":true,"phase_aware":false,"requires_phase_aware_engine":true,"double_heterozygote_allowed":false,"verified_rule_runtime_registry_status":"READY_WITH_INPUT_RESTRICTIONS","verified_rule_remaining_blocker":"DOUBLE_HETEROZYGOTE_RECOMBINATION_RATE_UNVERIFIED","verified_rule_app_prediction_authorized_by_this_audit":true,"runtime_audit_20261126":{"date":"2026-11-26","scope":"TWO_Z_LINKED_LOCI_KNOWN_GENOTYPES_NO_DOUBLE_HET_MALES","runtime_model":"CANARY_BRUNO_AGATA_NO_DOUBLE_HET_V1","positive_cases":34,"negative_cases":19,"regression_positive":267,"regression_negative":240,"commit":"decf985d2148cbbde664bfadd520213f484b6fa3","status":"PASS","double_heterozygote_allowed":false,"recombination_rate_assumed":false,"photo_inference":false,"iphone_manual_test":false},"supporting_source_ids":["src:dkb:canary:colour-inheritance","src:dkb:canary:classification"]}'::jsonb WHERE id='3edb393f-28aa-4dc6-a0ce-fe1d20c7babc' AND inheritance_mode='SEX_LINKED_COMBINATION';
COMMIT;
SELECT specie,mutazione,previsione_autorizzata,motivo_controllo FROM ob_global_genetic_safety_v1 WHERE mutation_id='b777ddaa-f454-40d1-9bf3-fa7dacd6159b';