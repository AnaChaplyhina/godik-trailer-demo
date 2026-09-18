/* Godik Trailer · Dagrofas og Godiks lister */

/* ---------- lister for Dagrofa og Godik ---------- */
function fleetView(ptop,sb,sc,godik){
  const trs=scopeTrailers();
  ptop.innerHTML=godik?`<h2>Hele flåden</h2><p>${TRAILERS.length} trailere · ${LOCS.length} Dagrofa-afdelinger</p>`
    :`<h2>Mine trailere</h2><p>${S.dept?'Dagrofa '+esc(byLoc(S.dept).n):'Alle afdelinger'}</p>`;
  sb.innerHTML=`<div class="stats">
    <div class="st"><b>${trs.length}</b><span>trailere</span></div>
    <div class="st"><b>${trs.filter(t=>t.bookable&&!t.active).length}</b><span>ledige</span></div>
    <div class="st"><b>${trs.filter(t=>t.blk).length}</b><span>spærret</span></div>
    <div class="st"><b>${trs.filter(t=>t.svc).length}</b><span>service</span></div></div>`;
  let list=trs;
  if(S.q){const q=S.q.toLowerCase();
    list=list.filter(t=>t.r.toLowerCase().includes(q)||(t.here&&byLoc(t.here).n.toLowerCase().includes(q))
      ||t.subs.some(b=>b.k.toLowerCase().includes(q)));}
  sc.innerHTML=(godik?'':`<button class="btn" data-form="udlej">Opret udlejning for en kunde</button>`)
    +(S.q?'':`<div class="h3">Afdelinger</div>`+scopeLocs().map(l=>
      `<div class="row" data-loc="${l.c}"><div class="rm">
        <div class="reg">${esc(l.n)} <span style="color:var(--muted);font-weight:400">${l.c}</span></div>
        <div class="sub">${esc(l.a)}, ${esc(l.z)}</div></div>
        <div class="rd">${l.tr.length} stk.${l.free.length?'<br>'+l.free.length+' ledige':''}</div></div>`).join('')
      +`<div class="h3">Trailere</div>`)
    +(list.length?list.map(trailerRow).join(''):'<div class="sub">Ingen trailere matcher søgningen.</div>');
}

function rentalsView(ptop,sc,godik){
  const list=scopeSubs();
  const now=list.filter(b=>b.state==='I gang'),next=list.filter(b=>b.state==='Kommende'),
        past=list.filter(b=>b.state==='Afsluttet');
  ptop.innerHTML=`<h2>Udlejninger</h2><p>${godik?'Dagrofas udlejning videre til slutkunder':'Bookinger på egne kunder'}</p>`;
  const line=b=>`<div class="row" data-book="${b.o}">
    <div class="rm"><div class="reg" style="font-size:14.5px">${esc(b.k)}</div>
      <div class="sub">${b.r||'nummer ikke angivet'} · ${esc(byLoc(b.l).n)}${b.by?' · '+esc(b.by):''}</div></div>
    <div class="rd">${dk(b.f)} – ${dk(b.t)}</div></div>`;
  const nye=list.filter(b=>b.fase==='anmodet');
  sc.innerHTML=(nye.length?`<div class="h3">Nye anmodninger (${nye.length})</div>`
      +nye.map(b=>`<div class="alert"><b>${esc(b.k)} · ${esc(byLoc(b.l).n)}</b>
        <p>${b.r} · ${dk(b.f)} – ${dk(b.t)} · ${esc(b.tlf||'')}<br>${b.adr?esc(b.adr)+', '+esc(b.post)+' '+esc(b.by):''}</p>
        <div style="display:flex;gap:9px;margin-top:10px">
          <button class="btn" style="margin:0" data-ok="${b.o}">Bekræft</button>
          <button class="btn ghost" style="margin:0" data-no="${b.o}">Afvis</button>
          <button class="btn ghost" style="margin:0" data-book="${b.o}">Se detaljer</button></div></div>`).join('')
    :'')
    +(godik?'':`<button class="btn" data-form="udlej">Ny udlejning</button>`)
    +`<div class="h3">I gang nu (${now.length})</div>${now.map(line).join('')||'<div class="sub">Ingen.</div>'}
      <div class="h3">Kommende (${next.length})</div>${next.map(line).join('')||'<div class="sub">Ingen.</div>'}
      <div class="h3">Afsluttet (${past.length})</div>${past.map(line).join('')||'<div class="sub">Ingen.</div>'}`;
}

