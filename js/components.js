/* Godik Trailer · genbrugte listeelementer */

/* ---------- byggeklodser ---------- */
function pill(state){const s=STATE[state];return `<span class="pill"><i style="background:${s[0]}"></i>${s[1]}</span>`}
function svcWhen(s){
  if(s.st==='Afsluttet') return 'udført '+dk(s.udfort||s.besog||s.retur||s.at);
  if(s.mode==='onsite') return s.besog?'tekniker '+dk(s.besog):'afventer dato';
  return (s.afhent?'hentes '+dk(s.afhent):'afventer dato')+(s.retur?'<br>retur '+dk(s.retur):'');
}
function svcRow(s){
  return `<div class="row" data-svc="${s.id}"><div class="rm">
    <div class="reg">${s.r}</div>
    <div class="sub">${esc(s.fejl)} · Dagrofa ${esc(byLoc(s.l).n)}</div>
    <span class="pill"><i style="background:${SVCCOL[s.st]}"></i>${s.st}${s.st!=='Afsluttet'?' · '+(s.mode==='onsite'?'tekniker kører ud':'afhentes til Ejby'):''}</span></div>
    <div class="rd">${svcWhen(s)}</div></div>`;
}
function trailerRow(t){
  const right=t.atGodik?(t.svc.retur?'retur '+dk(t.svc.retur):'på værksted')
    :t.blk?'spærret'
    :t.svc?svcWhen(t.svc)
    :t.active?`retur ${dk(t.active.t)}`:t.next?`booket ${dk(t.next.f)}`:'ledig';
  return `<div class="row" data-tr="${t.r}">
    <div class="thumb" style="background-image:url(${IMG[t.t]})"></div>
    <div class="rm"><div class="reg">${t.r}</div>
      <div class="sub">${SPECS[t.t].navn} · ${t.here?byLoc(t.here).n:'Ejby'}</div>
      ${pill(t.state)}</div><div class="rd">${right}</div></div>`;
}
/* Kunden ser hverken nummerplade, ejer eller driftsstatus. */
function kundeRow(t){
  const l=byLoc(t.l);
  return `<div class="row" data-tr="${t.r}">
    <div class="thumb" style="background-image:url(${IMG[t.t]})"></div>
    <div class="rm"><div class="reg">${SPECS[t.t].navn}</div>
      <div class="sub">${esc(l.n)} · ${esc(l.a)}, ${esc(l.z)}</div>
      <div class="sub">${SPECS[t.t].rows[0][1]} · ${SPECS[t.t].rows[3][1]}</div></div>
    <div class="rd">ledig<br>i dag</div></div>`;
}
