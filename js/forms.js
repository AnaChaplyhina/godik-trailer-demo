/* Godik Trailer · formularer: booking, kode, udlejning, kontrol, service */

/* ---------- kundens egen booking ---------- */
function bookingForm(ptop,sc){
  const t=byReg(S.form.slice(5)), l=byLoc(t.l), sp=SPECS[t.t];
  const plus=n=>iso(new Date(TODAY.getTime()+n*864e5));
  ptop.innerHTML=`<button class="back" data-back="root">← Fortryd</button>
    <button class="closex" data-back="root" title="Luk">×</button>
    <h2>Book ${sp.navn}</h2><p>${PARTNER} ${esc(l.n)} · ${esc(l.a)}, ${esc(l.z)}</p>`;
  sc.innerHTML=`<div class="pane">
    <label class="f"><span>Navn</span><input class="i" id="k-att" placeholder="Dit fulde navn"></label>
    <label class="f"><span>Firma, hvis du booker for et firma</span><input class="i" id="k-k" placeholder="Valgfrit"></label>
    <label class="f"><span>Mobilnummer</span><input class="i" id="k-tlf" inputmode="tel" placeholder="12 34 56 78"></label>
    <label class="f"><span>Adresse hvor traileren bruges</span><input class="i" id="k-adr" placeholder="Vej og nummer"></label>
    <div style="display:flex;gap:9px">
      <label class="f" style="flex:0 0 40%"><span>Postnr.</span><input class="i" id="k-post" inputmode="numeric" placeholder="6000"></label>
      <label class="f" style="flex:1"><span>By</span><input class="i" id="k-by" readonly placeholder="udfyldes automatisk"></label>
    </div>
    <div style="display:flex;gap:9px">
      <label class="f" style="flex:1"><span>Fra</span><input class="i" type="date" id="k-f" value="${plus(0)}"></label>
      <label class="f" style="flex:1"><span>Til</span><input class="i" type="date" id="k-t" value="${plus(2)}"></label>
    </div>
    <label class="consent"><input type="checkbox" id="k-ok">
      <span>Jeg accepterer, at ${PARTNER} behandler mit navn, mobilnummer og adresse
      til denne udlejning. Oplysningerne slettes senest 24 måneder efter aflevering.
      <a class="lnk" data-page="privacy">Sådan behandler vi dine oplysninger</a></span></label>
    <div class="sub" style="margin-top:10px">Vi sender en firecifret kode til dit mobilnummer for at
      bekræfte, at det er dig. Afdelingen bekræfter derefter bookingen.</div>
    <button class="btn" id="k-save">Fortsæt</button></div>`;
  const g=id=>document.getElementById(id);
  g('k-post').oninput=e=>{const p=POSTNR[e.target.value.trim()];g('k-by').value=p?p[2]:''};
  g('k-save').onclick=()=>{
    const att=g('k-att').value.trim(),tlf=g('k-tlf').value.trim(),adr=g('k-adr').value.trim(),
          post=g('k-post').value.trim(),f=g('k-f').value,ti=g('k-t').value;
    if(!att||!tlf||!adr||!post) return toast('Udfyld navn, mobilnummer og adresse');
    if(!/^[0-9 +]{8,}$/.test(tlf)) return toast('Tjek mobilnummeret');
    if(!POSTNR[post]) return toast('Ukendt postnummer');
    if(!f||!ti||D(ti)<D(f)) return toast('Tjek datoerne');
    if(!freeIn(t.r,f,ti)) return toast('Traileren er optaget i de dage. Vælg andre datoer.');
    if(!g('k-ok').checked) return toast('Sæt flueben ved behandling af oplysninger');
    S.pending={reg:t.r,att,k:g('k-k').value.trim()||att,tlf,adr,post,f,t:ti};
    S.form='otp'; render();
  };
}

/* Bekraeftelse af mobilnummeret. Uden den kan hvem som helst booke i andres navn,
   og linket til bookingen ville kunne aabnes af enhver. */