/* Kontrol: her ser afdelingen resultatet af kundernes visuelle kontrol
   og aabner traileren igen, enten selv eller via service. */
function kontrolView(ptop,sc,godik){
  const blocked=scopeTrailers().filter(t=>t.blk);
  const insp=INSPECTIONS.filter(i=>inScope(i.l));
  ptop.innerHTML=`<h2>Visuel kontrol</h2><p>Resultater fra kundernes gennemgang</p>`;
  sc.innerHTML=`<div class="h3">Spærrede trailere (${blocked.length})</div>`
    +(blocked.length?blocked.map(t=>{
      const b=t.blk;
      return `<div class="alert"><b>${t.r} · ${esc(byLoc(t.l).n)}</b>
        <p>${b.phase==='afhentning'?'Fundet ved afhentning':'Fundet ved aflevering'} ${dk(b.at)} af ${esc(b.af)}.<br>
        ${b.items.map(f=>esc(f.i)+': '+esc(f.note)).join('<br>')}</p>
        ${godik?'':`<div style="display:flex;gap:9px;margin-top:10px">
          <button class="btn ghost" style="margin:0" data-free="${t.r}">Fejlen er udbedret – frigiv</button>
          <button class="btn" style="margin:0" data-order="${t.r}">Bestil service</button></div>`}
        ${t.svc?`<p style="margin-top:8px">Service anmodet · ${t.svc.st}. Traileren åbner automatisk, når servicen er afsluttet.</p>`:''}
      </div>`}).join('')
      :'<div class="sub">Ingen spærrede trailere. Alt kan bookes.</div>')
    +`<div class="h3">Seneste kontroller (${insp.length})</div>`
    +(insp.length?insp.map(i=>`<div class="row" style="cursor:default">
        <div class="rm"><div class="reg" style="font-size:14.5px">${i.r} · ${i.phase==='afhentning'?'ved afhentning':'ved aflevering'}</div>
        <div class="sub">${i.faults.length?i.faults.map(f=>esc(f.i)).join(' · '):'Alle punkter i orden'}</div>
        <span class="pill"><i style="background:${i.faults.length?'var(--alert)':'var(--godik)'}"></i>${i.faults.length?'Fejl fundet':'Godkendt'}</span></div>
        <div class="rd">${dk(i.at)}<br>${esc(i.af)}</div></div>`).join('')
      :'<div class="sub">Ingen kontroller registreret endnu.</div>');
}

function serviceView(ptop,sc,godik){
  const open=scopeSvc().filter(s=>s.st!=='Afsluttet'),done=scopeSvc().filter(s=>s.st==='Afsluttet');
  ptop.innerHTML=`<h2>Service</h2><p>${godik?'Indkommet fra Dagrofas afdelinger':'Anmodninger sendt til leverandøren'}</p>`;
  sc.innerHTML=(godik?'':`<button class="btn" data-form="new">Anmod om service</button>`)
    +`<div class="h3">Åbne (${open.length})</div>${open.map(svcRow).join('')||'<div class="sub">Ingen åbne anmodninger.</div>'}
      <div class="h3">Servicehistorik (${done.length})</div>${done.length?done.map(svcRow).join(''):'<div class="sub">Endnu ingen afsluttet service.</div>'}`;
}

