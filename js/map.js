/* Godik Trailer · Danmarkskortet, projektion og museinteraktion */

/* ---------- kort ---------- */
const svg=document.getElementById('map'),gm=document.getElementById('gmark'),
      gl=document.getElementById('glink'),tip=document.getElementById('tip');
const VB=MAPD.vb;
const myp=x=>Math.log(Math.tan(Math.PI/4+x*Math.PI/360))*180/Math.PI;
function proj(lng,lat){const sx=MAPD.w/(MAPD.maxx-MAPD.minx);
  return [(lng-MAPD.minx)*sx,(myp(MAPD.maxy)-myp(lat))*sx]}
let view=VB.slice();
const setView=v=>{view=v;svg.setAttribute('viewBox',v.join(' '))};


function drawLand(){
  document.getElementById('gland').innerHTML=
    MAPD.paths.map(p=>`<path class="land" d="${p}"/>`).join('');
}

function drawMap(){
  const q=S.q.toLowerCase();
  const kunde=isKunde();

  if(kunde){
    gl.innerHTML='';
    gm.innerHTML=LOCS.map(l=>{
      const [x,y]=proj(l.lng,l.lat), n=l.free.length, r=9.5+Math.min(n,5)*1.8;
      const hit=!q||l.n.toLowerCase().includes(q)||l.z.toLowerCase().includes(q);
      const cls=['mk',n?'free':'none',S.sel===l.c?'on':'',(q&&!hit)||!n?'dim':''].join(' ');
      return `<g class="${cls}" data-loc="${l.c}">
        <circle class="dot" cx="${x}" cy="${y}" r="${r}"/>
        <text class="cnt" x="${x}" y="${y}">${n}</text>
        <text class="lbl" x="${x}" y="${y+r+13+(l.lo||0)}">${l.n}</text></g>`}).join('');
    return;
  }

  const [hx,hy]=proj(HQ.lng,HQ.lat);
  gl.innerHTML=(!S.sel&&!S.q)?LOCS.map(l=>{const [x,y]=proj(l.lng,l.lat);
    const mx=(hx+x)/2,my=(hy+y)/2-Math.abs(x-hx)*.18;
    return `<path class="link" d="M${hx} ${hy} Q${mx} ${my} ${x} ${y}"/>`}).join(''):'';
  const cust=SUBS.filter(b=>b.fase==='udleveret'&&b.lat&&inScope(b.l)).map(b=>{
    const [x,y]=proj(b.lng,b.lat), l=byLoc(b.l), [lx,ly]=proj(l.lng,l.lat);
    return `<g class="cust" data-book="${b.o}">
      <path class="clink" d="M${lx} ${ly} L${x} ${y}"/>
      <circle cx="${x}" cy="${y}" r="6"/>
      <text x="${x}" y="${y+17}">${esc((b.k||'').split(' ')[0])}</text></g>`}).join('');
  const home=TRAILERS.filter(t=>t.atGodik).length;
  const hq=`<g class="hq" data-hq="1">
    <circle class="halo" cx="${hx}" cy="${hy}" r="21"/>
    <circle class="badge" cx="${hx}" cy="${hy}" r="12.5"/>
    <text class="n" x="${hx}" y="${hy+3.8}" fill="#fff">${home}</text>
    <text class="lbl" x="${hx}" y="${hy+27}">Power</text></g>`;
  gm.innerHTML=hq+cust+LOCS.map(l=>{
    const [x,y]=proj(l.lng,l.lat), r=9.5+Math.min(l.tr.length,5)*1.8;
    const hit=!q||l.n.toLowerCase().includes(q)||l.a.toLowerCase().includes(q)
      ||l.tr.some(t=>t.r.toLowerCase().includes(q))
      ||l.tr.some(t=>t.subs.some(b=>b.k.toLowerCase().includes(q)));
    const cls=['mk',l.state,S.sel===l.c?'on':'',(q&&!hit)||!inScope(l.c)?'dim':''].join(' ');
    return `<g class="${cls}" data-loc="${l.c}">
      <circle class="dot" cx="${x}" cy="${y}" r="${r}"/>
      <text class="cnt" x="${x}" y="${y}">${l.tr.length}</text>
      <text class="lbl" x="${x}" y="${y+r+13+(l.lo||0)}">${l.n}</text></g>`}).join('');
}

