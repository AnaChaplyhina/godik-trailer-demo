/* Godik Trailer · bookingens faser set fra alle tre roller */

/* ---------- booking ---------- */
function bookView(ptop,sc,godik){
  const b=SUBS.find(x=>x.o===S.book); if(!b){S.book=null;return render()}
  const l=byLoc(b.l), t=b.r?byReg(b.r):null;
  const kunde=isKunde(), dag=S.app==='dagrofa';
  const pickup=INSPECTIONS.find(i=>i.o===b.o&&i.phase==='afhentning');
  const ret=INSPECTIONS.find(i=>i.o===b.o&&i.phase==='aflevering');

  ptop.innerHTML=`<button class="back" data-back="root">← Tilbage</button>
    <button class="closex" data-back="root" title="Luk">×</button>
    <h2>${kunde?SPECS[t.t].navn:esc(b.k)}</h2>
    <p>${FASE[b.fase]} · ${kunde?PARTNER+' '+esc(l.n):'Dagrofa '+esc(l.n)+' · ordre '+b.o}</p>`;

  /* Hvad sker der lige nu, skrevet til den rolle der kigger */
  let nu='', tone='wait';
  if(b.fase==='anmodet') nu=kunde
    ? 'Afdelingen bekræfter din booking. Kør ikke afsted endnu – du får besked her.'
    : 'Ny anmodning. Bekræft eller afvis, så kunden ved, om traileren er klar.';
  else if(b.fase==='bekraeftet'&&!pickup){tone='ok';nu=kunde
    ? `Bekræftet. Hent traileren hos ${PARTNER} ${l.n}, ${l.a}, ${l.z}, fra ${dk(b.f)}. Tag kørekort med. Når du står ved vognen, laver du den visuelle kontrol her.`
    : 'Bekræftet. Kunden gennemgår vognen ved afhentning.';}
  else if(b.fase==='bekraeftet'&&pickup&&!pickup.faults.length){tone='ok';nu=kunde
    ? 'Kontrollen er godkendt. Afdelingen udleverer nøglen.'
    : 'Kunden har godkendt kontrollen. Udlever nøglen og tryk Udlever trailer.';}
  else if(b.fase==='bekraeftet'&&pickup&&pickup.faults.length){tone='bad';nu=kunde
    ? `Der blev fundet fejl. Kontakt ${PARTNER} ${l.n} på 70 20 18 16 – vi finder en anden trailer.`
    : 'Kunden fandt fejl ved afhentning. Traileren er spærret. Find en anden vogn til kunden.';}
  else if(b.fase==='udleveret'){tone='ok';nu=kunde
    ? `Du har traileren. Aflever den senest ${dk(b.t)} hos ${PARTNER} ${l.n}, og lav kontrollen ved aflevering.`
    : `Hos kunden${b.by?' i '+esc(b.by):''}. Retur ${dk(b.t)}.`;}
  else if(b.fase==='afleveret') nu=kunde?'Afleveret. Tak for lån.':'Afleveret og afsluttet.';
  else if(b.fase==='afvist') {tone='bad';nu=kunde?'Afdelingen kunne ikke bekræfte bookingen.':'Afvist.';}

  const trin=[['anmodet','Booket'],['bekraeftet','Bekræftet'],['udleveret','Udleveret'],['afleveret','Afleveret']];
  const naaet=trin.findIndex(([k])=>k===b.fase);
  const chain=`<div class="chain">${trin.map(([k,label],i)=>{
    const on=b.fase!=='afvist'&&i<=naaet;
    const naar=k==='anmodet'?dk(b.oprettet||b.f)
      :k==='bekraeftet'?(b.bekraeftet?dk(b.bekraeftet):'')
      :k==='udleveret'?(b.udleveret?dk(b.udleveret):dk(b.f))
      :(b.fase==='afleveret'?dk(b.t):'');
    return `<div class="step ${on?'':'off'}"><i style="background:${on?'var(--placed)':'var(--line)'}"></i>
      <div><b>${label}</b><span>${on&&naar?naar:'ikke endnu'}</span></div></div>`}).join('')}</div>`;

  const left=`${t?`<div class="bigph" style="background-image:url(${IMG[t.t]})"></div>`:''}
    <div class="concl ${tone}">${nu}</div>
    ${kunde?'':`<div class="kv"><span>Trailer</span><span>${b.r?`<a class="lnk" data-tr="${b.r}">${b.r}</a> · ${SPECS[t.t].navn}`:'ikke angivet'}</span></div>`}
    <div class="kv"><span>Periode</span><span>${dk(b.f)} – ${dk(b.t)}</span></div>
    <div class="kv"><span>${kunde?'Hentes hos':'Afdeling'}</span><span>${kunde?PARTNER+' '+esc(l.n):'Dagrofa '+esc(l.n)+' · '+l.c}</span></div>
    <div class="kv"><span>Adresse</span><span>${esc(l.a)}<br>${esc(l.z)}</span></div>
    ${kunde?'':`${b.att?`<div class="kv"><span>Kontaktperson</span><span>${esc(b.att)}</span></div>`:''}
      ${b.tlf?`<div class="kv"><span>Telefon</span><span>${esc(b.tlf)}${b.verificeret?' · bekræftet med kode':''}</span></div>`:''}
      <div class="kv"><span>Brugsadresse</span><span>${b.adr?esc(b.adr)+'<br>'+esc(b.post)+' '+esc(b.by):'ikke oplyst'}</span></div>`}`;

  const inspBlock=i=>i
    ? `<div class="concl ${i.faults.length?'bad':'ok'}">${i.faults.length
        ?'Fejl fundet på '+i.faults.length+' punkt'+(i.faults.length>1?'er':''):'Alt i orden'}</div>
       <div class="sub" style="white-space:normal;margin-top:6px">
       ${i.faults.length?i.faults.map(f=>'<b>'+esc(f.i)+'</b><br>'+esc(f.note)).join('<br><br>'):'Alle punkter tjekket.'}
       <br><br>${dk(i.at)} · ${esc(i.af)}</div>`
    : '<div class="sub">Ikke gennemført endnu.</div>';

  const handling=
    (dag&&b.fase==='anmodet'?`<div class="h3">Ny anmodning</div>
      <div style="display:flex;gap:9px"><button class="btn" style="margin:0" data-ok="${b.o}">Bekræft booking</button>
      <button class="btn ghost" style="margin:0" data-no="${b.o}">Afvis</button></div>`:'')
    +(dag&&b.fase==='bekraeftet'&&pickup&&!pickup.faults.length
      ?`<div class="h3">Udlevering</div><button class="btn" data-out="${b.o}">Udlever trailer til kunden</button>`:'')
    +(dag&&b.fase==='bekraeftet'&&!pickup
      ?`<div class="h3">Udlevering</div><div class="sub">Afventer kundens kontrol ved afhentning.</div>`:'');

  const right=`<div class="h3">Forløb</div>${chain}${handling}
    <div class="h3">Kontrol ved afhentning</div>
    ${inspBlock(pickup)}
    ${!pickup&&b.fase==='bekraeftet'&&(kunde||dag)
      ?`<button class="btn" data-form="check-afhentning-${b.o}">Start kontrol ved afhentning</button>`:''}
    ${!pickup&&b.fase==='anmodet'?'<div class="sub">Kan først laves, når afdelingen har bekræftet.</div>':''}
    <div class="h3">Kontrol ved aflevering</div>
    ${inspBlock(ret)}
    ${b.fase==='udleveret'&&!ret&&(kunde||dag)
      ?`<button class="btn" data-form="check-aflevering-${b.o}">Start kontrol ved aflevering</button>`:''}
    ${b.fase!=='udleveret'&&!ret?'<div class="sub">Kan først laves, når traileren er udleveret.</div>':''}
    ${!kunde&&SMS.filter(m=>m.o===b.o).length?`<div class="h3">Sendt til kunden</div>`
      +SMS.filter(m=>m.o===b.o).map(m=>`<div class="smsbox"><div class="smsmeta">SMS · ${dk(m.at)} ${m.tid} · ${esc(m.tlf)}</div><div>${esc(m.txt)}</div></div>`).join(''):''}
    ${dag&&b.fase!=='afleveret'&&b.fase!=='afvist'?`
      <div class="h3">Ret bookingen</div>
      <label class="f"><span>Slutdato</span><input class="i" type="date" id="b-til" value="${b.t}"></label>
      <button class="btn ghost" id="b-save">Gem ændring</button>
      <button class="btn ghost" id="b-cancel">Annuller bookingen</button>`:''}`;

  sc.innerHTML=`<div class="dgrid"><div>${left}</div><div>${right}</div></div>`;

  if(dag&&b.fase!=='afleveret'&&b.fase!=='afvist'){
    const g=id=>document.getElementById(id);
    if(g('b-save')) g('b-save').onclick=()=>{
      const v=g('b-til').value; if(!v||D(v)<D(b.f))return toast('Slutdato skal ligge efter startdato');
      b.t=v; render(); toast('Booking opdateret');
    };
    if(g('b-cancel')) g('b-cancel').onclick=()=>{
      SUBS=SUBS.filter(x=>x.o!==b.o); S.book=null; render(); toast('Bookingen er annulleret');
    };
  }
}
