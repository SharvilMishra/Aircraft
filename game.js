/* ================================================================
   VOID STRIKER — Game Logic (Firebase + Engine + UI)
   ================================================================ */

const $=id=>document.getElementById(id);

/* ===== FIREBASE — Fill your config below ===== */
const FB_CONFIG={apiKey:"AIzaSyA_iRPCBRmeAs0_LHpTKpB2qhDy1LpwkRk",authDomain:"aircraft-eadb0.firebaseapp.com",projectId:"aircraft-eadb0",storageBucket:"aircraft-eadb0.firebasestorage.app",messagingSenderId:"792879773504",appId:"1:792879773504:web:5a87c70e536f13713eeca5"};
let fbApp,fbAuth,fbFS,fbReady=false;
function ldScript(src){return new Promise((r,j)=>{const s=document.createElement('script');s.src=src;s.onload=r;s.onerror=j;document.head.appendChild(s)})}
async function loadFirebase(){
  if(!FB_CONFIG.apiKey)return;
  try{
    await ldScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
    await ldScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js');
    await ldScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js');
    fbApp=firebase.initializeApp(FB_CONFIG);fbAuth=firebase.auth();fbFS=firebase.firestore();fbReady=true;
  }catch(e){console.warn('Firebase unavailable:',e)}
}
async function cloudSave(){
  if(!fbReady||!fbAuth.currentUser)return;
  try{await fbFS.collection('players').doc(fbAuth.currentUser.uid).set({...P,lastLogin:Date.now()})}catch(e){}
}
async function cloudLoad(){
  if(!fbReady||!fbAuth.currentUser)return null;
  try{const d=await fbFS.collection('players').doc(fbAuth.currentUser.uid).get();return d.exists?d.data():null}catch(e){return null}
}

/* ===== CONFIG ===== */
const CFG={MAX_LVL:10,STAGES:5,
  REWARDS:[{min:0,max:2,base:100,bM:50},{min:3,max:5,base:150,bM:75},{min:6,max:8,base:200,bM:100},{min:9,max:10,base:250,bM:50}],
  NO_HIT:50,SPD_B:25,BUFF_DR:.25,BUFF_DUR:4000,P_HP:100,P_DMG:10,P_FR:180,P_SPD:5,INV:1000};

/* ===== AIRCRAFT ===== */
const SHIPS=[
  {id:0,name:'Starter Craft',cost:0,dmg:1,fr:1,hp:1,spd:1,color:'#00e5ff',accent:'#0091ea',ability:'None',desc:'Reliable all-rounder for new pilots.'},
  {id:1,name:'Plasma Interceptor',cost:1000,dmg:1.2,fr:1.15,hp:1.1,spd:1.15,color:'#00e676',accent:'#00c853',ability:'Energy Burst',desc:'Fast and agile with energy burst.'},
  {id:2,name:'Quantum Striker',cost:2500,dmg:1.5,fr:1.3,hp:1.2,spd:1.1,color:'#d500f9',accent:'#aa00ff',ability:'Quantum Phasing',desc:'High damage with phasing defense.'},
  {id:3,name:'Apex Destroyer',cost:5000,dmg:1.8,fr:1.5,hp:1.4,spd:0.95,color:'#ff6d00',accent:'#e65100',ability:'Shield Projection',desc:'Heavy firepower with shield.'},
  {id:4,name:'Celestial Titan',cost:10000,dmg:2.2,fr:1.8,hp:1.6,spd:0.85,color:'#ffd740',accent:'#ffab00',ability:'Black Hole Pulse',desc:'Ultimate warship, devastating power.'}
];

/* ===== ENEMY DEFINITIONS ===== */
const ED={basic:{sp:2,sz:14,col:'#ff5252',sh:false,sc:10},zigzag:{sp:1.5,sz:14,col:'#e040fb',sh:false,sc:15,amp:50,fr:.03},
  shooter:{sp:1.2,sz:18,col:'#ff6e40',sh:true,fR:2200,sc:25},tank:{sp:.8,sz:24,col:'#ff1744',sh:false,sc:30},
  boss:{sp:.4,sz:50,col:'#d50000',sh:true,fR:900,sc:200}};

/* ===== AUDIO ENGINE ===== */
class Sfx{
  constructor(){this.on=true;this.c=null}
  init(){if(this.c)return;try{this.c=new(window.AudioContext||window.webkitAudioContext)}catch(e){}}
  play(t){
    if(!this.on||!this.c)return;try{
    const c=this.c,n=c.currentTime,o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);
    const D={shoot:['square',880,440,.06,.07],hit:['sawtooth',200,80,.1,.09],explode:['sawtooth',150,30,.25,.13],
      buff:['sine',523,784,.25,.09],phit:['square',120,40,.2,.13],win:['sine',523,1047,.55,.09],fail:['sawtooth',300,80,.5,.11]};
    const s=D[t];if(!s)return;o.type=s[0];o.frequency.setValueAtTime(s[1],n);o.frequency.exponentialRampToValueAtTime(s[2],n+s[3]);
    g.gain.setValueAtTime(s[4],n);g.gain.exponentialRampToValueAtTime(.001,n+s[3]);
    if(t==='win')[523,659,784,1047].forEach((f,i)=>o.frequency.setValueAtTime(f,n+i*.12));
    o.start(n);o.stop(n+s[3])}catch(e){}}
}
const sfx=new Sfx();