function apiView(ptop,sc){
  ptop.innerHTML=`<h2>API mellem Godik og Dagrofa</h2><p>Dagrofa-appen og kundesiden læser kun gennem disse kald</p>`;
  sc.innerHTML=`<div class="api">
    <div><code>GET /v1/public/availability?dept=&from=&to=</code><br>Ledige trailere til kundesiden. Ingen nummerplade, ingen ejer</div>
    <div><code>POST /v1/public/bookings</code><br>Kunden booker selv</div>
    <div><code>POST /v1/public/inspections</code><br>Kundens visuelle kontrol ved afhentning og aflevering</div>
    <div><code>GET /v1/trailers?partner=dagrofa</code><br>Trailere udstationeret hos Dagrofa med status</div>
    <div><code>POST /v1/subrentals</code><br>Afdelingen opretter en udlejning manuelt</div>
    <div><code>POST /v1/trailers/{reg}/release</code><br>Afdelingen frigiver en spærret trailer efter selv at have udbedret fejlen</div>
    <div><code>POST /v1/service-requests</code><br>Serviceanmodning fra en afdeling</div>
    <div><code>PATCH /v1/service-requests/{id}</code><br>Kun Godik: afhentnings- og returdato eller teknikerbesøg</div>
    <div><code>webhook trailer.blocked</code><br>Sendes når en kontrol fejler, så afdelingen ved det med det samme</div>
  </div>
  <div class="h3">Hvad kunden aldrig ser</div>
  <div class="api"><div>Godik, Ejby, nummerplader, placeringsordrer, andre kunders bookinger,
    driftsstatus og servicehistorik. Kundesiden kalder kun endpoints under <code>/v1/public</code>.</div></div>`;
}

function locView(ptop,sc,kunde){
  const l=byLoc(S.sel);
  ptop.innerHTML=`<button class="back" data-back="root">← Tilbage</button>
    <button class="closex" data-back="root" title="Luk">×</button>
    <h2>${kunde?PARTNER+' '+esc(l.n):'Dagrofa '+esc(l.n)+' '}${kunde?'':`<span style="color:var(--muted);font-weight:400">${l.c}</span>`}</h2>
    <p>${esc(l.a)}, ${esc(l.z)}</p>`;
  if(kunde){
    sc.innerHTML=`<div class="h3">Ledige trailere (${l.free.length})</div>`
      +(l.free.length?l.free.map(kundeRow).join('')
        :'<div class="sub">Ingen ledige trailere i denne afdeling lige nu.</div>');
    return;
  }
  sc.innerHTML=(l.blk.length?`<div class="h3">Spærret</div>`+l.blk.map(trailerRow).join(''):'')
    +(l.svc.length?`<div class="h3">Service</div>`+l.svc.map(svcRow).join(''):'')
    +(l.unnum.length?`<div class="h3">Booking uden trailernummer</div>`+l.unnum.map(b=>
      `<div class="row" style="cursor:default"><div class="rm">
        <div class="reg" style="font-size:14.5px">${esc(b.k)}</div>
        <div class="sub">Ordre ${b.o} · nummer ikke angivet i listen</div></div>
        <div class="rd">${dk(b.f)} – ${dk(b.t)}</div></div>`).join(''):'')
    +`<div class="h3">Trailere på adressen (${l.tr.length})</div>`
    +(l.tr.length?l.tr.map(trailerRow).join(''):'<div class="sub">Ingen trailere står her lige nu.</div>')
    +(S.app==='dagrofa'?`<button class="btn" data-form="udlej">Opret udlejning herfra</button>`:'');
}