gm.addEventListener('mousemove',e=>{
  const h=e.target.closest('[data-hq]');
  if(h&&!isKunde()){const n=TRAILERS.filter(t=>t.atGodik).length;
    tip.innerHTML=`<b>Godik · Ejby</b><br>${HQ.a}, ${HQ.z}<br>${n} trailer${n===1?'':'e'} på værkstedet`;
    tip.style.display='block';tip.style.left=(e.clientX+14)+'px';tip.style.top=(e.clientY+14)+'px';return}
  const g=e.target.closest('[data-loc]');
  if(!g){tip.style.display='none';return}
  const l=byLoc(g.dataset.loc);
  tip.innerHTML=isKunde()
    ? `<b>${PARTNER} ${esc(l.n)}</b><br>${esc(l.a)}, ${esc(l.z)}<br>${l.free.length?l.free.length+' ledige trailere':'ingen ledige lige nu'}`
    : `<b>Dagrofa ${esc(l.n)} · ${l.c}</b><br>${esc(l.a)}, ${esc(l.z)}<br>`
      +`${l.tr.length} trailere${l.out?' · '+l.out+' udlejet videre':''}${l.svc.length?' · service':''}${l.blk.length?' · spærret':''}`;
  tip.style.display='block';tip.style.left=(e.clientX+14)+'px';tip.style.top=(e.clientY+14)+'px'});
gm.addEventListener('mouseleave',()=>tip.style.display='none');
function focus(l){const [x,y]=proj(l.lng,l.lat),w=VB[2]*.5,h=VB[3]*.5;setView([x-w/2,y-h/2,w,h])}
const zoom=f=>{const v=view.slice(),cx=v[0]+v[2]/2,cy=v[1]+v[3]/2;
  v[2]*=f;v[3]*=f;v[0]=cx-v[2]/2;v[1]=cy-v[3]/2;setView(v)};
zin.onclick=()=>zoom(.75); zout.onclick=()=>zoom(1/.75); zres.onclick=()=>setView(VB.slice());
/* Kortet skal både kunne trækkes og klikkes.
   Vi fanger aldrig markøren, og vi venter ikke på browserens click-event,
   fordi den med mus kan blive omdirigeret væk fra markøren. I stedet
   afgør vi selv ved pointerup, om det var et klik eller et træk. */
let drag=null;
function mapPick(x,y){
  const el=document.elementFromPoint(x,y);
  return el?el.closest('[data-loc],[data-hq],[data-book]'):null;
}
function mapTap(g){
  if(!g)return;
  if(g.dataset.book&&!isKunde()){S.book=g.dataset.book;S.trailer=null;return render()}
  if(g.dataset.hq!==undefined&&!isKunde()){
    S.sel=null;S.trailer=null;S.tab='flaade';setView(VB.slice());return render()}
  if(g.dataset.loc){S.sel=g.dataset.loc;S.trailer=null;S.form=null;S.page=null;
    focus(byLoc(S.sel));return render()}
}
svg.addEventListener('pointerdown',e=>{
  if(e.button&&e.button!==0)return;
  drag={x:e.clientX,y:e.clientY,v:view.slice(),id:e.pointerId,moved:false};
});
addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const dx=e.clientX-drag.x, dy=e.clientY-drag.y;
  if(!drag.moved&&Math.hypot(dx,dy)<8)return;      /* under 8 px regnes som et klik */
  drag.moved=true;
  const k=view[2]/svg.clientWidth;
  setView([drag.v[0]-dx*k, drag.v[1]-dy*k, drag.v[2], drag.v[3]]);
});
let justPanned=false;
addEventListener('pointerup',e=>{
  if(!drag)return;
  const moved=drag.moved, x=e.clientX, y=e.clientY;
  drag=null;
  if(moved){justPanned=true;setTimeout(()=>justPanned=false,60);return}
  mapTap(mapPick(x,y));
});
addEventListener('pointercancel',()=>drag=null);