/* ===== STARFIELD BACKGROUND ===== */
class StarsBG{
  constructor(cv){this.c=cv;this.x=cv.getContext('2d');this.s=[];this.rs();
    for(let l=0;l<3;l++)for(let i=0;i<40;i++)this.s.push({x:Math.random()*this.w,y:Math.random()*this.h,r:Math.random()*(.5+l*.6)+.3,v:.15+l*.25,a:Math.random()*.5+.2+l*.15})}
  rs(){this.w=this.c.width=innerWidth;this.h=this.c.height=innerHeight}
  up(dt){this.x.clearRect(0,0,this.w,this.h);for(const s of this.s){s.y+=s.v*dt*60;if(s.y>this.h){s.y=0;s.x=Math.random()*this.w}this.x.globalAlpha=s.a;this.x.fillStyle='#c8c8e8';this.x.beginPath();this.x.arc(s.x,s.y,s.r,0,6.28);this.x.fill()}this.x.globalAlpha=1}
}

/* ===== TOAST ===== */
let _tt;function toast(m,c){const t=$('toast');t.textContent=m;t.style.borderColor=c||'#535c91';t.classList.add('show');clearTimeout(_tt);_tt=setTimeout(()=>t.classList.remove('show'),2200)}

/* ===== SCREEN MANAGER ===== */
let curScr='login-screen';
function showScr(id){const c=$(curScr);if(c)c.classList.add('fading');setTimeout(()=>{if(c)c.classList.remove('active','fading');const n=$(id);if(n)n.classList.add('active');curScr=id},180)}

/* ===== PERSISTENCE ===== */
function defP(){return{name:'Pilot',email:'',level:0,stage:0,cash:0,totalCash:0,cleared:0,owned:[0],sel:0,created:Date.now(),lastLogin:Date.now()}}
function loadP(){try{const d=JSON.parse(localStorage.getItem('vs_p'));if(d&&d.email)return d}catch(e){}return defP()}
function saveP(){localStorage.setItem('vs_p',JSON.stringify(P))}
let P=loadP();

/* ===== AUTH ===== */
async function authOK(user,name){
  sfx.init();if(name)P.name=name;if(user&&user.email)P.email=user.email;
  P.lastLogin=Date.now();if(!P.created)P.created=Date.now();saveP();
  const cl=await cloudLoad();if(cl){Object.assign(P,cl);saveP()}refreshDash();showScr('dashboard-screen');
}
async function doLogin(e,p,n){
  sfx.init();if(fbReady){try{const r=await fbAuth.signInWithEmailAndPassword(e,p);await authOK(r.user,n);return}catch(x){toast(x.message,'var(--danger)');return}}
  P.email=e;P.name=n||e.split('@')[0];P.lastLogin=Date.now();if(!P.created)P.created=Date.now();saveP();refreshDash();showScr('dashboard-screen');
}
async function doReg(e,p,n){
  sfx.init();if(fbReady){try{const r=await fbAuth.createUserWithEmailAndPassword(e,p);await r.user.updateProfile({displayName:n});await authOK(r.user,n);return}catch(x){toast(x.message,'var(--danger)');return}}
  P.email=e;P.name=n;P.created=Date.now();P.lastLogin=Date.now();saveP();refreshDash();showScr('dashboard-screen');
}
async function doGoogle(){
  sfx.init();if(fbReady){try{await fbAuth.signInWithRedirect(new firebase.auth.GoogleAuthProvider())}catch(e){toast(e.message,'var(--danger)')}}
  else{P.email='pilot@local';P.name='Local Pilot';P.created=Date.now();saveP();refreshDash();showScr('dashboard-screen')}
}
async function doLogout(){if(fbReady)try{await fbAuth.signOut()}catch(e){}P=defP();saveP();showScr('login-screen')}

/* ===== REWARD CALC ===== */
function calcReward(l,hit,ms){
  const t=CFG.REWARDS.find(r=>l>=r.min&&l<=r.max)||CFG.REWARDS[0];
  let rw=t.base+Math.floor(Math.random()*(t.bM+1)),b=[{l:'Base Reward',a:t.base}];
  const rb=rw-t.base;if(rb>0)b.push({l:'Bonus',a:rb});
  if(hit===0){rw+=CFG.NO_HIT;b.push({l:'No Hit Bonus',a:CFG.NO_HIT})}
  if(ms<30000){rw+=CFG.SPD_B;b.push({l:'Speed Clear',a:CFG.SPD_B})}
  return{reward:rw,bonuses:b};
}

/* ===== WAVE GENERATION ===== */
function getWaves(lv,st){
  const d=lv+st*.2,w=[];const wc=st===4?4:3;
  for(let i=0;i<wc;i++){
    const boss=st===4&&i===3,en=[];
    if(boss){en.push({t:'boss',hp:Math.floor(20+lv*12)});for(let j=0;j<2+Math.floor(lv/3);j++)en.push({t:'basic',hp:Math.floor(1+d*.3)})}
    else{const cnt=3+Math.floor(d*.7)+i,types=['basic'];if(lv>=2)types.push('zigzag');if(lv>=4)types.push('shooter');if(lv>=6)types.push('tank');
      for(let j=0;j<cnt;j++){const t=types[Math.floor(Math.random()*types.length)];en.push({t,hp:Math.floor(({basic:1,zigzag:1,shooter:2,tank:4})[t]*(1+d*.3))})}}
    w.push(en);
  }return w;
}

