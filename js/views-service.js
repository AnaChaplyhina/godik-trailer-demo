/* Godik Trailer · serviceforløb og planlægning */

/* ---------- service ---------- */
function svcView(ptop,sc,godik){
  const s=SERVICE.find(x=>x.id===S.svc),t=byReg(s.r),l=byLoc(s.l);
  ptop.innerHTML=`<button class="back" data-back="root">← Tilbage</button>
    <button class="closex" data-back="root" title="Luk">×</button>
    <h2>${s.r}</h2><p>${esc(s.fejl)} · Dagrofa ${esc(l.n)}</p>`;
  const plan=s.mode==='onsite'
    ?`<div class="chain">
      <div class="step"><i style="background:var(--alert)"></i><div><b>Anmodt ${dk(s.at)}</b><span>${esc(s.af)}</span></div></div>
      <div class="step ${s.besog?'':'off'}"><i style="background:var(--placed)"></i><div>
        <b>${s.besog?'Tekniker kører ud '+dk(s.besog):'Besøg ikke planlagt'}</b>
        <span>${s.besog?esc(l.a)+', '+esc(l.z):'Godik vælger dato'}</span></div></div>
      <div class="step ${s.udfort?'':'off'}"><i style="background:var(--base)"></i><div>
        <b>${s.udfort?'Udført '+dk(s.udfort):'Arbejdet ikke udført endnu'}</b>
        <span>Traileren bliver stående i afdelingen</span></div></div></div>`
    :`<div class="chain">
      <div class="step"><i style="background:var(--alert)"></i><div><b>Anmodt ${dk(s.at)}</b><span>${esc(s.af)}</span></div></div>
      <div class="step ${s.afhent?'':'off'}"><i style="background:var(--placed)"></i><div>
        <b>${s.afhent?'Afhentes '+dk(s.afhent):'Afhentning ikke planlagt'}</b>
        <span>${s.afhent?esc(l.a)+', '+esc(l.z):'Godik vælger dato'}</span></div></div>
      <div class="step ${s.retur?'':'off'}"><i style="background:var(--base)"></i><div>
        <b>${s.retur?'Leveres tilbage '+dk(s.retur):'Retur ikke planlagt'}</b>
        <span>${s.retur?'Tilbage i '+esc(l.n):'Sættes sammen med afhentningsdatoen'}</span></div></div></div>`;
  const left=`<div class="bigph" style="background-image:url(${IMG[t.t]})"></div>
    <div class="kv"><span>Status</span><span>${s.st}</span></div>
    <div class="kv"><span>Trailer</span><span><a class="lnk" data-tr="${s.r}">${s.r}</a> · ${SPECS[t.t].navn}</span></div>
    <div class="kv"><span>Afdeling</span><span>Dagrofa ${esc(l.n)} · ${l.c}</span></div>
    <div class="kv"><span>Adresse</span><span>${esc(l.a)}<br>${esc(l.z)}</span></div>
    <div class="kv"><span>Løsning</span><span>${s.mode==='onsite'?'Tekniker kører ud':'Traileren hentes til Ejby'}</span></div>
    <div class="h3">Beskrivelse</div><div class="sub" style="white-space:normal">${esc(s.txt)}</div>
    ${s.svar?`<div class="h3">Besked til afdelingen</div><div class="sub" style="white-space:normal">${esc(s.svar)}</div>`:''}`;
  const right=`<div class="h3">Forløb</div>${plan}
    ${godik?godikActions(s):`<div class="sub" style="white-space:normal">Godik Power melder datoerne tilbage her, så snart servicen er planlagt.</div>`}`;
  sc.innerHTML=`<div class="dgrid"><div>${left}</div><div>${right}</div></div>`;
  if(godik) wireActions(s);
}
function godikActions(s){
  const plus=n=>iso(new Date(TODAY.getTime()+n*864e5));
  const mode=`<div class="h3">Sådan løser vi det</div>
    <label class="f"><span>Løsning</span><select class="i" id="a-mode">
      <option value="afhent" ${s.mode==='afhent'?'selected':''}>Vi henter traileren til Ejby</option>
      <option value="onsite" ${s.mode==='onsite'?'selected':''}>Tekniker kører ud til afdelingen</option>
    </select></label>`;
  const besked=`<label class="f"><span>Besked til afdelingen</span><textarea class="i" id="a-svar" placeholder="Kort besked, som Dagrofa kan se">${esc(s.svar)}</textarea></label>`;
  if(s.st==='Modtaget'||s.st==='Planlagt'){
    const datoer=s.mode==='onsite'
      ? `<label class="f"><span>Tekniker kører ud</span><input class="i" type="date" id="a-besog" value="${s.besog||plus(3)}"></label>`
      : `<label class="f"><span>Vi henter traileren</span><input class="i" type="date" id="a-afhent" value="${s.afhent||plus(3)}"></label>
         <label class="f"><span>Vi leverer den tilbage</span><input class="i" type="date" id="a-retur" value="${s.retur||plus(8)}"></label>`;
    return mode+datoer+besked
      +`<button class="btn" id="a-plan">${s.st==='Planlagt'?'Gem ændringer':'Bekræft og send til Dagrofa'}</button>`
      +(s.st==='Planlagt'?(s.mode==='onsite'
          ?`<button class="btn ghost" id="a-done">Arbejdet er udført</button>`
          :`<button class="btn ghost" id="a-pick">Traileren er hentet</button>`):'');
  }
  if(s.st==='På værksted') return `<div class="h3">På værkstedet i Ejby</div>
    <label class="f"><span>Forventet retur</span><input class="i" type="date" id="a-retur" value="${s.retur}"></label>
    ${besked}<button class="btn ghost" id="a-plan">Gem</button>
    <button class="btn" id="a-done">Traileren er leveret tilbage</button>`;
  return `<div class="h3">Afsluttet ${dk(s.udfort)}</div>
    <div class="sub">${s.mode==='onsite'?'Arbejdet blev udført på adressen.':'Traileren står igen hos Dagrofa.'}</div>`;
}
function wireActions(s){
  const g=id=>document.getElementById(id);
  if(g('a-mode')) g('a-mode').onchange=e=>{s.mode=e.target.value;render()};
  if(g('a-plan')) g('a-plan').onclick=()=>{
    if(g('a-afhent')) s.afhent=g('a-afhent').value;
    if(g('a-retur'))  s.retur=g('a-retur').value;
    if(g('a-besog'))  s.besog=g('a-besog').value;
    if(g('a-svar'))   s.svar=g('a-svar').value.trim();
    if(s.st==='Modtaget') s.st='Planlagt';
    render(); toast('Datoer sendt til Dagrofa '+byLoc(s.l).n);
  };
  if(g('a-pick')) g('a-pick').onclick=()=>{s.st='På værksted';render();toast(s.r+' er nu i Ejby')};
  if(g('a-done')) g('a-done').onclick=()=>{
    s.st='Afsluttet'; s.udfort=iso(TODAY);
    const t=byReg(s.r);
    if(t.blk){t.blk=null; toast(s.r+' er repareret og kan bookes igen')}
    else toast(s.mode==='onsite'?'Servicen er registreret som udført':s.r+' er tilbage hos Dagrofa');
    render();
  };
}
