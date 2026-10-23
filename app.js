'use strict';
/* ================= Helpers & storage ================= */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem('ch_'+k))??d}catch{return d}},set:(k,v)=>{try{localStorage.setItem('ch_'+k,JSON.stringify(v));return true}catch{return false}}};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; // local date
const today=()=>iso(new Date());
const fmtDate=d=>new Date(d+'T00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
const fmtTime=t=>{const[h,m]=t.split(':').map(Number);return `${h%12||12}:${pad(m)} ${h<12?'AM':'PM'}`};
const svg=p=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const IC={pin:svg('<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),clock:svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),dl:svg('<path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14"/>'),share:svg('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>'),sun:svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),moon:svg('<path d="M21 13.5A8.5 8.5 0 1 1 10.5 3 6.7 6.7 0 0 0 21 13.5z"/>')};
const LOCS=['Library','Block 34','Block 32','Unipolis','Food Court','Hostel Area','Sports Complex','Main Gate','Other'];
const ICATS=['ID / Cards','Electronics','Bags','Keys','Books','Other'];
const CATS={Tech:'#3b6cf2',Cultural:'#d63f8c',Academic:'#7a4fd6',Sports:'#1f9d55',Career:'#d98a00',Social:'#0F8B8D',Other:'#6b7a8c'};
const CEM={Tech:'💻',Cultural:'🎭',Academic:'📚',Sports:'⚽',Career:'💼',Social:'🎉',Other:'📌'};
async function hash(p){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('campushub|'+p));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch{return btoa(p)}}

/* ---------- Generated item illustrations (no external images needed) ---------- */
const KW=[[/bottle|flask/i,'🍶'],[/calc/i,'🧮'],[/key/i,'🔑'],[/wallet/i,'👛'],[/airdop|earbud|headphone|boat/i,'🎧'],[/bag|backpack/i,'🎒'],[/\bid\b|card|lanyard/i,'🪪'],[/book|textbook/i,'📘'],[/phone/i,'📱'],[/umbrella/i,'☂️'],[/laptop|charger/i,'🔌'],[/watch/i,'⌚'],[/glasses|spectacle/i,'👓'],[/hoodie|jacket/i,'🧥'],[/pen ?drive|usb/i,'💾']];
const CIEM={'ID / Cards':'🪪',Electronics:'🔌',Bags:'🎒',Keys:'🔑',Books:'📚',Other:'📦'};
const GRAD=[['#ff9a5a','#f25c2a'],['#36c4c6','#0f8b8d'],['#7aa2ff','#3b6cf2'],['#c58bff','#7a4fd6'],['#ffcf5a','#d98a00'],['#6fdc9a','#1f9d55']];
function art(i){
  const em=(KW.find(k=>k[0].test(i.title))||[0,CIEM[i.cat]||'📦'])[1],g=GRAD[(ICATS.indexOf(i.cat)+(i.type==='Found'?1:0)+6)%6];
  const s=`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${g[0]}'/><stop offset='1' stop-color='${g[1]}'/></linearGradient></defs><rect width='400' height='300' fill='url(#g)'/><circle cx='340' cy='50' r='95' fill='#fff' opacity='.14'/><circle cx='40' cy='275' r='75' fill='#fff' opacity='.12'/><text x='200' y='190' font-size='120' text-anchor='middle'>${em}</text></svg>`;
  return 'data:image/svg+xml,'+encodeURIComponent(s);
}
const pic=i=>i.photo||art(i);

/* ================= Seed data (Oct → Dec 2026) ================= */
const SEEDV=3,OLD=['Hackathon Kickoff','Cultural Night Auditions','Placement Prep Workshop','Inter-Section Football','Blue water bottle','Casio calculator'];
const E=[ // date, time, title, cat, emoji, venue, desc, capacity, already-going
['2026-10-23','16:00','Freshers Treasure Hunt','Social','🗺️','Unipolis Lawns','Teams of 4 race across campus solving clues. Prizes for the top three.',200,96],
['2026-10-24','11:00','Intro to Generative AI Workshop','Tech','🤖','Block 34, Lab 3','Hands-on session: prompts, APIs and building a small chatbot. Bring a laptop.',60,41],
['2026-10-27','14:30','Resume Clinic with Alumni','Career','💼','Block 32, Room 105','Get your resume reviewed one-on-one by alumni working in industry.',80,52],
['2026-10-29','17:00','Inter-Section Football League','Sports','⚽','Sports Complex','Knockout format. Register your section team at the sports desk.',300,140],
['2026-10-31','19:00','Halloween Costume Night','Social','🎃','Food Court Plaza','Best costume wins a voucher. Music, snacks and a photo booth.',250,170],
['2026-11-02','10:00','Mid-Term Doubt Marathon','Academic','📚','Library Seminar Hall','Faculty and toppers answer doubts subject by subject, all day.',120,64],
['2026-11-04','09:00','Hack the Campus (24h Hackathon)','Tech','🚀','Block 34, Innovation Lab','Build a solution for a real campus problem. Teams of 2–4, mentors on site.',150,118],
['2026-11-06','17:30','Diwali Mela & Rangoli Contest','Cultural','🪔','Central Lawn','Stalls, diyas, rangoli competition and live music.',500,310],
['2026-11-09','10:00','Blood Donation Camp','Social','🩸','Health Centre','Donate and save a life. Light refreshments provided.',150,58],
['2026-11-11','09:30','Campus Placement Drive: Tech Giants','Career','🏢','Block 32 Auditorium','Pre-placement talk followed by an aptitude round. Carry your ID and resume.',400,265],
['2026-11-12','18:00','Open Mic & Poetry Evening','Cultural','🎤','Unipolis Auditorium','Sing, recite, or just listen. Sign-ups open at the door.',220,87],
['2026-11-15','10:00','Cyber Security CTF','Tech','🛡️','Block 34, Lab 1','Beginner-friendly capture-the-flag with web, crypto and forensics challenges.',100,73],
['2026-11-18','15:00','Startup Stories: Founder Talk','Career','🌱','Unipolis Auditorium','Three founders share what worked, what failed, and what they would redo.',300,142],
['2026-11-20','16:00','Inter-University Basketball','Sports','🏀','Indoor Stadium','Quarter-finals. Come cheer for the home team.',200,121],
['2026-11-22','07:00','Sunrise Photography Walk','Social','📸','Campus Loop (Main Gate)','Golden-hour walk with tips from the photography club. Phones welcome.',40,29],
['2026-11-25','14:00','Research Paper Writing Workshop','Academic','🧪','Block 32, Room 210','From idea to submission: structure, citations and avoiding rejection.',70,35],
['2026-11-28','18:30','Battle of Bands','Cultural','🎸','Open Air Theatre','Eight college bands, one stage, one trophy.',600,402],
['2026-12-01','08:00','World AIDS Day Awareness Walk','Social','🎗️','Main Gate','A 3 km awareness walk with the NSS volunteers. T-shirts for the first 200.',300,88],
['2026-12-03','15:00','Web Dev Bootcamp: React Basics','Tech','⚛️','Block 34, Lab 2','Build and deploy a small React app in one afternoon.',50,44],
['2026-12-05','08:00','Annual Sports Meet: Day 1','Sports','🏃','Sports Complex','Track and field heats, long jump and relays.',800,350],
['2026-12-07','09:00','Annual Sports Meet: Finals','Sports','🏆','Sports Complex','Finals, medal ceremony and closing march past.',800,290],
['2026-12-10','17:00','Winter Fest & Food Carnival','Cultural','🍜','Food Court','Food stalls from every region, games and a DJ night.',700,260],
['2026-12-12','10:00','End-Sem Revision Bootcamp','Academic','✍️','Library Seminar Hall','Rapid revision sessions and previous-year paper walkthroughs.',150,96],
['2026-12-15','16:00','Alumni Meet & Mentorship Mixer','Career','🤝','Unipolis','Meet alumni, find a mentor and grow your network.',200,67],
['2026-12-18','18:00','Carol Night & Secret Santa','Social','🎄','Central Lawn','Carols, hot chocolate and a campus-wide Secret Santa.',300,120],
['2026-12-20','15:00','Year-End Demo Day','Tech','🏁','Block 34 Auditorium','Student teams demo their semester projects to faculty and industry guests.',180,75]];
const N=['Aarav Mehta','Priya Nair','Rohan Das','Sneha Kapoor','Vikram Singh','Ananya Rao','Kabir Malhotra','Isha Verma'];
const I=[ // type, title, cat, loc, date, desc, status
['Lost','Black Boat Airdopes case','Electronics','Library','2026-10-20','Matte black charging case with a small scratch on the lid. Left near the 2nd floor study desks.','open'],
['Found','Blue Milton water bottle','Other','Block 32','2026-10-19','Steel bottle with a dent near the base, found in Room 105 after the afternoon class.','open'],
['Lost','Casio fx-991EX calculator','Electronics','Block 34','2026-10-18','Name written on the back in marker. Probably dropped in Lab 3.','open'],
['Found','Set of keys with red tag','Keys','Food Court','2026-10-20','Three keys on a ring with a red tag and a small bottle opener.','open'],
['Lost','Brown leather wallet','ID / Cards','Main Gate','2026-10-17','Contains a college ID and a few cards. Reward for return.','open'],
['Found','Student ID card','ID / Cards','Library','2026-10-21','Found near the issue desk. Name starts with R. Come with your registration number.','open'],
['Lost','Grey Wildcraft backpack','Bags','Sports Complex','2026-10-16','Grey and black bag with a keychain of a football. Contains notebooks.','open'],
['Found','Black folding umbrella','Other','Unipolis','2026-10-15','Left in the auditorium after the cultural rehearsal.','returned'],
['Lost','Engineering Mathematics textbook','Books','Block 32','2026-10-14','Blue cover with sticky notes inside. Name on the first page.','open'],
['Found','iPhone with blue case','Electronics','Food Court','2026-10-21','Found on a table near the juice counter. Lock screen is a mountain photo.','open'],
['Lost','Silver wrist watch','Other','Hostel Area','2026-10-12','Silver analog watch with a black dial, lost near the hostel gym.','open'],
['Found','Prescription glasses','Other','Library','2026-10-13','Black-frame glasses in a brown case, found on the reading hall table.','returned'],
['Lost','Dell 65W laptop charger','Electronics','Block 34','2026-10-19','Black charger with a tape marking on the cable. Left in Lab 2.','open'],
['Found','Navy blue hoodie','Other','Sports Complex','2026-10-18','Size M hoodie with a small logo on the chest, found on the bleachers.','open'],
['Lost','SanDisk 32GB pen drive','Electronics','Block 32','2026-10-11','Red and black pen drive containing project files. Please return it.','open'],
['Found','Keys with a bike remote','Keys','Hostel Area','2026-10-20','Bunch of keys with a bike remote and a small teddy keychain.','open'],
['Lost','Black ID lanyard with card','ID / Cards','Unipolis','2026-10-10','Black lanyard with a student ID attached. Last seen at the auditorium.','returned']];
const ADMIN={id:'admin',name:'Campus Admin',email:'admin@lpu.in',pw:btoa('admin123'),role:'admin'};
let users=store.get('users',[]),events=store.get('events',[]),items=store.get('items',[]),claims=store.get('claims',[]),me=store.get('session',null);
if(!users.some(u=>u.id==='admin'))users.unshift(ADMIN);
if(store.get('seedv',0)<SEEDV){
  events=events.filter(e=>!String(e.id).startsWith('seed')&&!OLD.includes(e.title)).concat(E.map((e,i)=>({id:'seed-e'+i,date:e[0],time:e[1],title:e[2],cat:e[3],em:e[4],venue:e[5],desc:e[6],cap:e[7],base:e[8],rsvps:[]})));
  items=items.filter(i=>!String(i.id).startsWith('seed')&&!OLD.includes(i.title)).concat(I.map((x,i)=>({id:'seed-i'+i,type:x[0],title:x[1],cat:x[2],loc:x[3],date:x[4],desc:x[5],photo:'',by:'seed-u'+(i%8),byName:N[i%8],status:x[6]})));
  claims=claims.filter(c=>items.some(i=>i.id===c.itemId));
  claims.push({id:'seed-c0',itemId:'seed-i5',itemTitle:'Student ID card',by:'seed-u2',byName:'Rohan Das',proof:'My name is Rohan and the ID has a small blue sticker on the back.',status:'pending'});
  store.set('seedv',SEEDV);
}
if(me&&!users.some(u=>u.id===me.id))me=null;
const save=()=>{const ok=[['users',users],['events',events],['items',items],['claims',claims]].every(([k,v])=>store.set(k,v))&&store.set('session',me);if(!ok)toast('Storage is full. Delete old posts or photos.');return ok};
save();
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2800)}
const isAdmin=()=>me&&me.role==='admin';

