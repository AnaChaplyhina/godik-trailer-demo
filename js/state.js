/* Godik Trailer · afledt tilstand, roller og adgang */

/* ---------- afledt ---------- */
const D=s=>new Date(s+'T12:00:00');
const dk=s=>s?D(s).toLocaleDateString('da-DK',{day:'numeric',month:'short'}):'–';
const iso=d=>d.toISOString().slice(0,10);
const byLoc=c=>LOCS.find(l=>l.c===c);
const byReg=r=>TRAILERS.find(t=>t.r===r);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const UNNUMBERED=SUBS.filter(b=>!b.r);
const SVCCOL={'Modtaget':'var(--alert)','Planlagt':'var(--alert)','På værksted':'var(--base)','Afsluttet':'var(--base)'};

/* Bookingens faser. Kunden skal altid kunne se, hvad der sker nu,
   og afdelingen skal kunne se, at der er kommet noget nyt ind. */
const FASE={anmodet:'Afventer bekræftelse',bekraeftet:'Bekræftet',
  udleveret:'Udleveret til kunden',afleveret:'Afleveret',afvist:'Afvist'};
function seedFaser(){
  const t=iso(TODAY);
  SUBS.forEach(b=>{ if(b.fase) return;
    b.fase = b.t<t ? 'afleveret' : (b.f<=t ? 'udleveret' : 'bekraeftet');
    if(b.fase!=='anmodet') b.pickupOk=true;
  });
}
function bookState(b){
  if(b.st==='Afsluttet') return 'Afsluttet';
  if(D(b.t)<TODAY) return 'Afsluttet';
  if(D(b.f)<=TODAY&&D(b.t)>=TODAY) return 'I gang';
  return 'Kommende';
}
function recalc(){
  seedFaser();
  SUBS.forEach(b=>b.state=bookState(b));
  TRAILERS.forEach(t=>{
    t.subs=SUBS.filter(b=>b.r===t.r).sort((a,b)=>D(a.f)-D(b.f));
    t.active=t.subs.find(b=>b.state==='I gang')||null;
    t.next=t.subs.find(b=>b.state==='Kommende')||null;
    t.svc=SERVICE.find(s=>s.r===t.r&&s.st!=='Afsluttet')||null;
    t.atGodik=!!(t.svc&&t.svc.st==='På værksted');
    t.ude=t.subs.find(b=>b.fase==='udleveret')||null;   /* fysisk hos kunden */
    t.here=t.atGodik||t.ude?null:t.l;
    t.hist=SERVICE.filter(x=>x.r===t.r&&x.st==='Afsluttet');
    t.insp=INSPECTIONS.filter(i=>i.r===t.r);
    t.pl=ORDER(t.o);
    /* En trailer med en fejlet kontrol er spærret, indtil afdelingen
       enten selv udbedrer fejlen eller servicen er afsluttet. */
    t.state=t.atGodik?'base':t.blk?'blocked':t.svc?'service':t.ude?'sub':t.active?'sub':'placed';
    t.bookable=!!t.here&&!t.svc&&!t.blk;
    t.reserved=t.subs.some(b=>b.fase==='anmodet'||b.fase==='bekraeftet');
  });
  LOCS.forEach(l=>{
    l.tr=TRAILERS.filter(t=>t.here===l.c);
    l.free=l.tr.filter(t=>t.bookable&&!t.active&&!t.reserved);
    l.nye=SUBS.filter(b=>b.l===l.c&&b.fase==='anmodet');
    l.unnum=UNNUMBERED.filter(b=>b.l===l.c);
    l.svc=SERVICE.filter(s=>s.l===l.c&&s.st!=='Afsluttet');
    l.blk=l.tr.filter(t=>t.blk);
    l.out=l.tr.filter(t=>t.active).length;
    l.state=l.svc.length||l.blk.length?'alert':l.out?'sub':'placed';
  });
}
recalc();

const STATE={base:['var(--base)','På værksted hos Godik, Ejby'],placed:['var(--placed)','Klar i afdelingen'],
  sub:['var(--sub)','Udlejet til slutkunde'],service:['var(--alert)','Service anmodet'],
  blocked:['var(--alert)','Spærret efter visuel kontrol']};

/* En trailer er ledig i en periode, hvis intet andet dækker de dage. */
function freeIn(reg,f,t,skip){
  return !SUBS.some(b=>b.r===reg&&b.o!==skip&&b.st!=='Afsluttet'&&b.fase!=='afvist'&&!(D(b.t)<D(f)||D(b.f)>D(t)));
}

let S={app:'kunde',tab:'ledige',sel:null,trailer:null,svc:null,book:null,q:'',form:null,page:null,pending:null,
       dept:null,chk:{},cnotes:{},chkaf:'',mine:[]};
const isKunde=()=>S.app==='kunde';
const isGodik=()=>S.app==='godik';
const inScope=c=>S.app!=='dagrofa'||!S.dept||S.dept===c;
const scopeLocs=()=>LOCS.filter(l=>inScope(l.c));
const scopeTrailers=()=>TRAILERS.filter(t=>inScope(t.l));
const scopeSubs=()=>SUBS.filter(b=>inScope(b.l));
const scopeSvc=()=>SERVICE.filter(s=>inScope(s.l));
const myBookings=()=>SUBS.filter(b=>S.mine.includes(b.o));
