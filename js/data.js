/* Godik Trailer · stamdata, tjekliste og demoindhold */

const TODAY=new Date('2026-09-16T12:00:00');
const IMG={normal:'assets/trailer-normal.jpg', mini:'assets/trailer-mini.jpg'};
const CHECK=[
 {g:'Lys',hint:'kig – ingen strøm nødvendig',items:['Lygteglas hele – ingen revner eller huller','Ingen vand eller dug inde i lygterne','Reflekser hele og rene']},
 {g:'Bremser',hint:'håndbremsen, mens vognen holder stille',items:['Håndbremse kan trækkes og holder vognen','Bremsekabel helt','Nødbremsewire monteret og hel']},
 {g:'Dæk',hint:'',items:['Dækkene er tilpas pumpede','Hjulbolte sidder fast']},
 {g:'Kabel og stik',hint:'kig – tilsluttes ikke',items:['Trailerstik helt – alle ben','Kabel uden brud eller bare ledninger','230 V kabel og stik uden skader']},
 {g:'Lås og kobling',hint:'',items:['Dørlås virker – nøglen passer','Tætningslister hele – døren slutter tæt','Koblingshåndtag går let og låser','Bolte på trækstand sidder fast']},
 {g:'Vognen generelt',hint:'',items:['Ingen nye skader eller buler','Vognen står stabilt – kiler lagt']}
];
const CHECKALL=CHECK.flatMap(c=>c.items);
/* Alt tjekkes, mens vognen holder stille. Derfor forklaringerne. */
const HOW={
 'Håndbremse kan trækkes og holder vognen':'Træk håndbremsen helt op, mens vognen holder stille, og prøv at skubbe til vognen. Den må ikke kunne rulle.',
 'Bremsekabel helt':'Kig på wiren fra håndbremsen. Den må ikke være knækket, flosset eller rusten.',
 'Nødbremsewire monteret og hel':'Den tynde wire på trækstangen skal sidde fast og være hel.',
 'Dækkene er tilpas pumpede':'Tryk på dækkets side. Det må ikke give efter som en bold uden luft.',
 'Hjulbolte sidder fast':'Prøv at dreje boltene med fingrene. De må ikke kunne bevæge sig.',
 'Trailerstik helt – alle ben':'Kig ind i stikket. Ingen ben må mangle eller være bøjet.',
 'Koblingshåndtag går let og låser':'Løft håndtaget og slip det. Det skal falde i hak af sig selv.',
 'Tætningslister hele – døren slutter tæt':'Luk døren og se efter lys eller mellemrum langs kanten.',
 'Vognen står stabilt – kiler lagt':'Vognen må ikke vippe, og der skal ligge kiler ved hjulene.'
};
let INSPECTIONS=[];
/* Beskeder til kunden. I demoen vises de i appen, i drift sendes de som SMS. */
let SMS=[];
function sms(b,txt,link){SMS.unshift({at:iso(TODAY),tid:'09:'+String(10+SMS.length*7).slice(-2),
  tlf:b.tlf,o:b.o,txt,link:link!==false});}
const HQ={n:'Godik',a:'Industribuen 2',z:'5592 Ejby',lat:55.4285,lng:9.9005};

/* placeringsordrer: startdato, og slutdato hvis den findes i bookinglisten.
   Uden slutdato løber placeringen stadig. */
const ORDERS={'229441':{f:'2024-12-16'},'229446':{f:'2024-12-16'},'229449':{f:'2024-12-16'},
  '252884':{f:'2026-07-10',t:'2026-09-30'}};
const ORDER=o=>ORDERS[o]||{f:'2025-06-30'};