/* ================= Theme ================= */
function setTheme(t){document.documentElement.dataset.theme=t;$('#theme').innerHTML=t==='dark'?IC.sun:IC.moon;store.set('theme',t)}
setTheme(store.get('theme',matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'));
$('#theme').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');

/* ================= Router ================= */
let view='events',pendingItem=null;
function go(v){
  if(v.startsWith('item-')){pendingItem=v.slice(5);v='items'}
  if(!$('#'+v)||!$('#'+v).classList.contains('view'))v='events';
  if(v==='mine'&&!me){openAuth();v='events'}
  if(v==='admin'&&!isAdmin())v='events';
  view=v;if(location.hash.slice(1)!==v&&!pendingItem)location.hash=v;
  $$('.view').forEach(s=>s.hidden=s.id!==v);
  $('#menu').hidden=true;render();scrollTo(0,0);const sv=$('#'+v);sv.classList.remove('in');void sv.offsetWidth;sv.classList.add('in');
  if(pendingItem){const id=pendingItem;pendingItem=null;showItem(id)}
}
function pendingCount(){if(!me)return 0;return claims.filter(c=>c.status==='pending'&&(isAdmin()||items.some(i=>i.id===c.itemId&&i.by===me.id))).length}
function render(){
  $$('[data-admin]').forEach(e=>e.hidden=!isAdmin());
  $$('[data-auth]').forEach(e=>e.hidden=!me);
  $$('#nav button').forEach(b=>{const on=b.dataset.view===view;b.classList.toggle('on',on);on?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current')});
  const n=pendingCount();$('#bd').hidden=!n;$('#bd').textContent=n;
  $('#authbox').innerHTML=me?`<button class="av" id="avBtn" aria-label="Account menu">${esc(me.name[0].toUpperCase())}</button>`:`<button class="btn sm" id="loginBtn">Log in</button>`;
  $('#fab').hidden=!(view==='items'||view==='events');
  ({events:renderEvents,items:renderItems,mine:renderMine,admin:renderAdmin})[view]();
}
$('#nav').onclick=e=>{const b=e.target.closest('button');if(b)go(b.dataset.view)};
addEventListener('hashchange',()=>{const v=location.hash.slice(1);if(v&&(v!==view||v.startsWith('item-')))go(v)});

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
    u.pw=h;me=u;
  }
  save();$('#authDlg').close();toast('Welcome, '+me.name.split(' ')[0]);render();
};
const needLogin=()=>{if(me)return true;toast('Log in to continue');openAuth();return false};

/* ================= Global clicks ================= */
function openMenu(){const m=$('#menu');if(!m.hidden){m.hidden=true;return}
  m.innerHTML=`<div><strong>${esc(me.name)}</strong><p class="hint">${esc(me.email)} · ${me.role}</p></div><button class="ghost" data-go="mine">My activity</button><button class="ghost" id="logout">Log out</button>`;m.hidden=false}
document.addEventListener('click',e=>{
  const t=e.target,c=s=>t.closest(s);
  if(!c('#menu')&&!c('#avBtn'))$('#menu').hidden=true;
  if(c('#avBtn'))return openMenu();
  if(c('#loginBtn'))return openAuth();
  if(c('#logout')){me=null;save();toast('Logged out');return go('events')}
  if(t.matches('[data-close]'))return t.closest('dialog').close();
  if(t.tagName==='DIALOG')return t.close();
  let b;
  if(b=c('[data-go]'))return go(b.dataset.go);
  if(b=c('[data-ok]'))return decide(b.dataset.ok,true);
  if(b=c('[data-no]'))return decide(b.dataset.no,false);
  if(b=c('[data-claim]'))return claimItem(b.dataset.claim);
  if(b=c('[data-delmine]'))return delItem(b.dataset.delmine);
  if(b=c('[data-share]'))return share(b.dataset.share);
  if(b=c('[data-open]'))return showItem(b.dataset.open);
});
$$('dialog').forEach(dlg=>dlg.addEventListener('close',()=>{
  const f=$('form',dlg);f&&f.reset();$$('.err',dlg).forEach(p=>p.textContent='');
  if(dlg.id==='itemDlg'){photoData='';$('#prev-img').hidden=true}
}));

/* ================= Events + RSVP calendar ================= */
let cal=new Date(),selDate='',selCat='',evText='';cal.setDate(1);
if(cal<new Date('2026-10-01'))cal=new Date('2026-10-01');
$('#itemForm [name=loc]').innerHTML=LOCS.map(l=>`<option>${l}</option>`).join('');
$('#itemForm [name=cat]').innerHTML=ICATS.map(l=>`<option>${l}</option>`).join('');
$('#fLoc').innerHTML='<option value="">All locations</option>'+LOCS.map(l=>`<option>${l}</option>`).join('');
$('#fCat').innerHTML='<option value="">All categories</option>'+ICATS.map(l=>`<option>${l}</option>`).join('');
$('#eventForm [name=cat]').innerHTML=Object.keys(CATS).map(c=>`<option>${c}</option>`).join('');
const evCat=e=>CATS[e.cat]?e.cat:'Other';
const going=e=>(e.base||0)+e.rsvps.length;
function when(date){const n=Math.round((new Date(date+'T00:00')-new Date(today()+'T00:00'))/864e5);return n<0?'Ended':n===0?'Today':n===1?'Tomorrow':n<8?`In ${n} days`:''}
function renderEvents(){
  const t=today(),up=events.filter(e=>e.date>=t);
  $('#hstats').innerHTML=`<div><strong>${up.length}</strong>upcoming events</div><div><strong>${items.filter(i=>i.status==='open').length}</strong>open items</div><div><strong>${items.filter(i=>i.status==='returned').length}</strong>reunited</div>`;
  $('#chips').innerHTML=['All',...Object.keys(CATS)].map(c=>`<button data-cat="${c}" class="${(selCat||'All')===c?'on':''}">${c==='All'?'All':CEM[c]+' '+c}</button>`).join('');
  $('#calTitle').textContent=$('#calMini').textContent=cal.toLocaleString('en',{month:'long',year:'numeric'});
  const y=cal.getFullYear(),m=cal.getMonth(),first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
  let h=['S','M','T','W','T','F','S'].map(d=>`<b>${d}</b>`).join('')+'<span></span>'.repeat(first);
  for(let d=1;d<=days;d++){const ds=`${y}-${pad(m+1)}-${pad(d)}`;
    h+=`<button data-d="${ds}" aria-label="${fmtDate(ds)}" class="${events.some(x=>x.date===ds)?'has ':''}${ds===t?'today ':''}${ds===selDate?'sel':''}">${d}</button>`}
  $('#calGrid').innerHTML=h;
  const q=evText.toLowerCase();
  const list=events.filter(e=>(selDate?e.date===selDate:e.date>=t)&&(!selCat||evCat(e)===selCat)&&(e.title+' '+e.venue+' '+e.desc).toLowerCase().includes(q)).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
  let lastM='',out='';
  list.forEach(e=>{
    const mo=e.date.slice(0,7);if(!selDate&&mo!==lastM){lastM=mo;out+=`<h3 class="mh">${new Date(e.date+'T00:00').toLocaleString('en',{month:'long',year:'numeric'})}</h3>`}
    const c=evCat(e),past=e.date<t,mine=me&&e.rsvps.includes(me.id),n=going(e),full=e.cap&&n>=e.cap,w=when(e.date);
    out+=`<article class="ev ${past?'past':''}" style="--c:${CATS[c]}"><div class="dt"><small>${new Date(e.date+'T00:00').toLocaleString('en',{month:'short'})}</small><strong>${+e.date.slice(8)}</strong></div>
    <div class="eb"><div class="meta"><span class="pill">${c}</span>${w?`<span class="pill when">${w}</span>`:''}${full&&!mine?'<span class="pill s-rejected">Full</span>':''}</div>
    <h3><span aria-hidden="true">${e.em||CEM[c]}</span> ${esc(e.title)}</h3>
    <p class="info">${IC.clock} ${fmtTime(e.time)} <span class="dot">·</span> ${IC.pin} ${esc(e.venue)}</p><p class="ds">${esc(e.desc)}</p></div>
    <div class="act"><div class="gc">${n}${e.cap?' / '+e.cap:''} going${e.cap?`<div class="cap"><i style="width:${Math.min(100,n/e.cap*100)}%"></i></div>`:''}</div><div class="row">${past?'':`<button class="btn sm ${mine?'dark':''}" data-rsvp="${e.id}" ${full&&!mine?'disabled':''}>${mine?'Cancel RSVP':full?'Full':'RSVP'}</button>`}<button class="ghost" data-ics="${e.id}" title="Add to your calendar" aria-label="Add to calendar">${IC.dl} Calendar</button>${isAdmin()?`<button class="ghost" data-delev="${e.id}">Delete</button>`:''}</div></div></article>`;
  });
  $('#eventList').innerHTML=out||`<p class="card empty">${selDate?'No events on this date.':'No events match.'} <a href="#events" id="clr">Clear filters</a></p>`;
}
$('#prev').onclick=()=>{cal.setMonth(cal.getMonth()-1);renderEvents()};
$('#next').onclick=()=>{cal.setMonth(cal.getMonth()+1);renderEvents()};
$('#calToggle').onclick=()=>{const c=$('#cal');c.classList.toggle('open');$('#calToggle').setAttribute('aria-expanded',c.classList.contains('open'))};
$('#calGrid').onclick=e=>{const b=e.target.closest('[data-d]');if(!b)return;selDate=selDate===b.dataset.d?'':b.dataset.d;renderEvents();if(selDate&&innerWidth<=860)$('#eventList').scrollIntoView({behavior:'smooth',block:'start'})};
$('#chips').onclick=e=>{const c=e.target.dataset.cat;if(!c)return;selCat=c==='All'?'':c;renderEvents()};
$('#evq').oninput=e=>{evText=e.target.value.trim();renderEvents()};
$('#eventList').onclick=e=>{
  const b=e.target.closest('button'),d=b?b.dataset:{};
  if(e.target.id==='clr'){e.preventDefault();selDate=selCat=evText='';$('#evq').value='';return renderEvents()}
  if(d.rsvp&&needLogin()){const ev=events.find(x=>x.id===d.rsvp),i=ev.rsvps.indexOf(me.id);
    if(i<0&&ev.cap&&going(ev)>=ev.cap)return toast('Sorry, this event is full');
    i<0?ev.rsvps.push(me.id):ev.rsvps.splice(i,1);save();toast(i<0?'RSVP confirmed 🎉':'RSVP cancelled');renderEvents()}
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
  const cap=parseInt(f.cap,10);if(f.cap&&(!(cap>0)))return err.textContent='Capacity must be a positive number.';
  events.push({id:uid(),title:f.title.trim(),date:f.date,time:f.time,venue:f.venue.trim(),cat:f.cat,desc:f.desc.trim(),cap:cap||0,base:0,rsvps:[]});
  save();$('#eventDlg').close();toast('Event published');renderEvents();
};

/* ================= Lost & Found ================= */
let segT='';
function itemCard(i){
  const mine=me&&me.id===i.by,myClaim=me&&claims.find(c=>c.itemId===i.id&&c.by===me.id);
  const btn=i.status==='returned'?'<span class="hint" style="margin:0">Reunited with its owner</span>'
    :mine?'<span class="hint">Your post</span>'
    :myClaim?`<span class="pill s-${myClaim.status}">Claim ${myClaim.status}</span>`
    :`<button class="btn sm" data-claim="${i.id}">${i.type==='Found'?'This is mine':'I found this'}</button>`;
  return `<article class="tag ${i.type} ${i.status==='returned'?'returned':''}" data-open="${i.id}" tabindex="0" role="button" aria-label="${esc(i.title)}, details"><div class="ph"><img src="${pic(i)}" alt="${esc(i.title)}" loading="lazy"><span class="pill b1" style="background:var(--c)">${i.type}</span>${i.status==='returned'?'<span class="rib">Returned</span>':''}</div>
  <div class="in"><h3>${esc(i.title)}</h3><p class="info">${IC.pin} ${esc(i.loc)} <span class="dot">·</span> ${fmtDate(i.date)}</p><p class="clamp ds">${esc(i.desc)}</p>
  <div class="foot">${btn}</div></div></article>`;
}
function renderItems(){
  const q=$('#q').value.trim().toLowerCase(),c=$('#fCat').value,l=$('#fLoc').value,s=$('#fStatus').value,o=$('#fSort').value;
  const list=items.filter(i=>(!segT||i.type===segT)&&(!c||i.cat===c)&&(!l||i.loc===l)&&(!s||i.status===s)&&(i.title+' '+i.desc+' '+i.cat+' '+i.loc).toLowerCase().includes(q)).sort((a,b)=>o==='old'?a.date.localeCompare(b.date):b.date.localeCompare(a.date));
  $$('#seg button').forEach(b=>b.classList.toggle('on',b.dataset.t===segT));
  $('#count').textContent=`${list.length} item${list.length===1?'':'s'}`;
  $('#itemGrid').innerHTML=list.length?list.map(itemCard).join(''):'<p class="empty">No items match. Clear a filter, or report the item yourself.</p>';
}
$('#seg').onclick=e=>{if(e.target.dataset.t!==undefined){segT=e.target.dataset.t;renderItems()}};
['q','fCat','fLoc','fStatus','fSort'].forEach(id=>$('#'+id).addEventListener('input',renderItems));
$('#itemGrid').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.dataset.open){e.preventDefault();showItem(e.target.dataset.open)}});
const openItem=()=>{if(!needLogin())return;$('#itemForm [name=date]').max=today();$('#itemDlg').showModal()};
$('#addItem').onclick=openItem;$('#heroAdd').onclick=openItem;$('#fab').onclick=openItem;