function otpForm(ptop,sc){
  const p=S.pending; if(!p){S.form=null;return render()}
  const t=byReg(p.reg), l=byLoc(t.l);
  ptop.innerHTML=`<button class="back" data-back="root">← Fortryd</button>
    <button class="closex" data-back="root" title="Luk">×</button>
    <h2>Bekræft dit nummer</h2><p>Vi har sendt en kode til ${esc(p.tlf)}</p>`;
  sc.innerHTML=`<div class="pane">
    <label class="f"><span>Firecifret kode</span>
      <input class="i" id="o-code" inputmode="numeric" maxlength="4" placeholder="1234"
        style="font-size:24px;letter-spacing:.4em;text-align:center"></label>
    <div class="sub">I denne demo sendes ingen SMS. Skriv <b>1234</b>.</div>
    <button class="btn" id="o-ok">Bekræft og send booking</button>
    <button class="btn ghost" id="o-again">Send koden igen</button>
    <div class="h3">Hvorfor</div>
    <div class="sub" style="white-space:normal">Koden knytter bookingen til din telefon.
      Bagefter kan kun du åbne bookingen og lave den visuelle kontrol, og afdelingen ved,
      at nummeret er rigtigt, hvis de skal fat i dig.</div></div>`;
  document.getElementById('o-again').onclick=()=>toast('Ny kode sendt til '+p.tlf);
  document.getElementById('o-ok').onclick=()=>{
    const code=document.getElementById('o-code').value.trim();
    if(code!=='1234') return toast('Forkert kode. Prøv igen.');
    const pc=POSTNR[p.post], o='B-'+(5100+SUBS.filter(b=>String(b.o).startsWith('B-')).length+1);
    SUBS.push({o,r:p.reg,l:t.l,f:p.f,t:p.t,k:p.k,att:p.att,tlf:p.tlf,adr:p.adr,post:p.post,
      by:pc[2],lat:pc[0],lng:pc[1],kt:'',st:'Aktiv',fase:'anmodet',oprettet:iso(TODAY),
      verificeret:true,samtykke:iso(TODAY)});
    const nyb=SUBS[SUBS.length-1];
    sms(nyb,`Tak for din anmodning hos ${PARTNER} ${l.n}. Vi bekræfter hurtigst muligt. Følg den her:`);
    S.mine.push(o); S.pending=null; S.form=null; S.book=o; S.tab='min'; render();
    toast('Nummeret er bekræftet. Anmodningen er sendt til afdelingen.');
  };
}

/* ---------- persondatapolitik ---------- */
function privacyView(ptop,sc){
  ptop.innerHTML=`<button class="back" data-back="root">← Tilbage</button>
    <button class="closex" data-back="root" title="Luk">×</button>
    <h2>Sådan behandler vi dine oplysninger</h2><p>${PARTNER} · trailerudlejning</p>`;
  sc.innerHTML=`<div class="pane">
    <div class="h3">Hvad vi gemmer</div>
    <div class="sub" style="white-space:normal">Navn, mobilnummer og den adresse, hvor traileren bruges.
      Datoerne for udlejningen. Resultatet af den visuelle kontrol, du laver ved afhentning og aflevering,
      og de fotos du eventuelt vedhæfter.</div>
    <div class="h3">Hvorfor</div>
    <div class="sub" style="white-space:normal">For at kunne udlevere traileren til den rigtige person,
      kontakte dig undervejs, og dokumentere vognens stand før og efter lånet. Grundlaget er den aftale,
      du indgår, når du booker.</div>
    <div class="h3">Hvem ser det</div>
    <div class="sub" style="white-space:normal">Den afdeling, du henter traileren i, og leverandøren af
      trailerne, som står for service og reparation. Ingen andre kunder kan se dine oplysninger,
      og vi videregiver dem ikke til markedsføring.</div>
    <div class="h3">Hvor længe</div>
    <div class="sub" style="white-space:normal">Navn, nummer og adresse slettes automatisk senest
      24 måneder efter, at traileren er afleveret. Kontroller og fotos gemmes i samme periode,
      fordi de er dokumentation for vognens stand.</div>
    <div class="h3">Cookies</div>
    <div class="sub" style="white-space:normal">Siden bruger kun den cookie, der holder dig logget
      på din egen booking. Der er ingen statistik- eller marketingcookies, og derfor beder vi ikke
      om samtykke til cookies.</div>
    <div class="h3">Dine rettigheder</div>
    <div class="sub" style="white-space:normal">Du kan bede om indsigt i, rettelse af eller sletning af
      dine oplysninger. Skriv til afdelingen, du har lejet hos. Du kan klage til Datatilsynet.</div></div>`;
}

