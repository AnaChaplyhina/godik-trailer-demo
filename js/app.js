/* Godik Trailer · hændelser og opstart */

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  if(justPanned&&e.target.closest('svg#map'))return;
  const b=e.target.closest('[data-app],[data-tab],[data-loc],[data-tr],[data-svc],[data-back],[data-form],[data-book],[data-free],[data-order],[data-ok],[data-no],[data-out],[data-page]');
  if(!b)return;
  if(b.dataset.app){
    S=Object.assign(S,{app:b.dataset.app,sel:null,trailer:null,svc:null,book:null,form:null,page:null,dept:null,chk:{},cnotes:{}});
    S.tab=b.dataset.app==='kunde'?'ledige':'flaade';
    setView(VB.slice());
  }
  else if(b.dataset.tab){S.tab=b.dataset.tab;S.sel=null;S.trailer=null;S.svc=null;S.book=null;S.form=null;S.page=null;
    if(b.dataset.tab!=='flaade'&&b.dataset.tab!=='ledige')setView(VB.slice());}
  else if(b.dataset.back){S.svc=null;S.form=null;S.book=null;S.page=null;
    if(b.dataset.back==='loc'&&S.trailer){S.trailer=null}
    else{S.trailer=null;S.sel=null;setView(VB.slice())}}
  else if(b.dataset.loc){S.sel=b.dataset.loc;S.trailer=null;focus(byLoc(b.dataset.loc))}
  else if(b.dataset.tr){const t=byReg(b.dataset.tr);S.trailer=t.r;S.sel=t.l;S.svc=null;S.book=null;focus(byLoc(t.l))}
  else if(b.dataset.svc){S.svc=b.dataset.svc}
  else if(b.dataset.book){S.book=b.dataset.book;S.trailer=null}
  else if(b.dataset.page){S.page=b.dataset.page;S.form=null}
  else if(b.dataset.ok){
    const x=SUBS.find(v=>v.o===b.dataset.ok);
    x.fase='bekraeftet'; x.bekraeftet=iso(TODAY);
    const lx=byLoc(x.l);
    sms(x,`Din trailer er klar. Hentes hos ${PARTNER} ${lx.n}, ${lx.a}, ${lx.z} fra ${dk(x.f)}. `
      +`Husk kørekort. Åbn linket og tryk Start kontrol, når du står ved vognen:`);
    toast('Bekræftet. SMS med link sendt til '+x.tlf);
  }
  else if(b.dataset.no){
    const x=SUBS.find(v=>v.o===b.dataset.no);
    x.fase='afvist'; x.st='Afsluttet';
    sms(x,`Vi kan desværre ikke bekræfte din booking hos ${PARTNER} ${byLoc(x.l).n}. `
      +`Ring til afdelingen på 70 20 18 16, så finder vi en anden løsning.`,false);
    toast('Afvist. Kunden har fået besked på SMS.');
  }
  else if(b.dataset.out){
    const x=SUBS.find(v=>v.o===b.dataset.out);
    x.fase='udleveret'; x.udleveret=iso(TODAY);
    sms(x,`God tur. Aflever traileren senest ${dk(x.t)} hos ${PARTNER} ${byLoc(x.l).n}. `
      +`Husk kontrollen ved aflevering. Den ligger her:`);
    toast('Udleveret. SMS med afleveringsdato sendt.');
  }
  else if(b.dataset.free){
    const t=byReg(b.dataset.free); t.blk=null;
    toast(t.r+' er frigivet og kan bookes igen');
  }
  else if(b.dataset.order){
    const t=byReg(b.dataset.order);
    if(!t.svc){
      SERVICE.unshift({id:'S-'+(2043+SERVICE.length),r:t.r,l:t.l,fejl:'Fundet ved visuel kontrol',
        txt:t.blk.items.map(f=>f.i+': '+f.note).join('. '),af:'Dagrofa '+byLoc(t.l).n,
        at:iso(TODAY),st:'Modtaget',mode:'afhent',afhent:'',retur:'',besog:'',udfort:'',svar:''});
      toast('Serviceanmodning sendt til Godik Power');
    }
  }
  else if(b.dataset.form){S.form=b.dataset.form;
    if(b.dataset.form.startsWith('check-')){S.chk={};S.cnotes={};S.chkaf=''}}
  render();
});
document.getElementById('q').addEventListener('input',e=>{
  S.q=e.target.value.trim();S.sel=null;S.trailer=null;S.svc=null;S.book=null;S.form=null;
  S.tab=isKunde()?'ledige':'flaade';render()});

drawLand();
render();