/* ---------- Item detail + possible matches ---------- */
function matches(it){
  const w=s=>new Set(s.toLowerCase().split(/\W+/).filter(x=>x.length>3));
  const a=w(it.title);
  return items.filter(o=>o.id!==it.id&&o.type!==it.type&&o.status==='open'&&o.cat===it.cat)
    .map(o=>({o,s:(o.loc===it.loc?2:0)+[...w(o.title)].filter(x=>a.has(x)).length*2+1})).sort((x,y)=>y.s-x.s).slice(0,4).map(x=>x.o);
}
function showItem(id){
  const it=items.find(i=>i.id===id);if(!it)return toast('This item is no longer available');
  const mine=me&&me.id===it.by,myClaim=me&&claims.find(c=>c.itemId===id&&c.by===me.id),nc=claims.filter(c=>c.itemId===id).length,mt=it.status==='open'?matches(it):[];
  const act=it.status==='returned'?'<span class="pill s-returned">Returned ✓</span>':mine?'<span class="hint">This is your post</span>':myClaim?`<span class="pill s-${myClaim.status}">Your claim: ${myClaim.status}</span>`:`<button class="btn" data-claim="${id}">${it.type==='Found'?'This is mine':'I found this'}</button>`;
  $('#viewBody').className='iv';
  $('#viewBody').innerHTML=`<img class="big" src="${pic(it)}" alt="${esc(it.title)}"><div class="pad">
  <div class="row"><span class="pill" style="background:${it.type==='Lost'?'var(--lost)':'var(--found)'}">${it.type}</span><span class="pill loc">📍 ${esc(it.loc)}</span><span class="pill loc">${esc(it.cat)}</span></div>
  <h2>${esc(it.title)}</h2><p style="margin:0">${esc(it.desc)}</p>
  <ul class="tl"><li>${it.type==='Lost'?'Lost':'Found'} on ${fmtDate(it.date)}</li><li>Posted by ${esc(it.byName)}</li><li>${nc} claim${nc===1?'':'s'} so far${it.status==='returned'?' · returned to owner':''}</li></ul>
  ${mt.length?`<div><strong>Possible matches</strong><div class="mt" style="margin-top:8px">${mt.map(m=>`<button data-open="${m.id}"><img src="${pic(m)}" alt=""><span>${esc(m.title)}<br><small>${m.type} · ${esc(m.loc)}</small></span></button>`).join('')}</div></div>`:''}
  <div class="row">${act}<button class="ghost" data-share="${id}">${IC.share} Share</button>${mine&&it.status!=='returned'?`<button class="ghost" data-delmine="${id}">Delete</button>`:''}<button class="ghost" data-close>Close</button></div></div>`;
  if(!$('#viewDlg').open)$('#viewDlg').showModal();$('#viewDlg').scrollTop=0;
}
async function share(id){
  const it=items.find(i=>i.id===id),url=location.href.split('#')[0]+'#item-'+id,text=`${it.type}: ${it.title} at ${it.loc}`;
  try{if(navigator.share)return await navigator.share({title:'Campus Hub',text,url});await navigator.clipboard.writeText(url);toast('Link copied')}catch{if(!navigator.share)toast('Could not copy link')}
}
function delItem(id){if(!confirm('Delete your post and its claims?'))return;items=items.filter(i=>i.id!==id);claims=claims.filter(c=>c.itemId!==id);save();$('#viewDlg').close();toast('Post deleted');render()}