/* Dagrofa Foodservice afdelinger = leveringsadresser fra bookinglisten */
const LOCS=[
 {c:'182',n:'Aarhus',a:'Edwin Rahrs Vej 68',z:'8220 Brabrand',lat:56.155,lng:10.117},
 {c:'186',n:'Odense',a:'Blækhatten 29',z:'5220 Odense SØ',lat:55.372,lng:10.446},
 {c:'72', n:'Holbæk',a:'Rørvangsvej 10',z:'4300 Holbæk',lat:55.723,lng:11.696},
 {c:'171',n:'Valby',a:'Gammel Køge Landevej 123',z:'2500 Valby',lat:55.652,lng:12.508},
 {c:'173',n:'Amager',a:'Kirstinehøj 48',z:'2770 Kastrup',lat:55.628,lng:12.601,lo:17},
 {c:'70', n:'Hillerød',a:'Høgevej 9',z:'3400 Hillerød',lat:55.921,lng:12.307},
 {c:'74', n:'Helsingør',a:'Ole Rømersvej 4',z:'3000 Helsingør',lat:56.026,lng:12.573},
 {c:'75', n:'Herning',a:'Nakskovvej 7',z:'7400 Herning',lat:56.132,lng:8.975},
 {c:'78', n:'Silkeborg',a:'Nordre Højmarksvej 1',z:'8600 Silkeborg',lat:56.183,lng:9.522},
 {c:'179',n:'Aalborg',a:'Halkjærvej 4',z:'9200 Aalborg SV',lat:57.002,lng:9.858},
 {c:'180',n:'Randers',a:'Alfred Nobels Vej 2',z:'8920 Randers NV',lat:56.478,lng:10.010},
 {c:'181',n:'Viborg',a:'Mariendalsvej 9',z:'8800 Viborg',lat:56.445,lng:9.418},
 {c:'77', n:'Holstebro',a:'Niels P Thomsens Vej 9',z:'7500 Holstebro',lat:56.353,lng:8.640},
 {c:'176',n:'Slagelse',a:'Elmesvinget 39',z:'4200 Slagelse',lat:55.395,lng:11.377},
 {c:'177',n:'Nykøbing F',a:'Herningvej 30',z:'4800 Nykøbing F',lat:54.775,lng:11.869},
 {c:'71', n:'Roskilde',a:'Vestre Hedevej 20',z:'4000 Roskilde',lat:55.629,lng:12.121,lo:17},
 {c:'73', n:'Næstved',a:'Glarmestervænget 2',z:'4700 Næstved',lat:55.245,lng:11.746},
 {c:'183',n:'Horsens',a:'Mossvej 19',z:'8700 Horsens',lat:55.855,lng:9.873},
 {c:'185',n:'Esbjerg',a:'Lillebæltsvej 101',z:'6715 Esbjerg N',lat:55.507,lng:8.492},
 {c:'188',n:'Kolding',a:'Marsvej 8',z:'6000 Kolding',lat:55.494,lng:9.459},
 {c:'192',n:'Fredericia',a:'Vejlevej 139',z:'7000 Fredericia',lat:55.576,lng:9.723,lo:-30}
];

/* trailer: r=nummerplade, t=type, l=afdeling, o=placeringsordre */
const TRAILERS=[
 {r:'BM5655',t:'normal',l:'182',o:'229441'},{r:'BZ1391',t:'normal',l:'182',o:'229441'},{r:'DB8140',t:'mini',l:'182',o:'229441'},
 {r:'CN6324',t:'normal',l:'186',o:'229446'},{r:'CM7926',t:'normal',l:'186',o:'229446'},{r:'DC8563',t:'mini',l:'186',o:'229446'},
 {r:'BY7840',t:'normal',l:'72',o:'229449'},{r:'CM7917',t:'normal',l:'72',o:'229449'},{r:'DC8562',t:'mini',l:'72',o:'229449'},
 {r:'AH5420',t:'normal',l:'72',o:'252884'},
 {r:'JY6455',t:'normal',l:'72',o:'252884'},
 {r:'PB7162',t:'normal',l:'171',o:'234396'},{r:'AH5418',t:'normal',l:'173',o:'234401'},
 {r:'BM8853',t:'normal',l:'70',o:'234403'},{r:'BZ1390',t:'normal',l:'74',o:'234404'},
 {r:'AK4232',t:'normal',l:'75',o:'234407'},{r:'NM8175',t:'normal',l:'78',o:'234409'},
 {r:'MY5991',t:'normal',l:'179',o:'234410'},{r:'MD9699',t:'normal',l:'180',o:'234411'},
 {r:'BZ1370',t:'normal',l:'181',o:'234413'},{r:'BN8863',t:'normal',l:'77',o:'234414'},
 {r:'CN6299',t:'normal',l:'176',o:'234415'},{r:'LP5738',t:'normal',l:'177',o:'234416'},
 {r:'BM8897',t:'normal',l:'71',o:'234418'},{r:'ML9020',t:'normal',l:'71',o:'234418'},
 {r:'BM8855',t:'normal',l:'73',o:'234420'},{r:'LH5642',t:'normal',l:'183',o:'234421'},
 {r:'PC6042',t:'normal',l:'185',o:'234422'},{r:'MD9697',t:'normal',l:'188',o:'234429'},
 {r:'NE8176',t:'normal',l:'192',o:'234431'}
];