/* ===== UI REFRESH ===== */
function refreshDash(){
  const s=P.name?P.name[0].toUpperCase():'P';
  $('profile-avatar').textContent=s;$('profile-avatar-lg').textContent=s;
  $('profile-name').textContent=P.name;$('profile-name-lg').textContent=P.name;
  $('profile-level').textContent=P.level;$('profile-stage').textContent=P.stage+1;
  $('profile-cash').textContent=P.cash.toLocaleString();$('stat-stages').textContent=P.cleared;
  $('stat-cash-earned').textContent=P.totalCash.toLocaleString();$('stat-aircraft').textContent=P.owned.length;
  $('prof-level').textContent=P.level;$('prof-cash').textContent=P.cash.toLocaleString();$('prof-stages').textContent=P.cleared;
  $('settings-email').textContent=P.email||'Local';$('settings-created').textContent=P.created?new Date(P.created).toLocaleDateString():'—';
  const done=P.level>CFG.MAX_LVL||(P.level===CFG.MAX_LVL&&P.stage>=CFG.STAGES);
  $('btn-continue').innerHTML=done?'<i class="fas fa-trophy"></i> ALL COMPLETE':'<i class="fas fa-play"></i> CONTINUE MISSION';
  $('btn-continue').style.opacity=done?.5:1;
}

function renderLevels(){
  const c=$('level-list');c.innerHTML='';
  for(let l=0;l<=CFG.MAX_LVL;l++){
    const unlocked=l<=P.level,completed=l<P.level;
    const dl=l<=2?'Easy':l<=5?'Medium':l<=8?'Hard':'Expert';
    const dc=l<=2?'text-success':l<=5?'text-gold':l<=8?'text-orange-400':'text-danger';
    let dots='';for(let s=0;s<CFG.STAGES;s++){
      let cl='stage-dot';if(completed||(l===P.level&&s<P.stage))cl+=' completed';
      else if(l===P.level&&s===P.stage)cl+=' current';else cl+=' locked';
      dots+=`<div class="stage-dot ${cl}" data-l="${l}" data-s="${s}"></div>`;
    }
    c.innerHTML+=`<div class="glass p-4 level-card ${unlocked?'':'opacity-40 pointer-events-none'}" data-l="${l}">
      <div class="flex items-center justify-between mb-2"><div>
        <p class="font-display font-bold text-base ${completed?'text-success':unlocked?'text-accent':'text-mauve'}">LEVEL ${l}</p>
        <p class="text-xs ${dc}">${dl}</p></div>${completed?'<i class="fas fa-check-circle text-success"></i>':''}</div>
      <div class="flex gap-2 items-center">${dots}</div></div>`;
  }
  c.querySelectorAll('.stage-dot:not(.locked)').forEach(d=>d.addEventListener('click',e=>{e.stopPropagation();showPrestage(+d.dataset.l,+d.dataset.s)}));
  c.querySelectorAll('.level-card').forEach(cd=>cd.addEventListener('click',()=>{const l=+cd.dataset.l;if(l<P.level)showPrestage(l,0);else if(l===P.level)showPrestage(l,P.stage)}));
}

function renderHangar(){
  const c=$('aircraft-list');c.innerHTML='';$('hangar-cash').textContent=P.cash.toLocaleString();
  const mx={dmg:2.2,fr:1.8,hp:1.6,spd:1.15};
  SHIPS.forEach((s,i)=>{
    const own=P.owned.includes(i),sel=P.sel===i,buy=!own&&P.cash>=s.cost;
    c.innerHTML+=`<div class="aircraft-card glass p-4 ${sel?'selected':''} ${!own?'locked':''}" data-i="${i}">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-12 h-12 rounded-lg flex items-center justify-center" style="background:${s.color}22;border:1px solid ${s.color}44">
          <i class="fas fa-jet-fighter text-xl" style="color:${s.color}"></i></div>
        <div class="flex-1"><p class="font-display font-bold text-sm" style="color:${s.color}">${s.name}</p>
          <p class="text-xs text-mauve">${s.ability}</p></div>
        ${sel?'<span class="font-display text-xs font-bold text-accent">ACTIVE</span>':''}</div>
      <p class="text-xs text-mauve mb-3">${s.desc}</p>
      <div class="grid grid-cols-4 gap-2 mb-3">${['dmg','fr','hp','spd'].map(k=>{
        const lb={dmg:'DMG',fr:'RATE',hp:'HP',spd:'SPD'}[k],cl={dmg:'bg-red-500',fr:'bg-yellow-400',hp:'bg-green-500',spd:'bg-cyan-400'}[k];
        return`<div><p class="text-xs text-mauve mb-1">${lb}</p><div class="stat-bar"><div class="stat-fill ${cl}" style="width:${Math.min(100,s[k]/mx[k]*100)}%"></div></div></div>`}).join('')}</div>
      ${!own?`<button class="btn-gold w-full text-xs ${buy?'':'opacity-40 pointer-events-none'}" data-buy="${i}"><i class="fas fa-lock-open mr-1"></i>UNLOCK — ${s.cost.toLocaleString()}</button>`:''}
      ${own&&!sel?`<button class="btn-secondary w-full text-xs" data-sel="${i}">SELECT</button>`:''}</div>`;
  });
  c.querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const i=+b.dataset.buy;if(P.cash>=SHIPS[i].cost){P.cash-=SHIPS[i].cost;P.owned.push(i);P.sel=i;saveP();cloudSave();renderHangar();refreshDash();toast(SHIPS[i].name+' unlocked!','var(--success)')}}));
  c.querySelectorAll('[data-sel]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();P.sel=+b.dataset.sel;saveP();cloudSave();renderHangar();toast('Aircraft selected','var(--accent)')}));
}