/* ---------- udlejning oprettet af afdelingen ---------- */
function udlejForm(ptop,sc){
  const pre=S.form.startsWith('udlej-')?S.form.slice(6):'';
  const plus=n=>iso(new Date(TODAY.getTime()+n*864e5));
  const avail=TRAILERS.filter(t=>inScope(t.l)&&t.bookable);
  ptop.innerHTML=`<button class="back" data-back="root">← Fortryd</button>
    <button class="closex" data-back="root" title="Luk">×</button>
    <h2>Opret udlejning</h2><p>Registreres hos Godik med det samme</p>`;
  if(!avail.length){sc.innerHTML='<div class="sub">Ingen trailere til rådighed i den valgte afdeling.</div>';return}
  sc.innerHTML=`<div class="pane">
    <label class="f"><span>Trailer</span><select class="i" id="u-tr">${avail.map(t=>
      `<option value="${t.r}" ${t.r===pre?'selected':''}>${t.r} · ${SPECS[t.t].navn} · ${byLoc(t.l).n}</option>`).join('')}</select></label>
    <label class="f"><span>Firma eller kundenavn</span><input class="i" id="u-k"></label>
    <label class="f"><span>Kontaktperson</span><input class="i" id="u-att"></label>
    <label class="f"><span>Telefon</span><input class="i" id="u-tlf" inputmode="tel"></label>
    <label class="f"><span>Adresse hvor traileren bruges</span><input class="i" id="u-adr"></label>
    <div style="display:flex;gap:9px">
      <label class="f" style="flex:0 0 40%"><span>Postnr.</span><input class="i" id="u-post" inputmode="numeric"></label>
      <label class="f" style="flex:1"><span>By</span><input class="i" id="u-by" readonly placeholder="udfyldes automatisk"></label>
    </div>
    <div style="display:flex;gap:9px">
      <label class="f" style="flex:1"><span>Fra</span><input class="i" type="date" id="u-f" value="${plus(0)}"></label>
      <label class="f" style="flex:1"><span>Til</span><input class="i" type="date" id="u-t" value="${plus(3)}"></label>
    </div>
    <label class="f"><span>Kundekonto</span><input class="i" id="u-kt" placeholder="Valgfri"></label>
    <button class="btn" id="u-save">Opret udlejning</button></div>`;
  const g=id=>document.getElementById(id);
  g('u-post').oninput=e=>{const p=POSTNR[e.target.value.trim()];g('u-by').value=p?p[2]:''};
  g('u-save').onclick=()=>{
    const k=g('u-k').value.trim(),tlf=g('u-tlf').value.trim(),adr=g('u-adr').value.trim(),
          post=g('u-post').value.trim(),f=g('u-f').value,t=g('u-t').value,r=g('u-tr').value;
    if(!k||!tlf||!adr||!post) return toast('Udfyld kunde, telefon og adresse');
    if(!POSTNR[post]) return toast('Ukendt postnummer');
    if(!f||!t||D(t)<D(f)) return toast('Tjek datoerne');
    if(!freeIn(r,f,t)) return toast(r+' er allerede udlejet i den periode');
    const tr=byReg(r), p=POSTNR[post];
    const o='D-'+(4100+SUBS.filter(b=>String(b.o).startsWith('D-')).length+1);
    SUBS.push({o,r,l:tr.l,f,t,k,att:g('u-att').value.trim(),tlf,adr,post,by:p[2],
      lat:p[0],lng:p[1],kt:g('u-kt').value.trim(),st:'Aktiv',
      fase:'bekraeftet',oprettet:iso(TODAY),bekraeftet:iso(TODAY)});
    S.form=null;S.book=o;render();
    toast('Udlejningen er oprettet');
  };
}