/* Dagrofas udlejning videre til slutkunde */
let SUBS=[
 {o:'258369',r:'BM8855',l:'73', f:'2026-09-13',t:'2026-09-20',k:'Buffet Køkkenet I/S',att:'Jane Kirkebjerg Madsen',kt:'30017027'},
 {o:'257930',r:'CN6299',l:'176',f:'2026-09-17',t:'2026-09-21',k:'Kenneth Tvede',kt:'30183397'},
 {o:'258372',r:'BM8853',l:'70', f:'2026-09-11',t:'2026-09-15',k:'Martin Lau Kjeldsen',kt:'940363'},
 {o:'256469',r:'LP5738',l:'177',f:'2026-10-02',t:'2026-10-05',k:'Leif Trane',kt:'30018379'},
 {o:'256955',r:'BM8897',l:'71', f:'2026-10-02',t:'2026-10-05',k:'Nicklas Nygaard Larsen',kt:'30193989'},
 {o:'257454',r:'BM8853',l:'70', f:'2026-10-23',t:'2026-10-26',k:'ISS Klub Frivillig Kjer',kt:'30046482'},
 {o:'258191',r:null,    l:'192',f:'2026-10-23',t:'2026-10-25',k:'Camilla Frishøi',kt:'30168820'},
 {o:'258397',r:'LP5738',l:'177',f:'2026-11-13',t:'2026-11-16',k:'Henriette Nielsen',kt:'30170981'}
];

/* serviceanmodninger.  st: Modtaget → Planlagt → På værksted → Afsluttet */
let SERVICE=[
 {id:'S-2042',r:'PC6042',l:'185',fejl:'Pakninger',txt:'Pakninger skal skiftes.',
  af:'Dagrofa Esbjerg · 185',at:'2026-09-16',st:'Modtaget',mode:'afhent',
  afhent:'',retur:'',besog:'',udfort:'',svar:''}
];


/* ---------- specifikationer vist til slutkunden ---------- */
const SPECS={
  normal:{navn:'Køle- og frysetrailer',
    rows:[['Indvendige mål','4,00 × 1,80 × 1,90 m'],['Lasteevne','ca. 1.400 kg'],
      ['Totalvægt','2.700 kg'],['Temperatur','+5 til −18 °C'],['Strøm','230 V, 10 A'],
      ['Aksler','2 aksler'],['Kørekort','B/E eller B+']]},
  mini:{navn:'Mini-køletrailer',
    rows:[['Indvendige mål','2,00 × 1,40 × 1,80 m'],['Lasteevne','ca. 600 kg'],
      ['Totalvægt','1.300 kg'],['Temperatur','+2 til +10 °C'],['Strøm','230 V, 10 A'],
      ['Aksler','1 aksel'],['Kørekort','Alm. kørekort B']]}
};
const PARTNER='Dagrofa Foodservice';

