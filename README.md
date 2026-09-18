# Trailerudlejning

Prototype af udlejningen af Godiks køle- og frysetrailere gennem Dagrofa
Foodservice. Ren HTML, CSS og JavaScript uden byggetrin, så den kan ligge
direkte på GitHub Pages.

## Mapper

```
index.html          markup: header, kort, panel. Ingen stil, ingen logik
css/app.css         alt udseende. Farver og mål ligger som variabler i :root
assets/             logo og de to trailerbilleder
data/denmark.js     kystlinjen som SVG-stier, lavet af kommunegrænser fra DAGI
data/postnr.js      592 postnumre med koordinat og bynavn
js/data.js          afdelinger, trailere, ordrer, tjekliste, specifikationer
js/state.js         afledt tilstand: hvem ser hvad, hvad er ledigt, hvad er spærret
js/map.js           projektion, tegning af kortet, træk og klik
js/components.js    de listeelementer der bruges flere steder
js/render.js        vælger hvilken visning panelet skal vise
js/views-customer.js    slutkundens skærmbilleder
js/views-partner.js     Dagrofas og Godiks lister
js/views-service.js     serviceforløbet og Godiks planlægning
js/views-booking.js     bookingens faser set fra alle tre roller
js/forms.js         booking, kodebekræftelse, udlejning, visuel kontrol, service
js/app.js           hændelser og opstart
```

## Rækkefølgen betyder noget

Filerne indlæses i den rækkefølge, der står nederst i `index.html`: først data,
så tilstand, så visninger, til sidst `app.js`, som starter det hele. Flytter du
rundt på dem, går det i stykker.

Der er ikke brugt ES-moduler med vilje. Det holder filerne læsbare uden byggetrin,
og siden virker både på GitHub Pages og på en hvilken som helst webserver.

## Kør den

Læg mappen i roden af et repository og slå GitHub Pages til under Settings, Pages.
Lokalt kan filen ikke bare åbnes fra skrivebordet, fordi browseren så nægter at
hente de andre filer. Kør i stedet en lille server i mappen:

```bash
python3 -m http.server 8000
```

og åbn http://localhost:8000

## Tre roller

Knapperne øverst skifter mellem dem. I drift bliver det tre forskellige logins,
ikke en knap.

**Kunde** ser kun ledige trailere, specifikationer og sin egen booking. Hverken
Godik, Ejby, nummerplader eller andre kunder optræder.

**Dagrofa** ser egne afdelinger, bekræfter bookinger, udleverer trailere, ser
resultatet af den visuelle kontrol og bestiller service.

**Godik Power** ser hele flåden og planlægger service.

## Hvad prototypen ikke gør

Intet gemmes. Alt forsvinder, når siden hentes igen, og to personer ser ikke
hinandens indtastninger. Der er ingen login, og der sendes ingen SMS. Det kommer,
når databasen kobles på. Koden til det ligger i det separate repository
`godik-trailer`.