function renderProfProg(){
  const c=$('profile-progress');c.innerHTML='';
  for(let l=0;l<=Math.min(P.level,CFG.MAX_LVL);l++){
    const d=l<P.level?CFG.STAGES:P.stage,pct=d/CFG.STAGES*100;
    c.innerHTML+=`<div class="flex items-center gap-3"><span class="font-display text-xs font-bold w-14 text-mauve">LVL ${l}</span>
      <div class="flex-1 stat-bar"><div class="stat-fill bg-cyan-400" style="width:${pct}%"></div></div>
      <span class="text-xs text-lavender">${d}/${CFG.STAGES}</span></div>`;
  }
}

let pLvl=0,pStg=0;
function showPrestage(l,s){
  pLvl=l;pStg=s;const sh=SHIPS[P.sel];
  $('prestage-title').textContent=`Level ${l} — Stage ${s+1}`;$('prestage-ship-name').textContent=sh.name;
  $('prestat-dmg').textContent=sh.dmg+'x';$('prestat-fr').textContent=sh.fr+'x';$('prestat-hp').textContent=sh.hp+'x';$('prestat-spd').textContent=sh.spd+'x';
  const t=CFG.REWARDS.find(r=>l>=r.min&&l<=r.max)||CFG.REWARDS[0];
  $('prestage-reward').textContent=`${t.base} — ${t.base+t.bM+CFG.NO_HIT+CFG.SPD_B}`;
  const cv=$('prestage-ship'),cx=cv.getContext('2d');cx.clearRect(0,0,120,120);drawShip(cx,60,55,2.5,sh.color,sh.accent);
  showScr('pre-stage-screen');
}
function showComplete(l,s,rw,bn){
  $('complete-stage-name').textContent=`Level ${l} — Stage ${s+1}`;$('complete-reward').textContent='+'+rw;
  const bc=$('complete-bonuses');bc.innerHTML='';bn.forEach(b=>{bc.innerHTML+=`<div class="flex justify-between text-mauve"><span>${b.l}</span><span class="text-gold font-display font-bold">+${b.a}</span></div>`});
  $('btn-next-stage').style.display=(l===CFG.MAX_LVL&&s===CFG.STAGES-1)?'none':'flex';showScr('stage-complete-screen');
}
function showFail(r){$('fail-reason').textContent=r;showScr('stage-failed-screen')}

/* ===== SHIP DRAWING ===== */
function drawShip(ctx,x,y,sc,col,acc){
  ctx.save();ctx.translate(x,y);
  ctx.beginPath();ctx.moveTo(0,-18*sc);ctx.lineTo(-12*sc,14*sc);ctx.lineTo(-4*sc,10*sc);ctx.lineTo(0,12*sc);ctx.lineTo(4*sc,10*sc);ctx.lineTo(12*sc,14*sc);ctx.closePath();ctx.fillStyle=col;ctx.fill();
  ctx.beginPath();ctx.moveTo(0,-10*sc);ctx.lineTo(-4*sc,4*sc);ctx.lineTo(4*sc,4*sc);ctx.closePath();ctx.fillStyle=acc;ctx.fill();
  ctx.beginPath();ctx.moveTo(-3*sc,12*sc);ctx.lineTo(0,18*sc+Math.random()*4*sc);ctx.lineTo(3*sc,12*sc);ctx.globalAlpha=.7;ctx.fillStyle=col;ctx.fill();ctx.globalAlpha=1;
  ctx.restore();
}
function rrect(cx,x,y,w,h,r){cx.beginPath();cx.moveTo(x+r,y);cx.lineTo(x+w-r,y);cx.quadraticCurveTo(x+w,y,x+w,y+r);cx.lineTo(x+w,y+h-r);cx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);cx.lineTo(x+r,y+h);cx.quadraticCurveTo(x,y+h,x,y+h-r);cx.lineTo(x,y+r);cx.quadraticCurveTo(x,y,x+r,y);cx.closePath()}

