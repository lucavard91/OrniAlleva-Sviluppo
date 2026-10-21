/* OrniBreed Sviluppo: archivio ospite LOCALE per collaudo, NON per produzione.
   Nessuna scrittura sul Supabase degli allevatori. Scadenza fissa: 12 ore. */
(function(){
"use strict";
const KEY="ornibreed_guest_local_v1",TTL=12*60*60*1000;
let state=null;
const uid=()=>crypto.randomUUID?crypto.randomUUID():"guest-"+Date.now()+"-"+Math.random().toString(36).slice(2);
function wipe(){
 let old=state;
 if(!old){try{old=JSON.parse(localStorage.getItem(KEY)||"null");}catch(e){}}
 localStorage.removeItem(KEY);
 if(old?.id){
  localStorage.removeItem("myagari_active_allevamento_"+old.id);
  Object.keys(localStorage).filter(k=>k.startsWith("myagari_nav_state_"+old.id+"_")).forEach(k=>localStorage.removeItem(k));
  // Elimina anche notifiche, preferenze e stato locale legati alla prova terminata.
  Object.keys(localStorage).filter(k=>
   k.startsWith("myagari_notifiche_"+old.id+"_") ||
   k.startsWith("ob_intro_hide_v1_"+old.id) ||
   k.startsWith("myagari_nav_state_"+old.id+"_") ||
   k.startsWith("ob_mostra_v1_"+old.id+"_") ||
   k==="ob_intro_hide_v1_"+old.id
  ).forEach(k=>localStorage.removeItem(k));
  localStorage.removeItem("ob_intro_hide_v1_guest");
 }
 state=null;
}
function load(){
 try{
  const raw=localStorage.getItem(KEY);
  if(!raw)return null;
  const s=JSON.parse(raw);
  if(!s?.id||!Number.isFinite(s.expiresAt)||!s.tables||!s.photos||s.expiresAt<=Date.now()){wipe();return null;}
  return s;
 }catch(e){return null;}
}
function save(){
 if(!state||state.expiresAt<=Date.now())throw Error("Le 12 ore della prova sono terminate.");
 try{localStorage.setItem(KEY,JSON.stringify(state));}
 catch(e){throw Error("Memoria locale piena. Riduci le fotografie di prova.");}
}
function user(){
 return {id:state.id,is_anonymous:true,email:null,app_metadata:{provider:"guest-local"},user_metadata:{nome_allevamento:"Allevamento ospite"}};
}
function currentSession(){
 const u=user();
 return {user:u,access_token:null,refresh_token:null,expires_at:Math.floor(state.expiresAt/1000)};
}
function query(table){
 const name=String(table),filters=[];
 let action="select",input=null,returnRows=false,single="",cap=null,page=null,orderKey=null,asc=true,onlyHead=false,conflict=null,promise=null;
 const equal=(a,b)=>a==null||b==null?a==null&&b==null:String(a)===String(b);
 const ok=row=>filters.every(f=>{
  const v=row[f.k],x=f.v;
  switch(f.op){
   case "eq":return equal(v,x);
   case "neq":return !equal(v,x);
   case "in":return Array.isArray(x)&&x.some(y=>equal(v,y));
   case "is":return equal(v,x);
   case "gt":return v>x;
   case "gte":return v>=x;
   case "lt":return v<x;
   case "lte":return v<=x;
   case "like":return String(v??"").includes(String(x).replaceAll("%",""));
   case "ilike":return String(v??"").toLowerCase().includes(String(x).replaceAll("%","").toLowerCase());
   case "not":return !equal(v,x);
   case "contains":return Array.isArray(v)&&Array.isArray(x)&&x.every(y=>v.includes(y));
   case "overlaps":return Array.isArray(v)&&Array.isArray(x)&&x.some(y=>v.includes(y));
  }
  return true;
 });
 function execute(){
  if(!state||state.expiresAt<=Date.now())return {data:null,error:{message:"Prova ospite scaduta"},count:0};
  try{
   const rows=state.tables[name]||[];
   const matched=rows.map((r,i)=>({r,i})).filter(z=>ok(z.r));
   let result=[],total=matched.length;
   if(action==="select"){
    result=matched.map(z=>({...z.r}));
    if(orderKey)result.sort((a,b)=>{
     const v=String(a[orderKey]??""),w=String(b[orderKey]??"");
     return (asc?1:-1)*v.localeCompare(w,undefined,{numeric:true});
    });
    if(page)result=result.slice(page[0],page[1]+1);
    if(cap!==null)result=result.slice(0,cap);
   }else if(action==="insert"||action==="upsert"){
    for(const o of Array.isArray(input)?input:[input]){
     const row={id:uid(),created_at:new Date().toISOString(),...(o||{})};
     const keys=conflict?conflict.split(",").map(k=>k.trim()):["id"];
     const idx=action==="upsert"?rows.findIndex(old=>keys.every(k=>equal(old[k],row[k]))):-1;
     if(idx<0){rows.push(row);result.push(row);}
     else{rows[idx]={...rows[idx],...row};result.push(rows[idx]);}
    }
    state.tables[name]=rows;
   }else if(action==="update"){
    matched.forEach(z=>{Object.assign(rows[z.i],input||{});result.push(rows[z.i]);});
   }else if(action==="delete"){
    const targets=new Set(matched.map(z=>z.i));
    result=matched.map(z=>z.r);
    state.tables[name]=rows.filter((_,i)=>!targets.has(i));
   }
   if(action!=="select")save();
   total=action==="select"?total:result.length;
   if(onlyHead)result=null;
   if(single==="single"&&(!result||!result.length))return {data:null,error:{message:"Record non trovato"},count:0};
   const data=action!=="select"&&!returnRows?null:single?(result?.[0]||null):result;
   return {data,error:null,count:total};
  }catch(e){return {data:null,error:{message:e.message||String(e)},count:0};}
 }
 const q={
  select(_fields,opts){returnRows=true;onlyHead=!!opts?.head;return q;},
  insert(v){action="insert";input=v;return q;},
  upsert(v,opts){action="upsert";input=v;conflict=opts?.onConflict||null;return q;},
  update(v){action="update";input=v;return q;},
  delete(){action="delete";return q;},
  eq(k,v){filters.push({op:"eq",k,v});return q;},
  neq(k,v){filters.push({op:"neq",k,v});return q;},
  in(k,v){filters.push({op:"in",k,v});return q;},
  is(k,v){filters.push({op:"is",k,v});return q;},
  gt(k,v){filters.push({op:"gt",k,v});return q;},
  gte(k,v){filters.push({op:"gte",k,v});return q;},
  lt(k,v){filters.push({op:"lt",k,v});return q;},
  lte(k,v){filters.push({op:"lte",k,v});return q;},
  like(k,v){filters.push({op:"like",k,v});return q;},
  ilike(k,v){filters.push({op:"ilike",k,v});return q;},
  contains(k,v){filters.push({op:"contains",k,v});return q;},
  overlaps(k,v){filters.push({op:"overlaps",k,v});return q;},
  not(k,_op,v){filters.push({op:"not",k,v});return q;},
  match(obj){Object.entries(obj||{}).forEach(([k,v])=>filters.push({op:"eq",k,v}));return q;},
  filter(k,op,v){filters.push({op,k,v});return q;},
  or(){return q;},
  order(k,opts){orderKey=k;asc=opts?.ascending!==false;return q;},
  range(a,b){page=[a,b];return q;},
  limit(v){cap=v;return q;},
  single(){single="single";return q;},
  maybeSingle(){single="maybe";return q;},
  returns(){return q;},
  then(success,failure){if(!promise)promise=Promise.resolve().then(execute);return promise.then(success,failure);},
  catch(f){return q.then(undefined,f);}
 };
 return q;
}
async function fileDataUrl(file){
 // In modalità ospite il browser salva una versione ottimizzata della foto.
 // Nessun limite sul file originale di iPhone, ma archivio locale contenuto.
 if(!file||!String(file.type||"").startsWith("image/"))throw Error("Seleziona una fotografia.");
 const url=URL.createObjectURL(file);
 try{
  const img=await new Promise((resolve,reject)=>{
   const picture=new Image();
   picture.onload=()=>resolve(picture);
   picture.onerror=()=>reject(Error("Formato immagine non supportato. Prova JPG."));
   picture.src=url;
  });
  const maximum=1000;
  const ratio=Math.min(1,maximum/Math.max(img.naturalWidth,img.naturalHeight));
  const canvas=document.createElement("canvas");
  canvas.width=Math.max(1,Math.round(img.naturalWidth*ratio));
  canvas.height=Math.max(1,Math.round(img.naturalHeight*ratio));
  const ctx=canvas.getContext("2d");
  if(!ctx)throw Error("Impossibile ottimizzare l'immagine.");
  ctx.drawImage(img,0,0,canvas.width,canvas.height);
  return canvas.toDataURL("image/jpeg",0.70);
 }finally{URL.revokeObjectURL(url);}
}
function bucket(){
 return {
  upload:async(path,file)=>{
   try{
    const optimized=await fileDataUrl(file);
    const previous=state.photos[String(path)];
    state.photos[String(path)]=optimized;
    try{save();}catch(e){
     if(previous===undefined)delete state.photos[String(path)];
     else state.photos[String(path)]=previous;
     throw e;
    }
    return {data:{path},error:null};
   }catch(e){return {data:null,error:{message:e.message||String(e)}};}
  },
  createSignedUrl:async path=>{
   const uri=state.photos[String(path)];
   return {data:uri?{signedUrl:uri}:null,error:uri?null:{message:"Foto non trovata"}};
  },
  getPublicUrl:path=>({data:{publicUrl:state.photos[String(path)]||""}}),
  remove:async paths=>{
   (paths||[]).forEach(path=>delete state.photos[String(path)]);
   try{save();return {data:paths,error:null};}
   catch(e){return {data:null,error:{message:e.message}};}
  },
  list:async folder=>{
   const prefix=String(folder||"").replace(/\/?$/,"/");
   return {data:Object.keys(state.photos).filter(p=>p.startsWith(prefix)).map(p=>({name:p.slice(prefix.length)})),error:null};
  },
  download:async path=>{
   const uri=state.photos[String(path)];
   return uri?{data:await(await fetch(uri)).blob(),error:null}:{data:null,error:{message:"Foto non trovata"}};
  }
 };
}
function makeClient(){
 const session=currentSession();
 const channel={on(){return channel;},subscribe(){return channel;},async unsubscribe(){return "ok";}};
 return {
  from:query,
  auth:{
   getSession:async()=>({data:{session},error:null}),
   getUser:async()=>({data:{user:session.user},error:null}),
   updateUser:async x=>{
    if(x?.data)Object.assign(session.user.user_metadata,x.data);
    return {data:{user:session.user},error:null};
   },
   signOut:async()=>{wipe();return {error:null};},
   onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})
  },
  storage:{
   from:bucket,
   listBuckets:async()=>({data:[{id:"myagari-fot",name:"myagari-fot",public:false}],error:null})
  },
  rpc:async()=>({data:null,error:{message:"Funzione server non disponibile in prova locale"}}),
  functions:{invoke:async()=>({data:null,error:{message:"Servizio non disponibile in prova locale"}})},
  channel:()=>channel,
  removeChannel:async()=>"ok"
 };
}
window.obGuestLocal={
 hasActive:()=>!!load(),
 enter(){
  state=load();
  if(!state){
   state={id:uid(),startedAt:Date.now(),expiresAt:Date.now()+TTL,tables:{},photos:{}};
   save();
  }
  return {client:makeClient(),session:currentSession(),expiresAt:state.expiresAt};
 },
 wipe,
 getExpiresAt:()=>load()?.expiresAt||0,
 isLocalDemo:true
};
})();
