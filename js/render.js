/* Godik Trailer · tegner panelet og vælger visning */

/* ---------- panel ---------- */
function render(){
  recalc(); drawMap();
  const kunde=isKunde(), godik=isGodik();

  document.getElementById('logo').style.display=kunde?'none':'block';
  const bt=document.getElementById('brandtext');
  bt.style.display=kunde?'block':'none';
  bt.innerHTML=`${PARTNER}<span>Trailerudlejning</span>`;
  document.querySelectorAll('#appseg button').forEach(b=>b.classList.toggle('on',b.dataset.app===S.app));
  document.getElementById('who').innerHTML=
    kunde?`<span>Sådan ser siden ud for en kunde</span>`
    :godik?`<i style="background:var(--ink)"></i><span>Fuld adgang · alle kunder og trailere</span>`
    :`<i></i><select class="dept" id="dept"><option value="">Hovedkontor · alle afdelinger</option>`
      +LOCS.map(l=>`<option value="${l.c}" ${S.dept===l.c?'selected':''}>${esc(l.n)} · ${l.c}</option>`).join('')+`</select>`;
  if(S.app==='dagrofa') document.getElementById('dept').onchange=e=>{
    S.dept=e.target.value||null;S.sel=null;S.trailer=null;S.book=null;S.svc=null;S.form=null;
    setView(VB.slice());render()};

  document.getElementById('q').placeholder=kunde?'Søg by eller afdeling':'Nummerplade, afdeling eller kunde';
  document.getElementById('legend').innerHTML=kunde
    ?`<div><i style="border-color:var(--godik)"></i>Ledige trailere lige nu</div>
      <div><i style="border-color:#C3C9C0"></i>Ingen ledige på adressen</div>
      <p>Tallet viser, hvor mange trailere der kan bookes i afdelingen.<br>
      <a class="lnk" data-page="privacy">Sådan behandler vi dine oplysninger</a></p>`
    :`<div><i style="border-color:var(--placed)"></i>Klar i afdelingen</div>
      <div><i style="border-color:var(--sub)"></i>Udlejet videre til slutkunde</div>
      <div><i style="border-color:var(--alert)"></i>Spærret eller service anmodet</div>
      <div><i style="border-color:var(--godik);background:var(--godik)"></i>Godiks værksted i Ejby</div>
      <p>Positionen kommer fra den registrerede adresse, ikke fra GPS.</p>`;

  const tabs=kunde?[['ledige','Ledige trailere'],['min','Min booking']]
    :godik?[['flaade','Flåde'],['udl','Udlejninger'],['kontrol','Kontrol'],['svc','Service'],['api','API']]
    :[['flaade','Mine trailere'],['udl','Udlejninger'],['kontrol','Kontrol'],['svc','Service']];
  document.getElementById('tabs').innerHTML=tabs.map(([k,l])=>{
    const n=k==='svc'?scopeSvc().filter(s=>s.st!=='Afsluttet').length
      :k==='kontrol'?scopeTrailers().filter(t=>t.blk).length
      :k==='udl'?scopeSubs().filter(b=>b.fase==='anmodet').length
      :k==='min'?myBookings().length:0;
    return `<button data-tab="${k}" class="${S.tab===k?'on':''}">${l}${n?' · '+n:''}</button>`}).join('');

  const ptop=document.getElementById('ptop'),sb=document.getElementById('statbox'),sc=document.getElementById('scroll');
  sb.innerHTML='';
  const detail=!!(S.trailer||S.book||S.svc||S.form||S.sel||S.page);
  document.querySelector('.mapcard').classList.toggle('small',detail);
  document.querySelector('aside').classList.toggle('wide',detail);
  const key=[S.app,S.trailer,S.book,S.svc,S.form,S.sel,S.page].join('|');
  if(key!==S._key){S._key=key;sc.scrollTop=0}

  if(S.page==='privacy') return privacyView(ptop,sc);
  if(S.form)   return formView(ptop,sc);
  if(S.book)   return bookView(ptop,sc,godik);
  if(S.svc&&!kunde) return svcView(ptop,sc,godik);
  if(S.trailer)return kunde?kundeTrailerView(ptop,sc):trailerView(ptop,sc,godik);
  if(S.sel)    return locView(ptop,sc,kunde);

  if(kunde) return S.tab==='min'?kundeBookings(ptop,sc):kundeList(ptop,sb,sc);

  if(S.tab==='api')     return apiView(ptop,sc);
  if(S.tab==='kontrol') return kontrolView(ptop,sc,godik);
  if(S.tab==='flaade')  return fleetView(ptop,sb,sc,godik);
  if(S.tab==='udl')     return rentalsView(ptop,sc,godik);
  if(S.tab==='svc')     return serviceView(ptop,sc,godik);
}