function trailerView(ptop,sc,godik){
  const t=byReg(S.trailer),l=byLoc(t.l),s=t.svc;
  ptop.innerHTML=`<button class="back" data-back="loc">← ${esc(l.n)}</button>
    <button class="closex" data-back="root" title="Luk">×</button>
    <h2>${t.r}</h2><p>${SPECS[t.t].navn} · Dagrofa ${esc(l.n)}</p>`;
  const chain=`<div class="chain">
    <div class="step ${t.atGodik?'':'off'}"><i style="background:var(--base)"></i><div>
      <b>Godik · Ejby</b><span>${t.atGodik?'På værkstedet'+(s.retur?' · retur '+dk(s.retur):''):'Ejer af traileren'}</span></div></div>
    <div class="step ${t.atGodik?'off':''}"><i style="background:var(--placed)"></i><div>
      <b>Dagrofa Foodservice ${esc(l.n)}</b>
      <span>${esc(l.a)}, ${esc(l.z)}<br>${t.pl.t?'Udstationeret '+dk(t.pl.f)+' – '+dk(t.pl.t):'Udstationeret siden '+dk(t.pl.f)+' · løber fortsat'} · ordre ${t.o}</span></div></div>
    <div class="step ${t.active?'':'off'}"><i style="background:var(--sub)"></i><div>
      <b>${t.active?esc(t.active.k):'Ingen slutkunde lige nu'}</b>
      <span>${t.active?'Ordre '+t.active.o+' · '+dk(t.active.f)+' – '+dk(t.active.t):
        t.next?'Næste booking '+dk(t.next.f):'Klar til booking'}</span></div></div></div>`;

  const left=`<div class="bigph" style="background-image:url(${IMG[t.t]})"></div>
    ${pill(t.state)}
    ${t.blk?`<div class="alert" style="margin-top:10px"><b>Spærret for booking</b>
      <p>${t.blk.items.map(f=>esc(f.i)+': '+esc(f.note)).join('<br>')}</p>
      ${S.app==='dagrofa'?`<div style="display:flex;gap:9px;margin-top:10px">
        <button class="btn ghost" style="margin:0" data-free="${t.r}">Frigiv</button>
        <button class="btn" style="margin:0" data-order="${t.r}">Bestil service</button></div>`:''}</div>`:''}
    <div class="kv"><span>Står nu</span><span>${t.atGodik?'Godik, Ejby':'Dagrofa '+esc(l.n)}</span></div>
    <div class="kv"><span>Adresse</span><span>${t.atGodik?'Industribuen 2<br>5592 Ejby':esc(l.a)+'<br>'+esc(l.z)}</span></div>
    <div class="kv"><span>Udstationeret</span><span>${t.pl.t?dk(t.pl.f)+' – '+dk(t.pl.t):'siden '+dk(t.pl.f)+', løbende'}</span></div>
    ${godik?`<div class="kv"><span>Hovedlejer</span><span>Dagrofa Foodservice A/S</span></div>
      <div class="kv"><span>Placeringsordre</span><span>${t.o}</span></div>`:''}
    ${S.app==='dagrofa'&&t.bookable&&!t.active?`<button class="btn" data-form="udlej-${t.r}">Opret udlejning</button>`:''}
    ${S.app==='dagrofa'&&!s?`<button class="btn ghost" data-form="new-${t.r}">Anmod om service</button>`:''}`;

  const right=`<div class="h3">Hvor er traileren</div>${chain}
    ${s?`<div class="h3">Åben service</div>`+svcRow(s):''}
    <div class="h3">Servicehistorik</div>
    ${t.hist.length?t.hist.map(svcRow).join(''):'<div class="sub">Ingen afsluttet service.</div>'}
    <div class="h3">Udlejninger</div>
    ${t.subs.length?t.subs.map(b=>`<div class="row" data-book="${b.o}"><div class="rm">
        <div class="reg" style="font-size:14.5px">${esc(b.k)}</div>
        <div class="sub">Ordre ${b.o}${b.att?' · att. '+esc(b.att):''}</div></div>
        <div class="rd">${dk(b.f)} – ${dk(b.t)}<br>${b.state.toLowerCase()}</div></div>`).join('')
      :'<div class="sub">Ingen registrerede udlejninger.</div>'}
    <div class="h3">Visuel kontrol</div>
    ${t.insp.length?t.insp.map(i=>`<div class="row" style="cursor:default"><div class="rm">
        <div class="reg" style="font-size:14.5px">${i.faults.length?'Fejl på '+i.faults.length+' punkt'+(i.faults.length>1?'er':''):'Alt i orden'}</div>
        <div class="sub">${i.phase==='afhentning'?'Ved afhentning':'Ved aflevering'}${i.faults.length?' · '+i.faults.map(f=>esc(f.i)).join(' · '):''}</div></div>
        <div class="rd">${dk(i.at)}<br>${esc(i.af)}</div></div>`).join('')
      :'<div class="sub">Ingen kontrol registreret endnu.</div>'}`;
  sc.innerHTML=`<div class="dgrid"><div>${left}</div><div>${right}</div></div>`;
}