/* ---------- visuel kontrol, både ved afhentning og aflevering ---------- */
function checkForm(ptop,sc){
  const parts=S.form.split('-'), phase=parts[1], b=SUBS.find(x=>x.o===parts.slice(2).join('-'));
  if(!b){S.form=null;return render()}
  const t=byReg(b.r), l=byLoc(b.l), kunde=isKunde();
  S.cnotes=S.cnotes||{};
  ptop.innerHTML=`<button class="back" data-back="root">← Fortryd</button>
    <button class="closex" data-back="root" title="Luk">×</button>
    <h2>Visuel kontrol</h2>
    <p>${phase==='afhentning'?'Ved afhentning':'Ved aflevering'} · ${kunde?SPECS[t.t].navn:b.r+' · '+esc(b.k)}</p>`;
  const done=CHECKALL.filter(i=>S.chk[i]).length, faults=CHECKALL.filter(i=>S.chk[i]==='fejl');
  const alt=done===CHECKALL.length&&!faults.length;
  sc.innerHTML=`<div class="pane"><div class="prog">Tjekkes med øjne og hænder. Der skal hverken bil eller strøm til.</div>`
    +CHECK.map(c=>`<div class="ghead"><span>${c.g}</span>${c.hint?`<em>${c.hint}</em>`:''}</div>`
      +c.items.map(i=>{const a=S.chk[i];
        return `<div class="citem ${a==='fejl'?'flag':''}"><div class="cl">${i}${HOW[i]?`<em class="how">${HOW[i]}</em>`:''}</div><div class="tri">
          <button data-chk="${i}" data-val="ok" ${a==='ok'?'data-on="ok"':''}>Ok</button>
          <button data-chk="${i}" data-val="fejl" ${a==='fejl'?'data-on="bad"':''}>Fejl</button></div></div>`
          +(a==='fejl'?`<input class="i cnote" data-note="${i}" placeholder="Bemærkning" value="${esc(S.cnotes[i]||'')}">`:'')}).join('')).join('')
    +`<div class="sub" style="margin-top:14px">Alle punkter tjekkes, mens vognen holder stille.
        Du skal ikke køre for at kunne svare.</div>
      <div class="h3">Konklusion</div>
      <div class="concl ${done<CHECKALL.length?'wait':alt?'ok':'bad'}">${
        done<CHECKALL.length?`${done} af ${CHECKALL.length} punkter tjekket`
        :alt?'Alt i orden':`Fejl fundet på ${faults.length} punkt${faults.length>1?'er':''} – ring 70 20 18 16`}</div>
      <label class="f"><span>Kontrolleret af</span><input class="i" id="c-af" value="${esc(S.chkaf||'')}" placeholder="${kunde?'Dit navn':'Navn og afdeling'}"></label>
      <button class="btn" id="c-done" ${done<CHECKALL.length?'disabled':''}>${
        done<CHECKALL.length?'Tjek alle punkter':alt?'Godkend':'Meld fejl'}</button></div>`;
  const grab=()=>{
    const af=document.getElementById('c-af'); if(af) S.chkaf=af.value;
    sc.querySelectorAll('[data-note]').forEach(n=>S.cnotes[n.dataset.note]=n.value);
  };
  sc.querySelectorAll('[data-chk]').forEach(btn=>btn.onclick=()=>{
    grab(); const k=btn.dataset.chk;
    S.chk[k]=S.chk[k]===btn.dataset.val?null:btn.dataset.val;
    if(!S.chk[k]){delete S.chk[k];delete S.cnotes[k]}
    render();
  });
  sc.querySelectorAll('[data-note]').forEach(n=>n.onchange=grab);
  const dn=document.getElementById('c-done');
  if(dn) dn.onclick=()=>{
    grab();
    if(!S.chkaf) return toast('Skriv hvem der har kontrolleret vognen');
    if(faults.some(f=>!(S.cnotes[f]||'').trim())) return toast('Skriv en bemærkning ved hver fejl');
    const list=faults.map(f=>({i:f,note:(S.cnotes[f]||'').trim()}));
    INSPECTIONS.unshift({o:b.o,r:b.r,l:b.l,phase,at:iso(TODAY),faults:list,af:S.chkaf,
      by:kunde?'kunde':'afdeling'});
    if(list.length){
      /* Traileren spærres for nye bookinger, indtil afdelingen frigiver den. */
      t.blk={at:iso(TODAY),af:S.chkaf,phase,items:list};
      sms(b,phase==='afhentning'
        ? `Der blev fundet fejl på vognen. Kør ikke afsted. Ring til ${PARTNER} ${byLoc(b.l).n} på 70 20 18 16.`
        : `Tak. Vi har noteret bemærkningerne fra afleveringen.`,false);
      if(phase==='aflevering'){b.st='Afsluttet';b.fase='afleveret';b.t=iso(TODAY)}
    }else{
      if(phase==='afhentning'){b.pickupOk=true;
        sms(b,`Kontrollen er godkendt. Afdelingen udleverer nøglen til dig nu.`,false)}
      else {b.st='Afsluttet';b.fase='afleveret';b.t=iso(TODAY);
        sms(b,`Traileren er registreret som afleveret uden bemærkninger. Tak for lån.`,false)}
    }
    S.form=null;S.chk={};S.cnotes={};S.chkaf='';S.book=b.o;
    render();
    toast(list.length
      ? 'Fejlen er meldt. Traileren er spærret, indtil den er udbedret.'
      : phase==='afhentning'?'Godkendt. God tur.':'Tak, traileren er afleveret.');
  };
}

