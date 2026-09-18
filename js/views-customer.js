/* Godik Trailer · slutkundens skærmbilleder */

/* ---------- kunde ---------- */
function kundeList(ptop,sb,sc){
  const free=TRAILERS.filter(t=>t.bookable&&!t.active);
  const q=S.q.toLowerCase();
  const list=q?free.filter(t=>byLoc(t.l).n.toLowerCase().includes(q)||byLoc(t.l).z.toLowerCase().includes(q)):free;
  ptop.innerHTML=`<h2>Lej en køletrailer</h2><p>Hentes og afleveres i din ${PARTNER}-afdeling</p>`;
  sb.innerHTML=`<div class="stats">
    <div class="st"><b>${free.length}</b><span>ledige nu</span></div>
    <div class="st"><b>${LOCS.filter(l=>l.free.length).length}</b><span>afdelinger</span></div>
    <div class="st"><b>2</b><span>størrelser</span></div></div>`;
  sc.innerHTML=(q?'':`<div class="h3">Afdelinger</div>`+LOCS.map(l=>
      `<div class="row ${l.free.length?'':'muted'}" data-loc="${l.c}"><div class="rm">
        <div class="reg">${esc(l.n)}</div><div class="sub">${esc(l.a)}, ${esc(l.z)}</div></div>
        <div class="rd">${l.free.length?l.free.length+' ledige':'ingen ledige'}</div></div>`).join('')
      +`<div class="h3">Ledige trailere</div>`)
    +(list.length?list.map(kundeRow).join('')
      :'<div class="sub">Ingen ledige trailere lige nu. Prøv en anden afdeling.</div>');
}

function kundeTrailerView(ptop,sc){
  const t=byReg(S.trailer),l=byLoc(t.l),sp=SPECS[t.t];
  ptop.innerHTML=`<button class="back" data-back="root">← Tilbage</button>
    <button class="closex" data-back="root" title="Luk">×</button>
    <h2>${sp.navn}</h2><p>${esc(l.n)} · ${esc(l.a)}, ${esc(l.z)}</p>`;
  const left=`<div class="bigph" style="background-image:url(${IMG[t.t]})"></div>
    ${t.bookable&&!t.active?`<button class="btn" data-form="book-${t.r}">Book denne trailer</button>`
      :'<div class="concl wait">Ikke ledig lige nu</div>'}`;
  const right=`<div class="h3">Specifikationer</div>
    ${sp.rows.map(([k,v])=>`<div class="kv"><span>${k}</span><span>${v}</span></div>`).join('')}
    <div class="sub" style="margin-top:8px">Mål og vægt er vejledende.</div>
    <div class="h3">Afhentning</div>
    <div class="kv"><span>Adresse</span><span>${esc(l.a)}<br>${esc(l.z)}</span></div>
    <div class="kv"><span>Afdeling</span><span>${PARTNER} ${esc(l.n)}</span></div>
    <div class="h3">Sådan foregår det</div>
    <div class="sub" style="white-space:normal">Du booker her, henter traileren i afdelingen og
    gennemgår den visuelle kontrol på din telefon, før du kører. Samme kontrol laver du,
    når du afleverer igen. Kontrollen tager to minutter og kræver hverken bil eller strøm.</div>`;
  sc.innerHTML=`<div class="dgrid"><div>${left}</div><div>${right}</div></div>`;
}

function kundeBookings(ptop,sc){
  const mine=myBookings();
  ptop.innerHTML=`<h2>Min booking</h2><p>Dine aktive og tidligere bookinger</p>`;
  sc.innerHTML=mine.length?mine.map(b=>{
    const t=byReg(b.r);
    return `<div class="row" data-book="${b.o}"><div class="thumb" style="background-image:url(${IMG[t.t]})"></div>
      <div class="rm"><div class="reg">${SPECS[t.t].navn}</div>
      <div class="sub">${esc(byLoc(b.l).n)} · ${dk(b.f)} – ${dk(b.t)}</div>
      <span class="pill"><i style="background:${b.fase==='afvist'?'var(--alert)':b.fase==='afleveret'?'var(--base)':b.fase==='anmodet'?'var(--muted)':'var(--placed)'}"></i>${FASE[b.fase]}</span></div>
      <div class="rd">${b.fase==='anmodet'?'afventer svar'
        :b.fase==='bekraeftet'?'hent '+dk(b.f)
        :b.fase==='udleveret'?'retur '+dk(b.t):dk(b.t)}</div></div>`}).join('')
    :'<div class="sub">Du har ingen bookinger endnu. Vælg en trailer under Ledige trailere.</div>';
  const mineSms=SMS.filter(m=>S.mine.includes(m.o));
  if(mineSms.length) sc.innerHTML+=`<div class="h3">Beskeder til din telefon</div>`
    +mineSms.map(m=>`<div class="smsbox"><div class="smsmeta">SMS · ${dk(m.at)} ${m.tid} · ${esc(m.tlf)}</div>
      <div>${esc(m.txt)}</div>
      ${m.link?`<a class="lnk" data-book="${m.o}">trailer.dagrofa.dk/b/${m.o.toLowerCase()}</a>`:''}</div>`).join('');
}
