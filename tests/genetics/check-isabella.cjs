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
  records.push({species,mutation,male,female,expected:actual});
}
(async()=>{
 const rule=context.rules.find(r=>r.inheritance==='ZBA');
 context.permissions=[{specie:'Canarino',mutazione:'Isabella',previsione_autorizzata:true}];
 const perms=context.permissions;
 const hs=['BA','bA','Ba','ba'];
 // Independent reference enumerates four equiprobable parental chromosome transmissions.
 const phenotype={BA:'Nero',bA:'Bruno',Ba:'Agata',ba:'Isabella'};
 for(let i=0;i<4;i++)for(let j=i;j<4;j++)for(const f of hs){
  const a=hs[i],b=hs[j],m=a+'/'+b;
  if(a[0]!==b[0]&&a[1]!==b[1]){await run(rule,m,f+'/W',null);continue;}
  const expected=new Map();
  for(const z of [a,b]){
   let key='Femmina|'+phenotype[z]+'|'+z+'/W|No';expected.set(key,(expected.get(key)||0)+25);
   const brown=z[0]==='b'&&f[0]==='b',agate=z[1]==='a'&&f[1]==='a';
   const carriers=[z[0]!==f[0]?'Bruno':'',z[1]!==f[1]?'Agata':''].filter(Boolean).join(' + ')||'No';
   key='Maschio|'+phenotype[(brown?'b':'B')+(agate?'a':'A')]+'|'+[z,f].sort().join('/')+'|'+carriers;
   expected.set(key,(expected.get(key)||0)+25);
  }
  await run(rule,m,f+'/W',[...expected].map(([k,p])=>k+'|'+p+'%'));
 }
 await run(rule,'ba/ba','ba/W',['Maschio|Isabella|ba/ba|No|50%','Femmina|Isabella|ba/W|No|50%'],'Canarino','Isabel');
 for(const [m,f] of [['?','ba/W'],['ba/ba','?'],['ZmZm','ZmW'],['BA/ba','BA/W'],['bA/Ba','BA/W'],['ba/ba','ba/ba'],['invalid','ba/W']])await run(rule,m,f,null);
 context.permissions=[];await run(rule,'ba/ba','ba/W',null);context.permissions=perms;
 context.databaseError=new Error('offline');await run(rule,'ba/ba','ba/W',null);context.databaseError=null;
 context.maleSubject={specie:'Cardellino',sesso:'Maschio'};await run(rule,'ba/ba','ba/W',null);context.maleSubject=null;
 context.femaleSubject={specie:'Canarino',sesso:'Maschio'};await run(rule,'ba/ba','ba/W',null);context.femaleSubject=null;
 for(const sex of ['M','F'])assert.equal(context.v22KnownGenotype({specie:'Canarino',mutazione:'Isabella',portatore_di:'Bruno, Agata'},rule,sex),'?');
 assert(elements.v21GenRisultato);
 context.permissions=perms;await run(rule,'ba/ba','ba/W',['Maschio|Isabella|ba/ba|No|50%','Femmina|Isabella|ba/W|No|50%']);
 assert(elements.v21GenRisultato.innerHTML.includes('MASCHIO — ISABELLA'));
 assert(elements.v21GenRisultato.innerHTML.includes('FEMMINA — ISABELLA'));
 assert.equal(records.length,34);assert.equal(negative,19);
 fs.writeFileSync('isabella-test-results.json',JSON.stringify({parsedScripts:parsed,positiveCases:records.length,negativeCases:negative,records},null,2));
 console.log(JSON.stringify({parsedScripts:parsed,positiveCases:records.length,negativeCases:negative}));
})().catch(error=>{console.error(error);process.exit(1)});