/* ===== GAME ENGINE ===== */
let game=null;
class Game{
  constructor(cv){
    this.cv=cv;this.cx=cv.getContext('2d');this.w=0;this.h=0;
    this.p={};this.en=[];this.pb=[];this.eb=[];this.pt=[];this.bd=[];this.gs=[];
    this.waves=[];this.wi=0;this.sq=[];this.st=0;this.state='idle';this.raf=0;this.lt=0;
    this.hits=0;this.t0=0;this.tt=null;this.shk=0;
    cv.addEventListener('touchstart',e=>{e.preventDefault();if(this.state!=='playing')return;const t=e.touches[0],r=cv.getBoundingClientRect();this.tt={x:t.clientX-r.left,y:t.clientY-r.top-60}},{passive:false});
    cv.addEventListener('touchmove',e=>{e.preventDefault();if(this.state!=='playing')return;const t=e.touches[0],r=cv.getBoundingClientRect();this.tt={x:t.clientX-r.left,y:t.clientY-r.top-60}},{passive:false});
    cv.addEventListener('touchend',e=>{e.preventDefault();this.tt=null},{passive:false});
  }
  rs(){this.w=this.cv.width=innerWidth;this.h=this.cv.height=innerHeight}
  init(lv,st){
    this.rs();this.lv=lv;this.st=st;const sh=SHIPS[P.sel];
    this.p={x:this.w/2,y:this.h-100,hp:CFG.P_HP*sh.hp,mhp:CFG.P_HP*sh.hp,dmg:CFG.P_DMG*sh.dmg,fr:CFG.P_FR/sh.fr,spd:CFG.P_SPD*sh.spd,col:sh.color,acc:sh.accent,ft:0,inv:0,buffs:[]};
    this.en=[];this.pb=[];this.eb=[];this.pt=[];this.bd=[];
    this.waves=getWaves(lv,st);this.wi=0;this.sq=[];this.st=0;this.hits=0;this.t0=Date.now();this.state='playing';this.shk=0;
    this.gs=[];for(let l=0;l<3;l++)for(let i=0;i<30;i++)this.gs.push({x:Math.random()*this.w,y:Math.random()*this.h,r:Math.random()*(.4+l*.5)+.2,v:1+l*1.5});
    this.nextWave();this.lt=performance.now();this.raf=requestAnimationFrame(t=>this.loop(t));
  }
  nextWave(){
    if(this.wi>=this.waves.length){this.win();return}
    this.sq=this.waves[this.wi].map(e=>({...e}));this.st=0;
    $('hud-wave').textContent=`WAVE ${this.wi+1}/${this.waves.length}`;
  }
  spawn(d){
    const e=ED[d.t],en={t:d.t,x:30+Math.random()*(this.w-60),y:-e.sz,hp:d.hp,mhp:d.hp,sp:e.sp+this.lv*.05,sz:e.sz,col:e.col,sh:e.sh,fR:e.fR||0,fT:e.fR||0,sc:e.sc,amp:e.amp||0,frq:e.fr||0,ph:Math.random()*6.28,bx:0};
    en.bx=en.x;this.en.push(en);
  }
  loop(ts){
    if(this.state!=='playing')return;const dt=Math.min((ts-this.lt)/1000,.05);this.lt=ts;this.up(dt);this.ren();this.raf=requestAnimationFrame(t=>this.loop(t));
  }
  up(dt){
    if(this.shk>0)this.shk-=dt*1000;const p=this.p,now=Date.now();
    // Move
    if(this.tt){const dx=this.tt.x-p.x,dy=this.tt.y-p.y,d=Math.sqrt(dx*dx+dy*dy);if(d>2){const s=p.spd*60*dt;p.x+=dx/d*Math.min(s,d);p.y+=dy/d*Math.min(s,d)}}
    p.x=Math.max(15,Math.min(this.w-15,p.x));p.y=Math.max(this.h*.3,Math.min(this.h-20,p.y));
    if(p.inv>0)p.inv-=dt*1000;
    // Fire
    const bMul=p.buffs.filter(b=>b.t==='burst').reduce((m)=>m*1.5,1),aMul=p.buffs.filter(b=>b.t==='attack').reduce((m)=>m*1.5,1);
    p.ft-=dt*1000;if(p.ft<=0){p.ft=p.fr/bMul;this.pb.push({x:p.x-6,y:p.y-18,vy:-9,d:p.dmg*aMul,r:3});this.pb.push({x:p.x+6,y:p.y-18,vy:-9,d:p.dmg*aMul,r:3});sfx.play('shoot')}
    // Buffs
    p.buffs=p.buffs.filter(b=>now<b.e);
    const hc=$('hud-buffs');hc.innerHTML='';p.buffs.forEach(b=>{
      const cl=b.t==='burst'?'buff-burst':b.t==='attack'?'buff-attack':'buff-shield',rm=Math.ceil((b.e-now)/1000);
      hc.innerHTML+=`<span class="buff-indicator ${cl}">${b.t[0].toUpperCase()}${rm}s</span>`;
    });
    // Spawn
    if(this.sq.length>0){this.st-=dt;if(this.st<=0){this.spawn(this.sq.shift());this.st=.45}}
    // Bullets
    this.pb.forEach(b=>b.y+=b.vy*60*dt);this.pb=this.pb.filter(b=>b.y>-10);
    this.eb.forEach(b=>{b.y+=b.vy*60*dt;if(b.vx)b.x+=b.vx*60*dt});this.eb=this.eb.filter(b=>b.y<this.h+10&&b.x>-10&&b.x<this.w+10);
    // Enemies
    for(const e of this.en){
      if(e.t==='boss'){if(e.y<80)e.y+=e.sp*60*dt;else{e.ph+=.02;e.x=e.bx+Math.sin(e.ph)*80;e.x=Math.max(e.sz,Math.min(this.w-e.sz,e.x))}}
      else if(e.t==='zigzag'){e.y+=e.sp*60*dt;e.ph+=e.frq*60*dt;e.x=e.bx+Math.sin(e.ph)*e.amp}
      else if(e.t==='shooter'){e.y+=e.sp*60*dt;if(e.y>this.h*.25)e.sp=Math.max(0,e.sp-.02)}
      else e.y+=e.sp*60*dt;
      if(e.sh){e.fT-=dt*1000;if(e.fT<=0&&e.y>0){e.fT=e.fR;
        if(e.t==='boss'){for(let a=-2;a<=2;a++){const an=Math.PI/2+a*.25;this.eb.push({x:e.x,y:e.y+e.sz,vx:Math.cos(an)*3,vy:Math.sin(an)*3,r:4,col:'#ff5252'})}}
        else{const dx=p.x-e.x,dy=p.y-e.y,d=Math.max(1,Math.sqrt(dx*dx+dy*dy));this.eb.push({x:e.x,y:e.y+e.sz,vx:dx/d*2.5,vy:dy/d*2.5,r:3,col:'#ff6e40'})}}}
    }
    this.en=this.en.filter(e=>e.y<this.h+60);
    // Drops
    this.bd.forEach(b=>b.y+=1.5*60*dt);this.bd=this.bd.filter(b=>b.y<this.h+20);
    // Particles
    this.pt.forEach(pt=>{pt.x+=pt.vx*60*dt;pt.y+=pt.vy*60*dt;pt.l-=dt*2;pt.vy+=.5*dt*60});this.pt=this.pt.filter(pt=>pt.l>0);
    // Stars
    this.gs.forEach(s=>{s.y+=s.v*60*dt;if(s.y>this.h){s.y=0;s.x=Math.random()*this.w}});
    // Collisions
    this.col(aMul);
    // Health
    $('hud-health').style.width=Math.max(0,p.hp/p.mhp*100)+'%';
    // Wave done
    if(this.sq.length===0&&this.en.length===0){this.wi++;if(this.wi<this.waves.length)setTimeout(()=>this.nextWave(),800);else setTimeout(()=>this.win(),500)}
  }
  col(aMul){
    const p=this.p,sh=p.buffs.some(b=>b.t==='shield');
    // Player bullets vs enemies
    for(let i=this.pb.length-1;i>=0;i--){const b=this.pb[i];
      for(let j=this.en.length-1;j>=0;j--){const e=this.en[j],dx=b.x-e.x,dy=b.y-e.y;
        if(dx*dx+dy*dy<(b.r+e.sz)*(b.r+e.sz)){this.pb.splice(i,1);e.hp-=b.d;sfx.play('hit');
          if(e.hp<=0){this.boom(e.x,e.y,e.col,e.t==='boss'?24:12);sfx.play('explode');if(Math.random()<CFG.BUFF_DR)this.drop(e.x,e.y);this.en.splice(j,1)}break}}}
    // Enemy bullets vs player
    if(p.inv<=0)for(let i=this.eb.length-1;i>=0;i--){const b=this.eb[i],dx=b.x-p.x,dy=b.y-p.y;
      if(dx*dx+dy*dy<(b.r+12)*(b.r+12)){this.eb.splice(i,1);if(sh){this.boom(b.x,b.y,'#448aff',6);continue}
        p.hp-=15;p.inv=CFG.INV;this.hits++;this.shk=300;sfx.play('phit');
        $('game-screen').classList.add('screen-shake');setTimeout(()=>$('game-screen').classList.remove('screen-shake'),300);
        if(p.hp<=0){this.lose();return}}}
    // Enemies vs player
    if(p.inv<=0)for(let j=this.en.length-1;j>=0;j--){const e=this.en[j],dx=e.x-p.x,dy=e.y-p.y;
      if(dx*dx+dy*dy<(e.sz+12)*(e.sz+12)){if(sh){e.hp-=5;if(e.hp<=0){this.boom(e.x,e.y,e.col,12);this.en.splice(j,1);sfx.play('explode')}continue}
        p.hp-=25;p.inv=CFG.INV;this.hits++;this.shk=300;sfx.play('phit');
        $('game-screen').classList.add('screen-shake');setTimeout(()=>$('game-screen').classList.remove('screen-shake'),300);
        if(p.hp<=0){this.lose();return}}}
    // Buff pickups
    for(let i=this.bd.length-1;i>=0;i--){const b=this.bd[i],dx=b.x-p.x,dy=b.y-p.y;
      if(dx*dx+dy*dy<(b.r+15)*(b.r+15)){this.addBuf(b.t);this.bd.splice(i,1);sfx.play('buff')}}
  }
  boom(x,y,c,n){for(let i=0;i<n;i++){const a=Math.random()*6.28,s=Math.random()*3+1;this.pt.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,r:Math.random()*3+1,c,l:1})}}
  drop(x,y){const ts=['burst','attack','shield'],t=ts[Math.floor(Math.random()*3)],cs={burst:'#ffeb3b',attack:'#ff5252',shield:'#448aff'};this.bd.push({x,y,t,r:10,c:cs[t]})}
  addBuf(t){
    const p=this.p;if(t==='shield'){const i=p.buffs.findIndex(b=>b.t==='shield');if(i>=0)p.buffs[i].e=Date.now()+CFG.BUFF_DUR;else p.buffs.push({t,e:Date.now()+CFG.BUFF_DUR})}
    else{if(p.buffs.filter(b=>b.t===t).length<3)p.buffs.push({t,e:Date.now()+CFG.BUFF_DUR})}
    toast(t.toUpperCase()+' activated!','var(--'+t+')');
  }
  ren(){
    const cx=this.cx;cx.clearRect(0,0,this.w,this.h);
    // Stars
    for(const s of this.gs){cx.globalAlpha=.5;cx.fillStyle='#c8c8e8';cx.beginPath();cx.arc(s.x,s.y,s.r,0,6.28);cx.fill()}cx.globalAlpha=1;
    // Drops
    for(const b of this.bd){cx.beginPath();cx.arc(b.x,b.y,b.r,0,6.28);cx.fillStyle=b.c+'44';cx.fill();cx.strokeStyle=b.c;cx.lineWidth=1.5;cx.stroke();cx.fillStyle=b.c;cx.font='bold 10px Orbitron';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(b.t[0].toUpperCase(),b.x,b.y)}
    // Player bullets
    cx.shadowColor='#00e5ff';cx.shadowBlur=6;cx.fillStyle='#00e5ff';for(const b of this.pb){cx.beginPath();cx.arc(b.x,b.y,b.r,0,6.28);cx.fill()}cx.shadowBlur=0;
    // Enemy bullets
    for(const b of this.eb){cx.fillStyle=b.col||'#ff5252';cx.shadowColor=b.col||'#ff5252';cx.shadowBlur=4;cx.beginPath();cx.arc(b.x,b.y,b.r,0,6.28);cx.fill()}cx.shadowBlur=0;
    // Enemies
    for(const e of this.en)this.drEn(cx,e);
    // Player
    const p=this.p;
    if(!(p.inv>0&&Math.floor(Date.now()/80)%2)){
      if(p.buffs.some(b=>b.t==='shield')){cx.beginPath();cx.arc(p.x,p.y,28,0,6.28);cx.strokeStyle='rgba(68,138,255,.5)';cx.lineWidth=2;cx.stroke();cx.fillStyle='rgba(68,138,255,.08)';cx.fill()}
      drawShip(cx,p.x,p.y,1,p.col,p.acc);
    }
    // Particles
    for(const pt of this.pt){cx.globalAlpha=Math.max(0,pt.l);cx.fillStyle=pt.c;cx.beginPath();cx.arc(pt.x,pt.y,Math.max(.1,pt.r*pt.l),0,6.28);cx.fill()}cx.globalAlpha=1;
  }
  drEn(cx,e){
    cx.save();cx.translate(e.x,e.y);
    if(e.t==='basic'){cx.beginPath();cx.moveTo(0,e.sz);cx.lineTo(-e.sz*.7,-e.sz*.6);cx.lineTo(e.sz*.7,-e.sz*.6);cx.closePath();cx.fillStyle=e.col;cx.fill();cx.fillStyle='#ffffff33';cx.beginPath();cx.arc(0,0,e.sz*.25,0,6.28);cx.fill()}
    else if(e.t==='zigzag'){cx.beginPath();cx.moveTo(0,e.sz);cx.lineTo(-e.sz,0);cx.lineTo(0,-e.sz);cx.lineTo(e.sz,0);cx.closePath();cx.fillStyle=e.col;cx.fill()}
    else if(e.t==='shooter'){cx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/6;cx.lineTo(Math.cos(a)*e.sz,Math.sin(a)*e.sz)}cx.closePath();cx.fillStyle=e.col;cx.fill();cx.fillStyle='#ffffff33';cx.beginPath();cx.arc(0,0,e.sz*.35,0,6.28);cx.fill()}
    else if(e.t==='tank'){rrect(cx,-e.sz*.8,-e.sz*.6,e.sz*1.6,e.sz*1.2,4);cx.fillStyle=e.col;cx.fill();cx.fillStyle='#00000044';cx.fillRect(-e.sz*.6,-3,e.sz*1.2,6)}
    else if(e.t==='boss'){
      cx.beginPath();cx.moveTo(-e.sz,e.sz*.3);cx.lineTo(-e.sz*.4,0);cx.lineTo(-e.sz*.4,e.sz*.3);cx.closePath();cx.fillStyle='#8b0000';cx.fill();
      cx.beginPath();cx.moveTo(e.sz,e.sz*.3);cx.lineTo(e.sz*.4,0);cx.lineTo(e.sz*.4,e.sz*.3);cx.closePath();cx.fillStyle='#8b0000';cx.fill();
      cx.beginPath();cx.moveTo(0,-e.sz);cx.lineTo(-e.sz*.5,e.sz*.5);cx.lineTo(0,e.sz*.3);cx.lineTo(e.sz*.5,e.sz*.5);cx.closePath();cx.fillStyle=e.col;cx.fill();
      cx.fillStyle='#ff000066';cx.beginPath();cx.arc(0,0,e.sz*.25,0,6.28);cx.fill();
      cx.fillStyle='#333';cx.fillRect(-e.sz,e.sz+8,e.sz*2,4);cx.fillStyle=e.hp>e.mhp*.3?'#ff5252':'#ff0000';cx.fillRect(-e.sz,e.sz+8,e.sz*2*(e.hp/e.mhp),4);
    }
    cx.restore();
  }
  pause(){if(this.state!=='playing')return;this.state='paused';cancelAnimationFrame(this.raf);$('pause-overlay').classList.remove('hidden')}
  resume(){$('pause-overlay').classList.add('hidden');this.state='playing';this.lt=performance.now();this.raf=requestAnimationFrame(t=>this.loop(t))}
  quit(){this.state='idle';cancelAnimationFrame(this.raf);$('pause-overlay').classList.add('hidden');renderLevels();showScr('level-select-screen')}
  win(){
    this.state='idle';cancelAnimationFrame(this.raf);sfx.play('win');
    const{reward,bonuses}=calcReward(this.lv,this.hits,Date.now()-this.t0);
    P.cash+=reward;P.totalCash+=reward;P.cleared++;
    if(this.st<CFG.STAGES-1)P.stage=this.st+1;else if(this.lv<CFG.MAX_LVL){P.level=this.lv+1;P.stage=0}
    saveP();cloudSave();showComplete(this.lv,this.st,reward,bonuses);refreshDash();
  }
  lose(){this.state='idle';cancelAnimationFrame(this.raf);sfx.play('fail');showFail('Your aircraft was destroyed')}
}