/* ---------- Photo upload + new item ---------- */
let photoData='';
$('#itemForm [name=photo]').onchange=e=>{
  const f=e.target.files[0],err=$('#itemErr');photoData='';$('#prev-img').hidden=true;if(!f)return;
  if(!f.type.startsWith('image/')){e.target.value='';return err.textContent='Choose an image file.'}
  if(f.size>8e6){e.target.value='';return err.textContent='Image must be under 8 MB.'}
  const r=new FileReader();r.onload=()=>{const im=new Image();im.onerror=()=>err.textContent='Could not read this image.';
    im.onload=()=>{const k=Math.min(1,640/im.width),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;
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
  $('#itemDlg').close();toast('Item posted');if(view!=='items')go('items');else render();
};

/* ---------- Claims ---------- */
let claimFor=null;
function claimItem(id){if(!needLogin())return;claimFor=id;const it=items.find(i=>i.id===id);if(!it)return;
  $('#viewDlg').close();$('#claimTitle').textContent=(it.type==='Found'?'Claim: ':'I found: ')+it.title;$('#claimDlg').showModal()}
$('#claimForm').onsubmit=e=>{
  e.preventDefault();const p=new FormData(e.target).get('proof').trim();
  if(p.length<10)return $('#claimErr').textContent='Write at least 10 characters so the poster can verify you.';
  const it=items.find(i=>i.id===claimFor);
  if(!it||claims.some(c=>c.itemId===claimFor&&c.by===me.id))return $('#claimErr').textContent='You already sent a claim for this item.';
  claims.push({id:uid(),itemId:claimFor,itemTitle:it.title,by:me.id,byName:me.name,proof:p,status:'pending'});
  save();$('#claimDlg').close();toast('Claim sent for verification');render();
};
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

/* ================= My activity ================= */
function renderMine(){
  if(!me)return go('events');
  const myItems=items.filter(i=>i.by===me.id),incoming=claims.filter(c=>myItems.some(i=>i.id===c.itemId)),mine=claims.filter(c=>c.by===me.id),goingTo=events.filter(e=>e.rsvps.includes(me.id)).sort((a,b)=>a.date.localeCompare(b.date));
  $('#mine').innerHTML=`<h1 style="margin-bottom:20px">My activity</h1>
  <div class="sec"><h2>Claims waiting on you</h2>${incoming.length?incoming.map(c=>claimRow(c,true)).join(''):'<p class="hint">No claims on your posts yet.</p>'}</div>
  <div class="sec"><h2>My claims</h2>${mine.length?mine.map(c=>claimRow(c,false)).join(''):'<p class="hint">You have not claimed any item.</p>'}</div>
  <div class="sec"><h2>My reports</h2>${myItems.length?myItems.map(i=>`<div class="row-item" data-open="${i.id}" style="cursor:pointer"><span><strong>${esc(i.title)}</strong> · ${i.type} · ${esc(i.loc)}</span><span class="pill s-${i.status}">${i.status}</span></div>`).join(''):'<p class="hint">Nothing reported yet.</p>'}</div>
  <div class="sec"><h2>Events I’m going to</h2>${goingTo.length?goingTo.map(e=>`<div class="row-item"><span><strong>${esc(e.title)}</strong> · ${fmtDate(e.date)} ${fmtTime(e.time)}</span><span class="hint">${esc(e.venue)}</span></div>`).join(''):'<p class="hint">No RSVPs yet.</p>'}</div>`;
}

/* ================= Admin ================= */
const bars=(o,c)=>{const m=Math.max(1,...Object.values(o));return Object.entries(o).map(([k,v])=>`<div class="br"><span>${esc(k)}</span><div><i style="width:${v/m*100}%;background:${c}"></i></div><b>${v}</b></div>`).join('')};
function renderAdmin(){
  if(!isAdmin())return go('events');
  const byCat={};ICATS.forEach(c=>byCat[c]=items.filter(i=>i.cat===c).length);
  const byMon={};events.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(e=>{const k=new Date(e.date+'T00:00').toLocaleString('en',{month:'short'});byMon[k]=(byMon[k]||0)+1});
  $('#admin').innerHTML=`<h1 style="margin-bottom:20px">Admin moderation</h1>
  <div class="stats"><div><strong>${users.length}</strong>Users</div><div><strong>${events.length}</strong>Events</div><div><strong>${items.filter(i=>i.status==='open').length}</strong>Open items</div><div><strong>${claims.filter(c=>c.status==='pending').length}</strong>Pending claims</div></div>
  <div class="charts"><div class="card"><h2 style="font-size:1.1rem;margin-bottom:8px">Items by category</h2>${bars(byCat,'var(--accent)')}</div><div class="card"><h2 style="font-size:1.1rem;margin-bottom:8px">Events per month</h2>${bars(byMon,'var(--teal)')}</div></div>
  <div class="sec"><h2>All claims</h2>${claims.length?claims.map(c=>claimRow(c,true)).join(''):'<p class="hint">No claims.</p>'}</div>
  <div class="sec"><h2>All item posts</h2>${items.map(i=>`<div class="row-item"><span><strong>${esc(i.title)}</strong> · ${i.type} · ${esc(i.loc)} · ${esc(i.byName)}</span><div class="row"><button class="ghost" data-flip="${i.id}">${i.status==='returned'?'Reopen':'Mark returned'}</button><button class="ghost" data-delit="${i.id}">Remove</button></div></div>`).join('')||'<p class="hint">No items.</p>'}</div>
  <div class="sec"><h2>Data tools</h2><div class="row"><button class="ghost" id="exp">⬇ Export data (JSON)</button><button class="ghost" id="rst">♻ Reset demo data</button></div></div>`;
}
$('#admin').onclick=e=>{
  const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.delit&&confirm('Remove this post and its claims?')){items=items.filter(i=>i.id!==d.delit);claims=claims.filter(c=>c.itemId!==d.delit);save();toast('Post removed');render()}
  if(d.flip){const i=items.find(x=>x.id===d.flip);i.status=i.status==='returned'?'open':'returned';save();render()}
  if(b.id==='exp'){const j=JSON.stringify({users:users.map(({pw,...u})=>u),events,items:items.map(i=>({...i,photo:i.photo?'[image]':''})),claims},null,2);
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([j],{type:'application/json'}));a.download='campus-hub-data.json';a.click();URL.revokeObjectURL(a.href)}
  if(b.id==='rst'&&confirm('Delete ALL data in this browser and restore the demo data?')){Object.keys(localStorage).filter(k=>k.startsWith('ch_')&&k!=='ch_theme').forEach(k=>localStorage.removeItem(k));location.reload()}
};

/* ================= Developer info ================= */
const DEV={name:'Sreya R K',role:'Developer & Designer',github:'',linkedin:'',email:''}; // add your links here
$('#devBody').innerHTML=`<div class="dav" aria-hidden="true">${esc(DEV.name[0])}</div><h2>${esc(DEV.name)}</h2><span class="pill s-open">${esc(DEV.role)}</span>
<p>Designed and built Campus Hub end to end: the interface, the calendar and RSVP logic, the lost-and-found claim workflow, and the admin tools.</p>
<div class="tech"><span class="pill when">HTML5</span><span class="pill when">CSS3</span><span class="pill when">JavaScript</span><span class="pill when">PWA</span></div>
<div class="links">${DEV.github?`<a class="ghost" href="${esc(DEV.github)}" target="_blank" rel="noopener">GitHub</a>`:''}${DEV.linkedin?`<a class="ghost" href="${esc(DEV.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`:''}${DEV.email?`<a class="ghost" href="mailto:${esc(DEV.email)}">Email</a>`:''}<button class="ghost" data-close>Close</button></div>`;
$('#devBtn').onclick=()=>$('#devDlg').showModal();

if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
go(location.hash.slice(1)||'events');
