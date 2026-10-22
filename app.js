'use strict';
/* ================= Helpers & storage (localStorage = persistence) ================= */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem('ch_'+k))??d}catch{return d}},set:(k,v)=>{try{localStorage.setItem('ch_'+k,JSON.stringify(v));return true}catch{return false}}};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; // LOCAL date (fixes UTC off-by-one)
const today=()=>iso(new Date());
const addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const LOCS=['Library','Block 34','Block 32','Unipolis','Food Court','Hostel Area','Sports Complex','Main Gate','Other'];
const CATS={Tech:'#3b6cf2',Cultural:'#d63f8c',Academic:'#7a4fd6',Sports:'#1f9d55',Other:'#6b7a8c'};
async function hash(p){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('campushub|'+p));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch{return btoa(p)}}

if(!store.get('seeded')){
  store.set('users',[{id:'admin',name:'Campus Admin',email:'admin@lpu.in',pw:btoa('admin123'),role:'admin'}]);
  store.set('events',[
    {id:uid(),title:'Hackathon Kickoff',date:addDays(2),time:'10:00',venue:'Block 34, Lab 2',cat:'Tech',desc:'24-hour build sprint. Teams of 2–4.',rsvps:[]},
    {id:uid(),title:'Cultural Night Auditions',date:addDays(5),time:'16:30',venue:'Unipolis Auditorium',cat:'Cultural',desc:'Dance, music and stand-up slots open.',rsvps:[]},
    {id:uid(),title:'Placement Prep Workshop',date:addDays(9),time:'14:00',venue:'Block 32, Room 105',cat:'Academic',desc:'Resume review and mock aptitude round.',rsvps:[]},
    {id:uid(),title:'Inter-Section Football',date:addDays(12),time:'17:00',venue:'Sports Complex',cat:'Sports',desc:'Knockout format. Register your section team.',rsvps:[]}]);
  store.set('items',[
    {id:uid(),type:'Found',title:'Blue water bottle',cat:'Other',loc:'Library',date:addDays(-1),desc:'Steel bottle, found on 2nd floor desk.',photo:'',by:'admin',byName:'Campus Admin',status:'open'},
    {id:uid(),type:'Lost',title:'Casio calculator',cat:'Electronics',loc:'Block 32',date:addDays(-2),desc:'FX-991EX, name written on the back.',photo:'',by:'admin',byName:'Campus Admin',status:'open'}]);
  store.set('claims',[]);store.set('seeded',1);
}
let users=store.get('users',[]),events=store.get('events',[]),items=store.get('items',[]),claims=store.get('claims',[]),me=store.get('session',null);
if(me&&!users.some(u=>u.id===me.id))me=null; // stale session guard
const save=()=>{const ok=['users','events','items','claims'].every((k,i)=>store.set(k,[users,events,items,claims][i]))&&store.set('session',me);if(!ok)toast('Storage is full. Delete old posts or photos.');return ok};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2800)}
const isAdmin=()=>me&&me.role==='admin';