/* ===== EVENT BINDINGS ===== */
function bind(){
  $('btn-login-email').onclick=()=>{const e=$('login-email').value.trim(),p=$('login-pass').value;if(!e||!p)return toast('Fill all fields','var(--danger)');doLogin(e,p)};
  $('btn-login-google').onclick=doGoogle;
  $('btn-show-register').onclick=()=>{$('login-card').classList.add('hidden');$('register-card').classList.remove('hidden');$('register-card').style.display='flex'};
  $('btn-show-login').onclick=()=>{$('register-card').classList.add('hidden');$('register-card').style.display='none';$('login-card').classList.remove('hidden')};
  $('btn-register').onclick=()=>{const n=$('reg-name').value.trim(),e=$('reg-email').value.trim(),p=$('reg-pass').value;if(!n||!e||!p)return toast('Fill all fields','var(--danger)');if(p.length<6)return toast('Min 6 characters','var(--danger)');doReg(e,p,n)};

  $('btn-continue').onclick=()=>{if(P.level<=CFG.MAX_LVL&&!(P.level===CFG.MAX_LVL&&P.stage>=CFG.STAGES))showPrestage(P.level,P.stage);else toast('All missions complete!','var(--gold)')};
  $('btn-levels').onclick=()=>{renderLevels();showScr('level-select-screen')};
  $('btn-hangar').onclick=()=>{renderHangar();showScr('aircraft-screen')};
  $('btn-profile').onclick=()=>{renderProfProg();showScr('profile-screen')};
  $('btn-logout').onclick=doLogout;
  $('btn-settings').onclick=()=>showScr('settings-screen');

  $('btn-levels-back').onclick=()=>showScr('dashboard-screen');
  $('btn-hangar-back').onclick=()=>showScr('dashboard-screen');
  $('btn-prestage-back').onclick=()=>{renderLevels();showScr('level-select-screen')};
  $('btn-profile-back').onclick=()=>showScr('dashboard-screen');
  $('btn-settings-back').onclick=()=>showScr('dashboard-screen');

  $('btn-start-stage').onclick=()=>{sfx.init();showScr('game-screen');game=new Game($('game-canvas'));game.init(pLvl,pStg);$('hud-cash').textContent=P.cash.toLocaleString()};
  $('btn-pause').onclick=()=>{if(game)game.pause()};
  $('btn-resume').onclick=()=>{if(game)game.resume()};
  $('btn-quit-stage').onclick=()=>{if(game)game.quit()};

  $('btn-next-stage').onclick=()=>{let nl=pLvl,ns=pStg+1;if(ns>=CFG.STAGES){nl++;ns=0}showPrestage(nl,ns)};
  $('btn-complete-levels').onclick=()=>{renderLevels();showScr('level-select-screen')};
  $('btn-retry').onclick=()=>{sfx.init();showScr('game-screen');game=new Game($('game-canvas'));game.init(pLvl,pStg);$('hud-cash').textContent=P.cash.toLocaleString()};
  $('btn-fail-levels').onclick=()=>{renderLevels();showScr('level-select-screen')};

  $('btn-sfx-toggle').onclick=function(){const on=this.dataset.on==='true';this.dataset.on=String(!on);sfx.on=!on};
  $('btn-vib-toggle').onclick=function(){this.dataset.on=String(this.dataset.on!=='true')};
  $('btn-reset-data').onclick=()=>{if(confirm('Reset all progress? Cannot be undone.')){P=defP();saveP();doLogout()}};

  window.addEventListener('resize',()=>{if(starsBg)starsBg.rs();if(game&&game.state==='playing')game.rs()});
}

/* ===== BOOTSTRAP ===== */
let starsBg;
document.addEventListener('DOMContentLoaded',()=>{
  starsBg=new StarsBG($('starfield-bg'));
  let lt=performance.now();
  (function a(t){starsBg.up(Math.min((t-lt)/1000,.05));lt=t;requestAnimationFrame(a)})(lt);
  bind();
  if(P.email){refreshDash();showScr('dashboard-screen')}
  if(FB_CONFIG.apiKey)loadFirebase().then(()=>{if(fbReady){
    fbAuth.onAuthStateChanged(async u=>{if(u){const c=await cloudLoad();if(c){Object.assign(P,c);saveP();refreshDash()}}});
    fbAuth.getRedirectResult().then(async r=>{if(r.user)await authOK(r.user,r.user.displayName)}).catch(()=>{});
  }});
});