/* ---------- serviceanmodning fra afdelingen ---------- */
function serviceForm(ptop,sc){
  const pre=S.form.startsWith('new-')?S.form.slice(4):'';
  ptop.innerHTML=`<button class="back" data-back="root">← Fortryd</button>
    <button class="closex" data-back="root" title="Luk">×</button>
    <h2>Anmod om service</h2><p>Sendes til Godik Power</p>`;
  const list=TRAILERS.filter(t=>inScope(t.l)&&!t.svc);
  sc.innerHTML=`<div class="pane">
    <label class="f"><span>Trailer</span><select class="i" id="f-tr">${list.map(t=>
      `<option value="${t.r}" ${t.r===pre?'selected':''}>${t.r} · ${SPECS[t.t].navn} · ${byLoc(t.l).n}</option>`).join('')}</select></label>
    <label class="f"><span>Hvad er der galt</span><select class="i" id="f-fejl">
      ${['Køleanlæg','Pakninger','Lys og el','Døre og låse','Hjul og dæk','Støtteben og træk','Indvendig skade','Andet'].map(x=>`<option>${x}</option>`).join('')}</select></label>
    <label class="f"><span>Beskrivelse</span><textarea class="i" id="f-txt" placeholder="Hvad sker der, og hvornår opstod det"></textarea></label>
    <label class="f"><span>Afdeling og navn</span><input class="i" id="f-af" placeholder="F.eks. Dagrofa Esbjerg · 185"></label>
    <button class="btn" id="f-send">Send anmodning</button></div>`;
  document.getElementById('f-send').onclick=()=>{
    const txt=document.getElementById('f-txt').value.trim(),af=document.getElementById('f-af').value.trim();
    if(!txt||!af)return toast('Udfyld beskrivelse og afdeling');
    const r=document.getElementById('f-tr').value,t=byReg(r);
    const id='S-'+(2043+SERVICE.length);
    SERVICE.unshift({id,r,l:t.l,fejl:document.getElementById('f-fejl').value,txt,af,
      at:iso(TODAY),st:'Modtaget',mode:'afhent',afhent:'',retur:'',besog:'',udfort:'',svar:''});
    S.form=null;S.tab='svc';S.svc=id;render();
    toast('Anmodningen ligger nu hos Godik Power');
  };
}

function formView(ptop,sc){
  if(S.form==='otp')              return otpForm(ptop,sc);
  if(S.form.startsWith('book-'))  return bookingForm(ptop,sc);
  if(S.form.startsWith('check-')) return checkForm(ptop,sc);
  if(S.form.startsWith('udlej'))  return udlejForm(ptop,sc);
  return serviceForm(ptop,sc);
}

function toast(m){const el=document.getElementById('toast');el.textContent=m;el.style.display='block';
  clearTimeout(el._t);el._t=setTimeout(()=>el.style.display='none',3200)}
