/* OrniBreed Sviluppo - catalogo dimostrativo OFFLINE per l'ospite locale.
   NON rappresenta il catalogo FOI/COM completo; per gli utenti registrati
   rimane in vigore esclusivamente il catalogo Supabase. */
(function(){
"use strict";
const taxa=[];
function addTaxon(name,scientific,group,aliases=[]){
 const id="guest-taxon-"+(taxa.length+1);
 const t={id,name,common_name:name,scientific_name:scientific,group_code:group,
  rank:"species",active:true,aliases,metadata:{name_it:name}};
 taxa.push(t);
 return id;
}
const canary=addTaxon("Canarino domestico","Serinus canaria domestica","CANARINI",["Canarino","Canarino di colore"]);
[
 ["Cardellino","Carduelis carduelis"],
 ["Cardinalino del Venezuela","Spinus cucullatus"],
 ["Carpodaco messicano","Haemorhous mexicanus"],
 ["Ciuffolotto","Pyrrhula pyrrhula"],
 ["Lucherino europeo","Spinus spinus"],
 ["Lucherino testa nera","Spinus magellanicus"],
 ["Verdone","Chloris chloris"],
 ["Organetto","Acanthis flammea"],
 ["Fringuello","Fringilla coelebs"],
 ["Peppola","Fringilla montifringilla"],
 ["Fanello","Linaria cannabina"],
 ["Verzellino","Serinus serinus"],
 ["Frosone","Coccothraustes coccothraustes"],
 ["Crociere","Loxia curvirostra"],
 ["Zigolo giallo","Emberiza citrinella"],
 ["Diamante mandarino","Taeniopygia guttata"],
 ["Diamante di Gould","Chloebia gouldiae"],
 ["Passero del Giappone","Lonchura striata domestica"],
 ["Diamante di Bichenov","Stizoptera bichenovii"],
 ["Diamante codalunga","Poephila acuticauda"],
 ["Diamante ruficauda","Bathilda ruficauda"]
].forEach(x=>addTaxon(x[0],x[1],"EFI"));
[
 ["Inseparabile roseicollis","Agapornis roseicollis"],
 ["Inseparabile fischeri","Agapornis fischeri"],
 ["Inseparabile personatus","Agapornis personatus"],
 ["Inseparabile nigrigenis","Agapornis nigrigenis"],
 ["Inseparabile lilianae","Agapornis lilianae"],
 ["Inseparabile taranta","Agapornis taranta"],
 ["Inseparabile canus","Agapornis canus"],
 ["Inseparabile pullarius","Agapornis pullarius"],
 ["Cocorita","Melopsittacus undulatus"],
 ["Calopsitta","Nymphicus hollandicus"],
 ["Forpus coelestis","Forpus coelestis"],
 ["Parrocchetto barrato","Bolborhynchus lineola"],
 ["Kakariki fronte rossa","Cyanoramphus novaezelandiae"],
 ["Rosella comune","Platycercus eximius"],
 ["Parrocchetto dal collare","Psittacula krameri"],
 ["Neophema splendida","Neophema splendida"],
 ["Neophema pulchella","Neophema pulchella"],
 ["Parrocchetto groppone rosso","Psephotus haematonotus"],
 ["Pyrrhura molinae","Pyrrhura molinae"]
].forEach(x=>addTaxon(x[0],x[1],"PSITTACIFORMI"));
const breeds=[];
function addBreed(name,domain,aliases=[]){
 breeds.push({id:"guest-breed-"+(breeds.length+1),taxon_id:canary,name,
  aliases,status:"ACTIVE",group_code:domain,metadata:{name_it:name,domain}});
}
[
 "Canarino di Colore",
 "Gloster Fancy","Razza Spagnola","Fife Fancy","Border Fancy",
 "Norwich","Yorkshire","Scotch Fancy","Lizard","Lancashire",
 "Irish Fancy","Japanese Hoso","Rheinländer","Bernois",
 "Munchener","Bossu Belga","Crested","German Crested",
 "Arlecchino Portoghese","London Fancy"
].forEach(name=>addBreed(name,name==="Canarino di Colore"?"COLOR":"CFPL"));
[
 "Fiorino","Padovano","Gibber Italicus","Arricciato del Nord",
 "Arricciato del Sud","Arricciato di Parigi","Arricciato Svizzero",
 "Giboso Español","Melado Tinerfeño","Mehringer",
 "Arricciato Gigante Italiano","Rogetto"
].forEach(name=>addBreed(name,"CFPA"));
["Harz Roller","Malinois Waterslager","Timbrado Español"]
 .forEach(name=>addBreed(name,"SONG"));
const mutations=[];
function addMutation(name,tid,aliases=[]){
 mutations.push({id:"guest-mutation-"+(mutations.length+1),taxon_id:tid,name,
  aliases,status:"ACTIVE",metadata:{name_it:name}});
}
[
 "Bianco recessivo","Bianco dominante","Avorio","Bruno",
 "Agata","Isabella","Pastello","Opale","Satiné","Eumo",
 "Onice","Cobalto","Jaspe","Topazio","Phaeo",
 "Cinnamon","Fawn","Mosaico"
].forEach(name=>addMutation(name,canary));
/* Nei cataloghi ospite non attribuire mutazioni generiche a tutte le specie.
   Sono soltanto esempi per testare i suggerimenti; l'archivio completo
   e le regole genetiche restano nel database applicativo ufficiale. */
[
 ["Cardellino",["Bruno","Agata","Isabella","Pastello","Opale","Lutino"]],
 ["Cocorita",["Blu","Lutino","Albino","Opale","Cannella"]],
 ["Inseparabile roseicollis",["Aqua","Turquoise","Pallid","Lutino","Opale","Cannella"]]
].forEach(([specie,voci])=>{
 const taxon=taxa.find(t=>t.name===specie);
 if(taxon)voci.forEach(name=>addMutation(name,taxon.id));
});
const phenotypes=[
 ["Giallo","BASE_COLOR"],["Rosso","BASE_COLOR"],["Bianco","BASE_COLOR"],
 ["Verde","BASE_COLOR"],["Nero","BASE_COLOR"],["Bruno","BASE_COLOR"],
 ["Avorio","LIPOCHROME"],["Intenso","FEATHER_EXPRESSION"],
 ["Brinato","FEATHER_EXPRESSION"],["Mosaico","FEATHER_EXPRESSION"]
].map(([name,component_type],i)=>({
 id:"guest-phenotype-"+(i+1),taxon_id:canary,name,component_type,
 metadata:{name_it:name}
}));
window.OB_GUEST_CATALOG_STATIC={
 taxa,breeds,mutations,phenotypes,variants:[],standards:[],globalCatalog:[]
};
})();