/* ================= Theme ================= */
function setTheme(t){document.documentElement.dataset.theme=t;$('#theme').textContent=t==='dark'?'☀️':'🌙';store.set('theme',t)}
setTheme(store.get('theme',matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'));
$('#theme').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');

/* ================= Router ================= */
let view='events';
function go(v){
  if(!$('#'+v)||!$('#'+v).classList.contains('view'))v='events';
  if(v==='mine'&&!me){openAuth();v='events'}
  if(v==='admin'&&!isAdmin())v='events';
  view=v;if(location.hash.slice(1)!==v)location.hash=v;
  $$('.view').forEach(s=>s.hidden=s.id!==v);
  render();scrollTo({top:0});
}
function render(){
  $$('[data-admin]').forEach(e=>e.hidden=!isAdmin());
  $$('[data-auth]').forEach(e=>e.hidden=!me);
  $$('#nav button').forEach(b=>{const on=b.dataset.view===view;b.classList.toggle('on',on);on?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current')});
  $('#authbox').innerHTML=me?`<span class="hi">${esc(me.name.split(' ')[0])}${isAdmin()?' (admin)':''}</span><button class="ghost" id="logout">Log out</button>`:`<button class="btn sm" id="loginBtn">Log in</button>`;
  ({events:renderEvents,items:renderItems,mine:renderMine,admin:renderAdmin})[view]();
}
$('#nav').onclick=e=>{const b=e.target.closest('button');if(b)go(b.dataset.view)};
addEventListener('hashchange',()=>{const v=location.hash.slice(1);if(v&&v!==view)go(v)});

/* ================= Auth ================= */
let regMode=false;
function openAuth(reg=false){regMode=reg;$('#authTitle').textContent=reg?'Create account':'Log in';$$('[data-reg]').forEach(e=>e.hidden=!reg);$('#swapAuth').textContent=reg?'I have an account':'Create an account';$('#authErr').textContent='';if(!$('#authDlg').open)$('#authDlg').showModal()}
$('#swapAuth').onclick=()=>openAuth(!regMode);
$('#authForm').onsubmit=async e=>{
  e.preventDefault();const f=Object.fromEntries(new FormData(e.target)),err=m=>$('#authErr').textContent=m;
  f.email=(f.email||'').trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))return err('Enter a valid email address.');
  if((f.password||'').length<6)return err('Password must be at least 6 characters.');
  const h=await hash(f.password);
  if(regMode){
    if((f.name||'').trim().length<2)return err('Enter your full name.');
    if(users.some(u=>u.email===f.email))return err('This email is already registered. Log in instead.');
    me={id:uid(),name:f.name.trim(),email:f.email,pw:h,role:'student'};users.push(me);
  }else{
    const u=users.find(u=>u.email===f.email&&(u.pw===h||u.pw===btoa(f.password)));
    if(!u)return err('Email or password is wrong.');
    u.pw=h;me=u; // upgrade legacy passwords to SHA-256
  }
  save();$('#authDlg').close();toast('Welcome, '+me.name.split(' ')[0]);render();
};
const needLogin=()=>{if(me)return true;toast('Log in to continue');openAuth();return false};

/* ================= Global clicks / dialogs ================= */
document.addEventListener('click',e=>{
  const t=e.target,d=t.dataset||{};
  if(t.id==='loginBtn')openAuth();
  if(t.id==='logout'){me=null;save();toast('Logged out');go('events')}
  if(t.matches('[data-close]'))t.closest('dialog').close();
  if(t.tagName==='DIALOG')t.close(); // click on backdrop
  if(d.go)go(d.go);
  if(d.ok)decide(d.ok,true);if(d.no)decide(d.no,false);
});
$$('dialog').forEach(dlg=>dlg.addEventListener('close',()=>{ // clean state every time a dialog closes
  const f=$('form',dlg);f&&f.reset();$$('.err',dlg).forEach(p=>p.textContent='');
  if(dlg.id==='itemDlg'){photoData='';$('#prev-img').hidden=true}
}));

/* ================= Events + RSVP calendar ================= */
let cal=new Date(),selDate='',selCat='';cal.setDate(1);
$('#itemForm [name=loc]').innerHTML=LOCS.map(l=>`<option>${l}</option>`).join('');
$('#fLoc').innerHTML='<option value="">All locations</option>'+LOCS.map(l=>`<option>${l}</option>`).join('');
$('#eventForm [name=cat]').innerHTML=Object.keys(CATS).map(c=>`<option>${c}</option>`).join('');
const evCat=e=>CATS[e.cat]?e.cat:'Other';
function when(date){const n=Math.round((new Date(date+'T00:00')-new Date(today()+'T00:00'))/864e5);return n<0?'Ended':n===0?'Today':n===1?'Tomorrow':`In ${n} days`}
function renderEvents(){
  const t=today();
  $('#hstats').innerHTML=`<div><strong>${events.filter(e=>e.date>=t).length}</strong>upcoming events</div><div><strong>${items.filter(i=>i.status==='open').length}</strong>open items</div><div><strong>${items.filter(i=>i.status==='returned').length}</strong>reunited</div>`;
  $('#chips').innerHTML=['All',...Object.keys(CATS)].map(c=>`<button data-cat="${c}" class="${(selCat||'All')===c?'on':''}">${c}</button>`).join('');
  $('#calTitle').textContent=cal.toLocaleString('en',{month:'long',year:'numeric'});
  const y=cal.getFullYear(),m=cal.getMonth(),first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
  let h=['S','M','T','W','T','F','S'].map(d=>`<b>${d}</b>`).join('')+'<span></span>'.repeat(first);
  for(let d=1;d<=days;d++){const ds=`${y}-${pad(m+1)}-${pad(d)}`;
    h+=`<button data-d="${ds}" aria-label="${ds}" class="${events.some(x=>x.date===ds)?'has ':''}${ds===t?'today ':''}${ds===selDate?'sel':''}">${d}</button>`}
  $('#calGrid').innerHTML=h;
  const list=events.filter(e=>(selDate?e.date===selDate:e.date>=t)&&(!selCat||evCat(e)===selCat)).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
  $('#eventList').innerHTML=list.length?list.map(e=>{
    const d=new Date(e.date+'T00:00'),going=me&&e.rsvps.includes(me.id),past=e.date<t,c=evCat(e);
    return `<article class="ev ${past?'past':''}" style="--c:${CATS[c]}"><div class="d"><strong>${d.getDate()}</strong>${d.toLocaleString('en',{month:'short'})}</div>
    <div><div class="meta"><span class="pill">${c}</span><span class="pill when">${when(e.date)}</span></div><h3>${esc(e.title)}</h3><p>🕒 ${esc(e.time)} · 📍 ${esc(e.venue)}</p><p>${esc(e.desc)}</p></div>
    <div class="act"><span>${e.rsvps.length} going</span><div class="row">${past?'':`<button class="btn sm ${going?'dark':''}" data-rsvp="${e.id}">${going?'Cancel RSVP':'RSVP'}</button>`}<button class="ghost" data-ics="${e.id}" title="Add to your calendar">📥 .ics</button>${isAdmin()?`<button class="ghost" data-delev="${e.id}">Delete</button>`:''}</div></div></article>`}).join('')
    :`<p class="card empty">${selDate?'No events on this date.':'No events match.'} <a href="#events" id="clr">Clear filters</a></p>`;
}
$('#prev').onclick=()=>{cal.setMonth(cal.getMonth()-1);renderEvents()};
$('#next').onclick=()=>{cal.setMonth(cal.getMonth()+1);renderEvents()};
$('#calGrid').onclick=e=>{const b=e.target.closest('[data-d]');if(!b)return;selDate=selDate===b.dataset.d?'':b.dataset.d;renderEvents()};
$('#chips').onclick=e=>{const c=e.target.dataset.cat;if(!c)return;selCat=c==='All'?'':c;renderEvents()};
$('#eventList').onclick=e=>{
  const d=e.target.dataset;
  if(e.target.id==='clr'){e.preventDefault();selDate=selCat='';return renderEvents()}
  if(d.rsvp&&needLogin()){const ev=events.find(x=>x.id===d.rsvp),i=ev.rsvps.indexOf(me.id);i<0?ev.rsvps.push(me.id):ev.rsvps.splice(i,1);save();toast(i<0?'RSVP confirmed 🎉':'RSVP cancelled');renderEvents()}
  if(d.delev&&confirm('Delete this event?')){events=events.filter(x=>x.id!==d.delev);save();renderEvents()}
  if(d.ics){const ev=events.find(x=>x.id===d.ics),c=s=>String(s).replace(/[\r\n,;]/g,' ');
    const txt=['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT',`UID:${ev.id}@campushub`,`DTSTART:${ev.date.replace(/-/g,'')}T${ev.time.replace(':','')}00`,`SUMMARY:${c(ev.title)}`,`LOCATION:${c(ev.venue)}`,`DESCRIPTION:${c(ev.desc)}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/calendar'}));a.download=ev.title.replace(/\W+/g,'-')+'.ics';a.click();URL.revokeObjectURL(a.href)}
};
$('#addEvent').onclick=()=>{$('#eventForm [name=date]').min=today();$('#eventDlg').showModal()};
$('#eventForm').onsubmit=e=>{
  e.preventDefault();const f=Object.fromEntries(new FormData(e.target)),err=$('#eventErr');
  if(f.title.trim().length<3)return err.textContent='Title needs at least 3 characters.';
  if(!f.date||f.date<today())return err.textContent='Pick today or a future date.';
  if(!f.time)return err.textContent='Pick a start time.';
  if(!f.venue.trim())return err.textContent='Add a venue.';
  events.push({id:uid(),title:f.title.trim(),date:f.date,time:f.time,venue:f.venue.trim(),cat:f.cat,desc:f.desc.trim(),rsvps:[]});
  save();$('#eventDlg').close();toast('Event published');renderEvents();
};

/* ================= Lost & Found ================= */
function itemCard(i){
  const mine=me&&me.id===i.by,myClaim=me&&claims.find(c=>c.itemId===i.id&&c.by===me.id);
  const btn=i.status==='returned'?'<span class="pill s-returned">Returned ✓</span>'
    :mine?'<span class="hint">Your post</span>'
    :myClaim?`<span class="pill s-${myClaim.status}">Claim ${myClaim.status}</span>`
    :`<button class="btn sm" data-claim="${i.id}">${i.type==='Found'?'This is mine':'I found this'}</button>`;
  return `<article class="tag ${i.type} ${i.status==='returned'?'returned':''}">${i.photo?`<img src="${i.photo}" alt="${esc(i.title)}" loading="lazy">`:'<div class="noimg">No photo</div>'}
  <div class="in"><div class="row"><span class="pill" style="background:var(--c)">${i.type}</span><span class="pill loc">📍 ${esc(i.loc)}</span></div><h3>${esc(i.title)}</h3>
  <p class="hint">${esc(i.cat)} · ${esc(i.date)} · by ${esc(i.byName)}</p><p>${esc(i.desc)}</p>
  <div class="foot">${btn}${mine&&i.status!=='returned'?`<button class="ghost" data-delmine="${i.id}">Delete</button>`:''}</div></div></article>`;
}
function renderItems(){
  const q=$('#q').value.trim().toLowerCase(),t=$('#fType').value,l=$('#fLoc').value,s=$('#fStatus').value;
  const list=items.filter(i=>(!t||i.type===t)&&(!l||i.loc===l)&&(!s||i.status===s)&&(i.title+' '+i.desc+' '+i.cat+' '+i.loc).toLowerCase().includes(q)).sort((a,b)=>b.date.localeCompare(a.date));
  $('#count').textContent=`${list.length} item${list.length===1?'':'s'}`;
  $('#itemGrid').innerHTML=list.length?list.map(itemCard).join(''):'<p class="empty">No items match. Clear a filter, or report the item yourself.</p>';
}
['q','fType','fLoc','fStatus'].forEach(id=>$('#'+id).addEventListener('input',renderItems));
const openItem=()=>{if(!needLogin())return;$('#itemForm [name=date]').max=today();$('#itemDlg').showModal()};
$('#addItem').onclick=openItem;$('#heroAdd').onclick=openItem;
let photoData='';
$('#itemForm [name=photo]').onchange=e=>{
  const f=e.target.files[0],err=$('#itemErr');photoData='';$('#prev-img').hidden=true;if(!f)return;
  if(!f.type.startsWith('image/')){e.target.value='';return err.textContent='Choose an image file.'}
  if(f.size>8e6){e.target.value='';return err.textContent='Image must be under 8 MB.'}
  const r=new FileReader();r.onload=()=>{const im=new Image();im.onerror=()=>err.textContent='Could not read this image.';
    im.onload=()=>{const k=Math.min(1,640/im.width),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k; // shrink so localStorage doesn't overflow
      c.getContext('2d').drawImage(im,0,0,c.width,c.height);photoData=c.toDataURL('image/jpeg',.7);
      $('#prev-img').src=photoData;$('#prev-img').hidden=false;err.textContent=''};im.src=r.result};r.readAsDataURL(f);
};
$('#itemForm').onsubmit=e=>{
  e.preventDefault();const f=Object.fromEntries(new FormData(e.target)),err=$('#itemErr');
  if(f.title.trim().length<3)return err.textContent='Item name needs at least 3 characters.';
  if(!f.date||f.date>today())return err.textContent='Pick a valid date (not in the future).';
  if(f.desc.trim().length<10)return err.textContent='Add a description of at least 10 characters.';
  items.unshift({id:uid(),type:f.type,title:f.title.trim(),cat:f.cat,loc:f.loc,date:f.date,desc:f.desc.trim(),photo:photoData,by:me.id,byName:me.name,status:'open'});
  if(!save()){items.shift();return err.textContent='Storage full. Remove the photo or delete old items.'}
  $('#itemDlg').close();toast('Item posted');renderItems();
};
let claimFor=null;
$('#itemGrid').onclick=e=>{
  const d=e.target.dataset;
  if(d.delmine&&confirm('Delete your post and its claims?')){items=items.filter(i=>i.id!==d.delmine);claims=claims.filter(c=>c.itemId!==d.delmine);save();renderItems();toast('Post deleted')}
  if(d.claim&&needLogin()){claimFor=d.claim;const it=items.find(i=>i.id===claimFor);$('#claimTitle').textContent=(it.type==='Found'?'Claim: ':'I found: ')+it.title;$('#claimDlg').showModal()}
};
$('#claimForm').onsubmit=e=>{
  e.preventDefault();const p=new FormData(e.target).get('proof').trim();
  if(p.length<10)return $('#claimErr').textContent='Write at least 10 characters so the poster can verify you.';
  const it=items.find(i=>i.id===claimFor);
  if(!it||claims.some(c=>c.itemId===claimFor&&c.by===me.id))return $('#claimErr').textContent='You already sent a claim for this item.';
  claims.push({id:uid(),itemId:claimFor,itemTitle:it.title,by:me.id,byName:me.name,proof:p,status:'pending'});
  save();$('#claimDlg').close();toast('Claim sent for verification');renderItems();
};

/* ================= Claim verification workflow ================= */
function decide(id,ok){
  const c=claims.find(x=>x.id===id);if(!c||c.status!=='pending')return;
  const it=items.find(i=>i.id===c.itemId);
  if(!isAdmin()&&(!it||it.by!==me.id))return toast('Only the poster or an admin can decide.');
  c.status=ok?'approved':'rejected';
  if(ok){it.status='returned';claims.filter(x=>x.itemId===c.itemId&&x.id!==id&&x.status==='pending').forEach(x=>x.status='rejected')}
  save();toast(ok?'Claim approved. Item marked returned.':'Claim rejected');render();
}
const claimRow=(c,canDecide)=>`<div class="row-item"><div><strong>${esc(c.itemTitle)}</strong> <span class="pill s-${c.status}">${c.status}</span><br><span class="hint">${esc(c.byName)}: “${esc(c.proof)}”</span></div>
  ${canDecide&&c.status==='pending'?`<div class="row"><button class="btn sm teal" data-ok="${c.id}">Approve</button><button class="ghost" data-no="${c.id}">Reject</button></div>`:''}</div>`;

function renderMine(){
  if(!me)return go('events');
  const myItems=items.filter(i=>i.by===me.id),incoming=claims.filter(c=>myItems.some(i=>i.id===c.itemId)),mine=claims.filter(c=>c.by===me.id),going=events.filter(e=>e.rsvps.includes(me.id));
  $('#mine').innerHTML=`<h1 style="margin-bottom:20px">My activity</h1>
  <div class="sec"><h2>Claims waiting on you</h2>${incoming.length?incoming.map(c=>claimRow(c,true)).join(''):'<p class="hint">No claims on your posts yet.</p>'}</div>
  <div class="sec"><h2>My claims</h2>${mine.length?mine.map(c=>claimRow(c,false)).join(''):'<p class="hint">You have not claimed any item.</p>'}</div>
  <div class="sec"><h2>My reports</h2>${myItems.length?myItems.map(i=>`<div class="row-item"><span><strong>${esc(i.title)}</strong> · ${i.type} · ${esc(i.loc)}</span><span class="pill s-${i.status}">${i.status}</span></div>`).join(''):'<p class="hint">Nothing reported.</p>'}</div>
  <div class="sec"><h2>Events I’m going to</h2>${going.length?going.map(e=>`<div class="row-item"><span><strong>${esc(e.title)}</strong> · ${esc(e.date)} ${esc(e.time)}</span><span class="hint">${esc(e.venue)}</span></div>`).join(''):'<p class="hint">No RSVPs yet.</p>'}</div>`;
}

/* ================= Admin moderation ================= */
function renderAdmin(){
  if(!isAdmin())return go('events');
  $('#admin').innerHTML=`<h1 style="margin-bottom:20px">Admin moderation</h1>
  <div class="stats"><div><strong>${users.length}</strong>Users</div><div><strong>${events.length}</strong>Events</div><div><strong>${items.filter(i=>i.status==='open').length}</strong>Open items</div><div><strong>${claims.filter(c=>c.status==='pending').length}</strong>Pending claims</div></div>
  <div class="sec"><h2>All claims</h2>${claims.length?claims.map(c=>claimRow(c,true)).join(''):'<p class="hint">No claims.</p>'}</div>
  <div class="sec"><h2>All item posts</h2>${items.map(i=>`<div class="row-item"><span><strong>${esc(i.title)}</strong> · ${i.type} · ${esc(i.loc)} · by ${esc(i.byName)}</span><div class="row"><button class="ghost" data-flip="${i.id}">${i.status==='returned'?'Reopen':'Mark returned'}</button><button class="ghost" data-delit="${i.id}">Remove</button></div></div>`).join('')||'<p class="hint">No items.</p>'}</div>`;
}
$('#admin').onclick=e=>{
  const d=e.target.dataset;
  if(d.delit&&confirm('Remove this post and its claims?')){items=items.filter(i=>i.id!==d.delit);claims=claims.filter(c=>c.itemId!==d.delit);save();toast('Post removed');renderAdmin()}
  if(d.flip){const i=items.find(x=>x.id===d.flip);i.status=i.status==='returned'?'open':'returned';save();renderAdmin()}
};

go(location.hash.slice(1)||'events');
