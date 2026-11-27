const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(process.argv[2] || 'index.html', 'utf8');
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
let parsed = 0;
for (const [, attrs, source] of scripts) {
  if (!source.trim() || /application\/ld\+json/.test(attrs)) continue;
  new vm.Script(source);
  parsed++;
}
const slice = (a, b) => {
  const start = html.indexOf(a);
  const end = html.indexOf(b, start);
  assert(start >= 0 && end > start, a);
  return html.slice(start, end);
};
const elements = {};
for (const suffix of ['Specie','Mutazione','Maschio','Femmina','Risultato','Calcola']) {
  elements['v21Gen' + suffix] = { value: '', innerHTML:'', textContent:'', setAttribute(){},scrollIntoView(){},focus(){},addEventListener(name, callback){this.click=callback;} };
}
const context = {
  document: {getElementById: id => elements[id]},
  window: {}, esc: value => value, v221gt: value => value, v1811Lingua:'it',
  console, permissions: [], databaseError: null,
  maleSubject: null, femaleSubject: null,
  v235SelectedSubject: sex => sex === 'M' ? context.maleSubject : context.femaleSubject,
  sb: {from: table => {assert.equal(table,'ob_global_genetic_safety_v1');return {select:()=>({eq:()=>({limit:async()=>({data:context.permissions,error:context.databaseError})})})};}}
};
vm.createContext(context);
const handlerStart=html.indexOf('document.getElementById("v21GenCalcola")?.addEventListener');
const handlerEnd=html.indexOf('\n  });',handlerStart)+6;
const core = [
slice('const V21_GENETIC_RULES = [','];')+'];',
slice('function v232InheritanceLabel','function v232StatusLabel'),
slice('function v21MutationMatches','let v21CatalogTaxa'),
slice('function v21Pct','function v21SearchChoices'),
slice('function obDomesticCanaryName','function obCatalogSelectionForSubject'),
slice('function v22Norm(','function v22SubjectLabel'),
slice('function v235Precheck','function v235ShowPrecheck'),
html.slice(handlerStart,handlerEnd),
'globalThis.rules = V21_GENETIC_RULES;'
].join('\n');
vm.runInContext(core,context);
context.t=x=>x;context.v222OrnithoName=x=>x;
vm.runInContext(html.slice(html.indexOf('window.v21RenderCalc=function(rows,rule){'),html.indexOf('  function rebindOverrides()',html.indexOf('window.v21RenderCalc=function(rows,rule){'))),context);
context.v21RenderCalc=context.window.v21RenderCalc;
const slrProb=[[.5,0,0,.5,0],[0,.5,0,.5,0],[.25,.25,0,.25,.25],[0,.25,.25,.25,.25],[0,.5,0,0,.5],[0,0,.5,0,.5]];
const slrLabels=['Maschio|Non mutato|Z/Z|No','Maschio|Non mutato|Zm/Z|Portatore','Maschio|Mutato|Zm/Zm|No','Femmina|Non mutata|ZW|No','Femmina|Mutata|ZmW|No'];
const arProb=[[1,0,0],[.5,.5,0],[0,1,0],[.5,.5,0],[.25,.5,.25],[0,.5,.5],[0,1,0],[0,.5,.5],[0,0,1]];
const labels={
  AR:['Maschi e femmine|Non mutato|AA|No','Maschi e femmine|Non mutato|Aa|Portatore','Maschi e femmine|Mutato|aa|No'],
  ID:['Maschi e femmine|Doppio fattore|AA|—','Maschi e femmine|Singolo fattore|Aa|—','Maschi e femmine|Non mutato|aa|—'],
  ADL:['Maschi e femmine|Omozigote letale|AA|—','Maschi e femmine|Bianco dominante|Aa|—','Maschi e femmine|Non mutato|aa|—']
};
const records=[];
let negative=0;
async function run(rule,male,female,expected,species=rule.species,mutation=rule.mutation){
  for(const [suffix,value] of Object.entries({Specie:species,Mutazione:mutation,Maschio:male,Femmina:female}))elements['v21Gen'+suffix].value=value;
  const box=elements.v21GenRisultato;box.innerHTML='';box.textContent='';
  await elements.v21GenCalcola.click();
  if(expected===null){assert(box.textContent && !box.innerHTML,JSON.stringify({mutation,male,female,box}));negative++;return;}
  const actual=[...box.innerHTML.matchAll(/<tr><td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><td><b>([^<]*)<\/b><\/td><\/tr>/g)].map(row=>row.slice(1).join('|')).sort();
  assert.deepEqual(actual,expected.slice().sort(),JSON.stringify({species,mutation,male,female,text:box.textContent}));
  if(rule.inheritance==='ID'){for(const label of ['Singolo fattore','Doppio fattore'])if(actual.some(row=>row.includes(label)))assert(box.innerHTML.includes(label.toUpperCase()+' — '+rule.mutation.toUpperCase()));}
  records.push({species,mutation,male,female,expected:actual});
}
(async()=>{
  const names=['Bianco recessivo','Bianco dominante','Bruno','Agata','Avorio','Pastello','Opale','Eumo','Cobalto','Phaeo','Topazio','Onice','Satiné','Urucum','Jaspe','Fattore blu ottico'];
  const live=[{"specie": "Canarino", "mutazione": "Agata", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Avorio", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Bianco Dominante", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Bianco Recessivo", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Bruno", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Cobalto", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Eumo", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Fattore blu ottico", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Isabella", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Jaspe", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Onyx", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Opale", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Pastello", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Perla", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Phaeo", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Satine", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Topazio", "previsione_autorizzata": true}, {"specie": "Canarino", "mutazione": "Urucum", "previsione_autorizzata": true}, {"specie": "Cardellino", "mutazione": "Agata", "previsione_autorizzata": true}, {"specie": "Cardellino", "mutazione": "Albino", "previsione_autorizzata": true}, {"specie": "Cardellino", "mutazione": "Aurora", "previsione_autorizzata": true}, {"specie": "Cardellino", "mutazione": "Bruno", "previsione_autorizzata": true}, {"specie": "Cardellino", "mutazione": "Faccia Nera", "previsione_autorizzata": true}, {"specie": "Cardellino", "mutazione": "Opale", "previsione_autorizzata": true}, {"specie": "Cardellino", "mutazione": "Pastello", "previsione_autorizzata": true}, {"specie": "Cardellino", "mutazione": "Testa Bianca", "previsione_autorizzata": true}, {"specie": "Cardinalino del Venezuela", "mutazione": "Bruno", "previsione_autorizzata": true}, {"specie": "Cardinalino del Venezuela", "mutazione": "Diluito", "previsione_autorizzata": true}, {"specie": "Cardinalino del Venezuela", "mutazione": "Topazio", "previsione_autorizzata": true}, {"specie": "Ciuffolotto", "mutazione": "Bruno", "previsione_autorizzata": true}, {"specie": "Ciuffolotto", "mutazione": "Pastello", "previsione_autorizzata": true}, {"specie": "Diamante di Gould", "mutazione": "Avorio", "previsione_autorizzata": true}, {"specie": "Diamante di Gould", "mutazione": "Blu", "previsione_autorizzata": true}, {"specie": "Diamante di Gould", "mutazione": "Cannella", "previsione_autorizzata": true}, {"specie": "Diamante di Gould", "mutazione": "Lutino", "previsione_autorizzata": true}, {"specie": "Diamante di Gould", "mutazione": "Petto Bianco", "previsione_autorizzata": true}, {"specie": "Lucherino europeo", "mutazione": "Avorio", "previsione_autorizzata": true}, {"specie": "Lucherino europeo", "mutazione": "Bruno", "previsione_autorizzata": true}, {"specie": "Lucherino europeo", "mutazione": "Diluito", "previsione_autorizzata": true}, {"specie": "Organetto", "mutazione": "Bruno", "previsione_autorizzata": true}, {"specie": "Organetto", "mutazione": "Pastello", "previsione_autorizzata": true}, {"specie": "Verdone", "mutazione": "Bruno", "previsione_autorizzata": true}, {"specie": "Verdone", "mutazione": "Pastello", "previsione_autorizzata": true}, {"specie": "Agapornis roseicollis", "mutazione": "Cannella", "previsione_autorizzata": true}, {"specie": "Agapornis roseicollis", "mutazione": "Diluito", "previsione_autorizzata": true}, {"specie": "Agapornis roseicollis", "mutazione": "Grigio", "previsione_autorizzata": true}, {"specie": "Agapornis roseicollis", "mutazione": "Marbled", "previsione_autorizzata": true}, {"specie": "Agapornis roseicollis", "mutazione": "Opalino", "previsione_autorizzata": true}, {"specie": "Agapornis roseicollis", "mutazione": "Pezzato Recessivo", "previsione_autorizzata": true}, {"specie": "Nymphicus hollandicus", "mutazione": "Argento Dominante", "previsione_autorizzata": true}, {"specie": "Nymphicus hollandicus", "mutazione": "Cannella", "previsione_autorizzata": true}, {"specie": "Nymphicus hollandicus", "mutazione": "Faccia Bianca", "previsione_autorizzata": true}, {"specie": "Nymphicus hollandicus", "mutazione": "Faccia Pallida", "previsione_autorizzata": true}, {"specie": "Nymphicus hollandicus", "mutazione": "Fallow Bronzo", "previsione_autorizzata": true}, {"specie": "Nymphicus hollandicus", "mutazione": "Guancia Gialla Sesso-legata", "previsione_autorizzata": true}, {"specie": "Nymphicus hollandicus", "mutazione": "Ino", "previsione_autorizzata": true}, {"specie": "Nymphicus hollandicus", "mutazione": "Perlato", "previsione_autorizzata": true}, {"specie": "Nymphicus hollandicus", "mutazione": "Pezzato", "previsione_autorizzata": true}, {"specie": "Nymphicus hollandicus", "mutazione": "Platinum", "previsione_autorizzata": true}];
  const selected=context.rules.filter(rule=>rule.inheritance!=="ZBA"&&context.v21RuleAuthorized(rule,live));
  assert.equal(selected.length,58);
  context.permissions=selected.map(rule=>({specie:'Canarino',mutazione:rule.mutation==='Onice'?'Onyx':rule.mutation,previsione_autorizzata:true}));
  context.permissions=live;
  const permissions=context.permissions;
  for(const rule of selected){
    const male=rule.inheritance==='SLR'?['ZZ','ZmZ','ZmZm']:rule.inheritance==='ADL'?['aa','Aa']:['AA','Aa','aa'];
    const female=rule.inheritance==='SLR'?['ZW','ZmW']:male;
    let index=0;
    for(const m of male)for(const f of female){
      const probabilities=rule.inheritance==='SLR'?slrProb[index++]:arProb[['AA','Aa','aa'].indexOf(m)*3+['AA','Aa','aa'].indexOf(f)];
      const descriptions=rule.inheritance==='SLR'?slrLabels:labels[rule.inheritance];
      const expected=descriptions.flatMap((row,i)=>probabilities[i]?[row+'|'+probabilities[i]*100+'%']:[]);
      await run(rule,m,f,expected,rule.species==='Canarino domestico'?'Canarino':rule.species);
    }
    await run(rule,'?',female[0],null);
    await run(rule,male[0],'?',null);
    await run(rule,'INVALID',female[0],null);
    await run(rule,male[0],'INVALID',null);
    if(rule.inheritance==='ADL'){await run(rule,'AA','aa',null);await run(rule,'aa','AA',null);}
    context.permissions=[];await run(rule,male[0],female[0],null);
    context.permissions=permissions;context.databaseError=new Error('offline');
    await run(rule,male[0],female[0],null);context.databaseError=null;
    context.maleSubject={specie:'Specie estranea al catalogo',sesso:'Maschio'};
    await run(rule,male[0],female[0],null);context.maleSubject=null;
  }
  const perla=selected.find(r=>r.mutation==='Perla');
  for(const alias of ['Nero Perla','Pearl'])await run(perla,'aa','aa',[labels.AR[2]+'|100%'],'Canarino',alias);
  const onyx=selected.find(r=>r.mutation==='Onice');
  await run(onyx,'aa','aa',[labels.AR[2]+'|100%'],'Canarino','Onyx');
  const satine=selected.find(r=>r.mutation==='Satiné');
  await run(satine,'ZmZm','ZmW',[slrLabels[2]+'|50%',slrLabels[4]+'|50%'],'Canarino','Satine');
  const urucum=selected.find(r=>r.mutation==='Urucum');
  await run(urucum,'aa','aa',[labels.AR[2]+'|100%'],'Canarino','Becco Giallo');
  const jaspe=selected.find(r=>r.mutation==='Jaspe');
  assert.equal(context.v22KnownGenotype({specie:'Canarino',mutazione:'Jaspe'},jaspe,'M'),'?');
  assert.equal(context.v22KnownGenotype({specie:'Canarino',mutazione:'Onyx'},onyx,'M'),'aa');
  assert.equal(context.v22KnownGenotype({specie:'Canarino',portatore_di:'Onyx',portatore_origine:'DA_VERIFICARE'},onyx,'M'),'?');
  const newRules=selected.filter(r=>r.requiresExplicitGenotypes);
  assert.equal(newRules.length,15);
  for(const r of newRules){
    for(const sex of ['M','F'])assert.equal(context.v22KnownGenotype({specie:r.species,mutazione:r.mutation,portatore_di:r.mutation},r,sex),'?');
    for(const alias of r.aliases||[]){
      if(r.inheritance==='SLR')await run(r,'ZmZm','ZmW',[slrLabels[2]+'|50%',slrLabels[4]+'|50%'],r.species,alias);
      else await run(r,'aa','aa',[labels.AR[2]+'|100%'],r.species,alias);
    }
  }
  const summary={parsedScripts:parsed,mutations:selected.length,positiveCases:records.length,negativeCases:negative,records};
  fs.writeFileSync('all-enabled-test-results.json',JSON.stringify(summary,null,2));
  console.log(JSON.stringify({...summary,records:undefined}));
})().catch(error=>{console.error(error);process.exit(1)});

