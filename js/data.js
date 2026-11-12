// Barn Find name bank v2: every make + model a player can type. Answers are a small subset.
// Format: make|country|model, model, ...   (country drives the "same country / same continent" hint)
const BANK_SRC = `
Abarth|Italy|500, 595, 124 Spider
AC|UK|Cobra, Ace, Aceca
Acura|Japan|NSX, Integra, Legend, RSX, TL, TSX, MDX, RDX, TLX
Alfa Romeo|Italy|Giulia, Giulietta, Spider, GTV, 4C, 8C Competizione, Montreal, Brera, 147, 156, 159, Stelvio, Tonale, Alfasud, 33 Stradale, Duetto, GTA, SZ
Alpine|France|A110, A310, A610
AMC|USA|AMX, Javelin, Gremlin, Pacer, Eagle, Rebel, Hornet, Matador
Ariel|UK|Atom, Nomad
Aston Martin|UK|DB4, DB5, DB6, DB7, DB9, DB11, DB12, DBS, Vantage, V8 Vantage, Vanquish, Virage, Lagonda, One-77, Valkyrie, DBX, Rapide, Bulldog
Audi|Germany|Quattro, Sport Quattro, TT, R8, A3, A4, A5, A6, A8, S4, RS2, RS3, RS4, RS6, Q5, Q7, e-tron GT, 80, 100
Austin|UK|Mini, Seven, Metro, Allegro, Maxi, A40, Princess, Cambridge
Austin-Healey|UK|3000, 100, Sprite
Bentley|UK|Continental GT, Continental R, Mulsanne, Bentayga, Flying Spur, Turbo R, Arnage, Azure, Blower, Speed Six
Bizzarrini|Italy|5300 GT Strada
BMW|Germany|M1, M2, M3, M4, M5, M6, M8, 1M, Z1, Z3, Z4, Z8, i3, i8, iX, 2002, 3.0 CSL, 3 Series, 5 Series, 7 Series, 8 Series, X3, X5, Isetta, 507, 328
Bugatti|France|Veyron, Chiron, EB110, Type 35, Type 57, Divo, Bolide, Tourbillon
Buick|USA|Riviera, GNX, Grand National, Skylark, Roadmaster, Regal, Electra, LeSabre, Wildcat
Cadillac|USA|Eldorado, DeVille, Coupe de Ville, Escalade, Fleetwood, CTS-V, Seville, Allante, Series 62
Caterham|UK|Seven
Chevrolet|USA|Corvette, Camaro, Chevelle, Impala, Bel Air, Nova, El Camino, C10, Silverado, Blazer, Suburban, Tahoe, Monte Carlo, Malibu, Corvair, Nomad, Bolt, Cobalt, SS, Caprice, Vega, Biscayne, Fleetline
Chrysler|USA|300, PT Cruiser, Crossfire, Imperial, New Yorker, Airflow, Town & Country, Newport
Citroën|France|2CV, DS, SM, CX, BX, GS, Traction Avant, H Van, Méhari, XM, Saxo, Xsara, Visa, Ami, C4
Daihatsu|Japan|Charade, Copen, Mira, Cuore, Terios
Datsun|Japan|240Z, 260Z, 280Z, 280ZX, 510, Fairlady, Sunny, Bluebird, Cherry
De Tomaso|Italy|Pantera, Mangusta, Guarà, P72
DMC|USA|DeLorean
Dodge|USA|Charger, Challenger, Viper, Dart, Coronet, Super Bee, Durango, Ram, Demon, Stealth, Neon, Magnum, Polara, Daytona, Caravan
Eunos|Japan|Roadster, Cosmo, Presso
Facel Vega|France|HK500, Facel II
Ferrari|Italy|F40, F50, Enzo, LaFerrari, 288 GTO, 250 GTO, 250 GT California, 275 GTB, 330 P4, 365 GTB/4 Daytona, Dino 246 GT, 308 GTB, 328, 348, F355, 360 Modena, F430, 458 Italia, 488 GTB, F8 Tributo, 296 GTB, SF90, Testarossa, 512 TR, Mondial, 400, 456, 550 Maranello, 575M, 599 GTB, F12berlinetta, 812 Superfast, FF, GTC4Lusso, California, Portofino, Roma, Purosangue, 12Cilindri
Fiat|Italy|500, 600, 850, 126, 124 Spider, X1/9, Panda, Uno, Multipla, Punto, Barchetta, Coupe, Dino, 131, Ritmo, Tipo, Topolino
Ford|USA|Mustang, Model T, Model A, F-150, F-100, Bronco, GT40, GT, Thunderbird, Falcon, Fairlane, Galaxie, Torino, Ranchero, Pinto, Maverick, Escort, Escort RS Cosworth, Fiesta, Focus, Sierra, Sierra RS Cosworth, Capri, Cortina, Anglia, Puma, Probe, Taurus, Crown Victoria, Explorer, Ranger, Raptor, Mustang Mach-E
Genesis|South Korea|G70, G80, G90, GV70, GV80
GMC|USA|Syclone, Typhoon, Sierra, Yukon, Jimmy, Hummer EV
Holden|Australia|Monaro, Commodore, Torana, Kingswood
Honda|Japan|NSX, S2000, S800, S600, Civic, Civic Type R, Integra, Integra Type R, Prelude, CR-X, Accord, Beat, City, Fit, Jazz, CR-V, Odyssey, Insight, e, Del Sol, Ridgeline, Element
Hudson|USA|Hornet, Commodore
Hummer|USA|H1, H2, H3
Hyundai|South Korea|Pony, Elantra, Sonata, i30 N, Veloster, Ioniq 5, Santa Fe, Tucson, Genesis Coupe
Infiniti|Japan|G35, Q45, Q50, Q60, FX35
International Harvester|USA|Scout, Travelall
Iso|Italy|Grifo, Rivolta
Isuzu|Japan|Trooper, VehiCROSS, Impulse, Piazza, Rodeo, Bellett
Jaguar|UK|E-Type, XK120, XK140, XK150, C-Type, D-Type, XJ6, XJ, XJS, XJ220, XK8, XKR, F-Type, F-Pace, Mark 2, S-Type, X-Type, XF, XE, I-Pace, SS100
Jeep|USA|Wrangler, CJ-5, CJ-7, Cherokee, Grand Cherokee, Wagoneer, Gladiator, Renegade, Compass, Commando
Kia|South Korea|Stinger, EV6, Sportage, Sorento, Soul, Telluride, Rio, Ceed
Koenigsegg|Sweden|CC8S, CCX, Agera, Regera, Jesko, One:1, Gemera
Lada|Russia|Niva, Riva, 2101
Lamborghini|Italy|Countach, Miura, Diablo, Murciélago, Gallardo, Huracán, Aventador, Revuelto, Urus, LM002, Espada, Jarama, Islero, Urraco, Silhouette, Jalpa, 350 GT, 400 GT, Reventón, Veneno, Centenario, Sián
Lancia|Italy|Stratos, Delta, Delta Integrale, 037, Fulvia, Aurelia, Flaminia, Beta Montecarlo, Thema, Ypsilon, Lambda, Aprilia, Gamma
Land Rover|UK|Defender, Series I, Series II, Series III, Discovery, Freelander, Range Rover, Range Rover Classic, Range Rover Sport, Range Rover Evoque, Range Rover Velar
Lexus|Japan|LFA, LS 400, IS 300, IS F, SC 300, SC 400, GS, RC F, LC 500, GX, LX, RX
Lincoln|USA|Continental, Mark II, Mark III, Mark IV, Mark V, Mark VIII, Town Car, Navigator, Zephyr
Lotus|UK|Elise, Exige, Esprit, Evora, Elan, Europa, Seven, Elite, Eclat, Emira, Evija, Cortina, Carlton
Maserati|Italy|Ghibli, Bora, Merak, Khamsin, Quattroporte, GranTurismo, MC12, MC20, Biturbo, 3200 GT, Indy, Mistral, Sebring, Levante, A6GCS, 250F
Mazda|Japan|MX-5, RX-7, RX-8, RX-3, Cosmo, 323, 626, Mazda3, Mazda6, MX-6, MX-3, 787B, AZ-1, CX-5, CX-9, CX-30, MX-30, Familia, Luce, R100, Mazdaspeed3, B-Series
McLaren|UK|F1, P1, MP4-12C, 650S, 570S, 600LT, 720S, 765LT, 750S, Senna, Speedtail, Elva, Artura, GT
Mercedes-Benz|Germany|300 SL, 190 SL, 280 SL, 190E, 190E Evolution II, SL, SLK, SLS AMG, SLR McLaren, AMG GT, AMG One, G-Class, S-Class, E-Class, C-Class, W123, W124, 500E, 560 SEC, 600 Pullman, 300 SEL 6.3, CLK GTR, CLS, A-Class, ML, Unimog, Sprinter, EQS, SSK
Mercury|USA|Cougar, Cyclone, Marauder, Grand Marquis, Monterey, Comet, Capri, Sable
Messerschmitt|Germany|KR200
MG|UK|MGA, MGB, MGB GT, Midget, TC, TD, TF, MGF, RV8, Metro 6R4, ZS, MG4
Mini|UK|Classic, Cooper, Cooper S, Countryman, Clubman, Paceman, Moke
Mitsubishi|Japan|Lancer Evolution, 3000GT, GTO, Eclipse, Galant VR-4, Pajero, Montero, Starion, FTO, Delica, L200, Outlander, Mirage, Colt, i-MiEV
Morgan|UK|Plus 4, Plus 8, 4/4, Aero 8, 3 Wheeler, Super 3
Morris|UK|Mini-Minor, Minor, Oxford, Marina, Ital, Eight
Nash|USA|Metropolitan, Rambler
Nissan|Japan|Skyline, Skyline GT-R, GT-R, Fairlady Z, 300ZX, 350Z, 370Z, Z, 200SX, 180SX, 240SX, Silvia, Figaro, Pao, Be-1, S-Cargo, Patrol, Leaf, Micra, Sunny, Pulsar GTI-R, Stagea, Cefiro, Laurel, Cedric, Gloria, President, Maxima, Sentra, Altima, Frontier, Hardbody, Pathfinder, Juke, Qashqai, R390
Noble|UK|M12, M600
Oldsmobile|USA|442, Cutlass, Toronado, Rocket 88, Delta 88, Starfire, Hurst/Olds, Vista Cruiser, Aurora
Opel|Germany|GT, Manta, Kadett, Ascona, Calibra, Omega, Lotus Omega, Corsa, Astra, Speedster, Rekord, Commodore, Diplomat, Senator, Vectra, Insignia
Pagani|Italy|Zonda, Huayra, Utopia
Peugeot|France|203, 403, 404, 504, 505, 106, 205, 205 GTI, 205 T16, 206, 306, 309, 405, 406, 307, 308, 208, 508, 3008, 5008, RCZ, 905
Plymouth|USA|Barracuda, Road Runner, Superbird, GTX, Fury, Duster, Valiant, Belvedere, Satellite, Prowler, Voyager, Neon
Polestar|Sweden|1, 2, 3
Pontiac|USA|GTO, Firebird, Trans Am, Fiero, Bonneville, Catalina, Grand Prix, LeMans, Tempest, Aztek, Solstice, G8, Chieftain, Star Chief
Porsche|Germany|911, 911 Turbo, 930, 964, 993, 996, 997, 991, 992, 912, 356, 550 Spyder, 914, 924, 928, 944, 968, 959, 918 Spyder, Carrera GT, Boxster, Cayman, 718, Cayenne, Macan, Panamera, Taycan, 904, 917, 935, 956, 962
Ram|USA|1500, 2500, TRX
Reliant|UK|Robin, Scimitar
Renault|France|4, 5, 5 Turbo, 8, 16, Dauphine, Floride, Caravelle, Clio, Clio V6, Megane, Megane RS, Twingo, Espace, Avantime, Fuego, Kangoo, Zoe, Sport Spider, Laguna, 21, 25, Captur
Rimac|Croatia|Nevera
Rivian|USA|R1T, R1S
Rolls-Royce|UK|Phantom, Silver Ghost, Silver Cloud, Silver Shadow, Silver Spirit, Corniche, Camargue, Ghost, Wraith, Dawn, Cullinan, Spectre
Rover|UK|Mini, P5, P6, SD1, Metro, 75, 200, 400, 800
Saab|Sweden|92, 96, 99, 900, 900 Turbo, 9000, 9-3, 9-5, Sonett
Saleen|USA|S7
Shelby|USA|Cobra, GT350, GT500, Daytona Coupe, Series 1
Simca|France|1000, 1100, Aronde, Vedette
Skoda|Czech Republic|Octavia, Fabia, Superb, Favorit, 110 R, Felicia, Yeti, Kodiaq, Enyaq, Estelle, Rapid
Smart|Germany|Fortwo, Forfour, Roadster
Spyker|Netherlands|C8
SSC|USA|Ultimate Aero, Tuatara
Studebaker|USA|Avanti, Champion, Golden Hawk, Lark, Commander, Starliner
Subaru|Japan|Impreza, Impreza WRX STI, WRX, WRX STI, BRZ, Legacy, Outback, Forester, SVX, XT, Brat, 360, Baja, Justy, Levorg, Crosstrek, Sambar
Sunbeam|UK|Tiger, Alpine, Imp, Rapier
Suzuki|Japan|Jimny, Samurai, SJ410, Swift, Cappuccino, Vitara, Sidekick, X-90, Alto, Carry
Tesla|USA|Model S, Model 3, Model X, Model Y, Roadster, Cybertruck, Semi
Toyota|Japan|Supra, Celica, MR2, Corolla, Corolla AE86, 2000GT, Land Cruiser, FJ Cruiser, Hilux, Tacoma, Tundra, 4Runner, Prius, Camry, Crown, Century, Sera, Previa, 86, GR86, GR Yaris, GR Corolla, Chaser, Mark II, Soarer, Starlet, Sports 800, Sienna, RAV4, Mirai, Cressida, Tercel, Yaris, Avalon
Trabant|Germany|601, P50
Triumph|UK|TR3, TR4, TR5, TR6, TR7, TR8, Spitfire, GT6, Stag, Herald, Dolomite, Vitesse
Tucker|USA|48
TVR|UK|Griffith, Chimaera, Cerbera, Tuscan, Sagaris, Tamora, Vixen, 3000M, Taimar
Vauxhall|UK|Cresta, Victor, Viva, Firenza, Lotus Carlton, Chevette, Cavalier, Calibra, Astra, Corsa, VX220, Monaro
Vector|USA|W8
Volkswagen|Germany|Beetle, New Beetle, Golf, Golf GTI, Golf R, Rabbit, Polo, Lupo, Up, Jetta, Passat, Scirocco, Corrado, Karmann Ghia, Type 2, Vanagon, Transporter, Thing, Phaeton, Touareg, Tiguan, Fox, Caddy, Amarok, Arteon, Eos, XL1, ID.4, ID. Buzz
Volvo|Sweden|PV444, PV544, Amazon, P1800, 140, 164, 240, 262C, 740, 760, 940, 960, 480, 850, 850 R, C30, C70, S40, S60, S80, S90, V40, V50, V60, V70, V90, XC40, XC60, XC70, XC90, EX30
Willys|USA|MB, Jeep, Aero
Yugo|Serbia|GV, Koral
`;
const MAKE_ALIASES = {
  'Volkswagen': ['vw', 'volks', 'vee dub'], 'Chevrolet': ['chevy', 'chev'], 'Mercedes-Benz': ['mercedes', 'merc', 'benz'],
  'Lamborghini': ['lambo'], 'BMW': ['beemer', 'bimmer', 'beamer'], 'Alfa Romeo': ['alfa'], 'Aston Martin': ['aston'],
  'Cadillac': ['caddy'], 'Jaguar': ['jag'], 'Land Rover': ['landrover', 'landie'], 'Rolls-Royce': ['rolls'],
  'Citroën': ['citroen'], 'Austin-Healey': ['healey'], 'DMC': ['delorean motor company', 'delorean'], 'Oldsmobile': ['olds'],
  'Mitsubishi': ['mitsu'], 'Toyota': ['yota'], 'Infiniti': ['infinity'], 'De Tomaso': ['detomaso'], 'Facel Vega': ['facel'],
  'International Harvester': ['international', 'ih'], 'Mazda': ['mazdaspeed']
};
const MODEL_ALIASES = {
  'Mazda|MX-5': ['miata', 'mx5 miata', 'roadster'], 'Eunos|Roadster': ['eunos'],
  'Volkswagen|Beetle': ['bug', 'kafer', 'type 1', 'fusca', 'vocho', 'coccinelle', 'beetle classic'],
  'Volkswagen|Type 2': ['bus', 'microbus', 'kombi', 'splitty'],
  'Chevrolet|Corvette': ['vette', 'sting ray', 'stingray', 'split window'],
  'Porsche|911 Turbo': ['widowmaker', 'turbo'], 'Porsche|911': ['nine eleven'],
  'Nissan|Skyline GT-R': ['r34', 'r33', 'r32', 'godzilla', 'skyline gtr'], 'Nissan|GT-R': ['r35'],
  'Toyota|Corolla AE86': ['ae86', 'hachiroku', 'trueno', 'levin'], 'Toyota|Supra': ['mk4', 'a80'],
  'Toyota|Land Cruiser': ['fj40', 'landcruiser', 'fj'],
  'Jaguar|E-Type': ['xke', 'xk e', 'etype'], 'Mercedes-Benz|300 SL': ['gullwing'],
  'Mercedes-Benz|G-Class': ['g wagon', 'g wagen', 'gelandewagen'],
  'Citroën|2CV': ['deux chevaux', 'tin snail', 'deudeuche'], 'Citroën|DS': ['goddess', 'deesse'],
  'DMC|DeLorean': ['delorean', 'dmc 12', 'dmc12', 'back to the future'], 'Ford|Model T': ['tin lizzie'],
  'Lamborghini|Countach': ['lp400', 'lp500', 'lp5000', 'quattrovalvole'], 'Lamborghini|Miura': ['p400', 'p400 sv'],
  'Lancia|Stratos': ['stratos hf', 'stratos stradale'], 'Lancia|Delta Integrale': ['integrale'],
  'Land Rover|Defender': ['defender 90', 'defender 110', 'landy'],
  'Volvo|240': ['245', '244', '242', 'brick', '240 gl', '200 series'],
  'Mini|Classic': ['mini', 'mk1 mini', 'mini minor'], 'Morris|Mini-Minor': ['morris mini', 'mini minor'], 'Austin|Mini': ['austin mini', 'mini seven'],
  'Plymouth|Barracuda': ['cuda', 'hemi cuda'], 'Dodge|Charger': ['general lee'],
  'Mitsubishi|Lancer Evolution': ['evo', 'lancer evo'], 'Subaru|Impreza WRX STI': ['sti', 'scooby'],
  'Ferrari|365 GTB/4 Daytona': ['daytona'], 'Ferrari|Dino 246 GT': ['dino'],
  'BMW|M3': ['e30', 'e36', 'e46', 'e92'], 'BMW|2002': ['2002 turbo', '2002tii'], 'Fiat|500': ['cinquecento', 'nuova 500'],
  'Austin-Healey|Sprite': ['frogeye', 'bugeye'], 'Willys|MB': ['willys jeep'], 'Shelby|Cobra': ['ac cobra'], 'AC|Cobra': ['shelby cobra'],
  'Honda|Civic Type R': ['ctr', 'ek9'], 'Mercedes-Benz|190E Evolution II': ['evo ii', 'cosworth 190'],
  'Acura|NSX': ['acura nsx'], 'Honda|NSX': ['honda nsx']
};

// Barn Find guess engine v2: builds the searchable bank and does typo-tolerant matching.
const CONTINENT = { Japan: 'Asia', 'South Korea': 'Asia', USA: 'Americas', Australia: 'Oceania', UK: 'Europe', Germany: 'Europe', Italy: 'Europe', France: 'Europe', Sweden: 'Europe', Russia: 'Europe', Croatia: 'Europe', 'Czech Republic': 'Europe', Netherlands: 'Europe', Serbia: 'Europe' };

function norm(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
const squash = s => s.replace(/ /g, '');

// Damerau-Levenshtein (optimal string alignment)
function dl(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let p2 = null, p = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const c = [i];
    for (let j = 1; j <= n; j++) {
      let v = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, p2[j - 2] + 1);
      c.push(v);
    }
    p2 = p; p = c;
  }
  return p[n];
}
// distance from q to the closest prefix of k (lets "lamborgh" match "lamborghini")
function prefDist(q, k) {
  let best = 99;
  for (let L = Math.max(1, q.length - 1); L <= Math.min(k.length, q.length + 1); L++) best = Math.min(best, dl(q, k.slice(0, L)));
  return best;
}
const allow = len => len >= 8 ? 2 : len >= 4 ? 1 : 0;

function buildBank(src, makeAliases, modelAliases) {
  const entries = [], makes = {};
  src.trim().split('\n').forEach(line => {
    const [make, country, models] = line.split('|');
    const mk = { id: make, kind: 'make', make, country, label: make, keys: [norm(make)].concat((makeAliases[make] || []).map(norm)) };
    makes[make] = mk; entries.push(mk);
    models.split(',').map(s => s.trim()).filter(Boolean).forEach(model => {
      const id = make + '|' + model, mkKeys = mk.keys, mdKeys = [norm(model)].concat((modelAliases[id] || []).map(norm));
      const keys = [];
      mkKeys.forEach(a => mdKeys.forEach(b => keys.push(a + ' ' + b)));
      mdKeys.forEach(b => keys.push(b));
      entries.push({ id, kind: 'model', make, model, country, label: make + ' ' + model, keys: Array.from(new Set(keys)), alias: new Set((modelAliases[id] || []).map(norm)) });
    });
  });
  entries.forEach(e => { e.sq = e.keys.map(squash); e.tok = e.keys.map(k => k.split(' ')); });
  return { entries, makes };
}

// Score one entry for a query. Higher is better; 0 = no match. Returns {s, fuzzy}
function scoreEntry(e, q, qt, qs) {
  let best = 0, fuzzy = true;
  for (let i = 0; i < e.keys.length; i++) {
    const k = e.keys[i], ks = e.sq[i], kt = e.tok[i];
    let s = 0, fz = true;
    if (k === q || ks === qs) { s = e.alias && e.alias.has(k) ? 126 : 120; fz = false; }
    else if (k.startsWith(q) || ks.startsWith(qs)) { s = 100 - Math.min(20, (ks.length - qs.length) * 0.6); fz = false; }
    else {
      // every query token must match a distinct key token by (fuzzy) prefix
      let ok = true, cost = 0; const used = new Set();
      for (const t of qt) {
        let hit = -1, hd = 99;
        kt.forEach((w, j) => { if (used.has(j)) return; const d = w.startsWith(t) ? 0 : (t.length >= 3 ? prefDist(t, w) : 99); if (d < hd) { hd = d; hit = j; } });
        if (hit < 0 || hd > allow(t.length)) { ok = false; break; }
        used.add(hit); cost += hd;
      }
      if (ok) { s = 88 - cost * 12 - Math.min(14, (kt.length - qt.length) * 3); fz = cost > 0; }
      else if (qs.length >= 4) { const d = Math.min(prefDist(qs, ks), dl(qs, ks)); if (d <= allow(qs.length)) s = 70 - d * 12; }
    }
    if (s > best || (s === best && !fz)) { best = s; fuzzy = fz; }
  }
  return { s: best, fuzzy };
}

function search(bank, raw, limit) {
  const q = norm(raw); if (!q) return [];
  const qt = q.split(' '), qs = squash(q), out = [];
  for (const e of bank.entries) {
    const r = scoreEntry(e, q, qt, qs);
    if (r.s > 0) out.push({ e, s: r.s + (e.kind === 'make' && qt.length === 1 ? 4 : 0), fuzzy: r.fuzzy });
  }
  out.sort((a, b) => b.s - a.s || a.e.label.length - b.e.label.length || a.e.label.localeCompare(b.e.label));
  return out.slice(0, limit || 7);
}

// Judge a bank entry against today's answer.
function judge(bank, e, ans) {
  const makeOk = ans.makes.includes(e.make);
  const r = { makeOk, modelOk: false, win: false, near: null, country: 'miss' };
  const ansCountry = bank.makes[ans.makes[0]].country;
  r.country = e.country === ansCountry ? 'hit' : (CONTINENT[e.country] === CONTINENT[ansCountry] ? 'near' : 'miss');
  if (e.kind === 'model' && ans.accept.includes(e.id)) { r.modelOk = r.win = true; return r; }
  if (e.kind === 'model' && ans.near && ans.near[e.id]) r.near = ans.near[e.id];
  return r;
}


// Barn Find answer roster v2: 17 photo cars. Photos from Wikimedia Commons (free licences), plates and name scripts blurred.
// makes = makes that count as "right make"; accept = bank ids that win; near = bank ids that get a "so close" note.
// f = zoom focal point (fraction of photo width/height), chosen on a detail with no badge or script.
const ANSWERS = [
  { id: 'mx5', label: 'Mazda MX-5 Miata (NA)', makes: ['Mazda', 'Eunos'], accept: ['Mazda|MX-5', 'Eunos|Roadster'], near: {},
    era: '1980s (launched 1989)', body: 'Roadster · RWD', engine: '1.6L inline-4, front', origin: 'Japan', f: [0.62, 0.68],
    credit: { a: 'Francigf (en.wikipedia)', l: 'CC BY-SA 3.0', u: 'https://commons.wikimedia.org/wiki/File:Eunos.jpg' } },
  { id: 'f40', label: 'Ferrari F40', makes: ['Ferrari'], accept: ['Ferrari|F40'], near: { 'Ferrari|288 GTO': 'Close: that’s the car it replaced.' },
    era: '1980s (launched 1987)', body: 'Coupe · RWD', engine: '2.9L twin-turbo V8, mid-engine', origin: 'Italy', f: [0.24, 0.52],
    credit: { a: 'Will ainsworth', l: 'CC BY-SA 3.0', u: 'https://commons.wikimedia.org/wiki/File:F40_Ferrari_20090509.jpg' } },
  { id: 'nsx', label: 'Honda NSX (first generation)', makes: ['Honda', 'Acura'], accept: ['Honda|NSX', 'Acura|NSX'], near: {},
    era: '1990s (launched 1990)', body: 'Coupe · RWD', engine: '3.0L V6, mid-engine', origin: 'Japan', f: [0.18, 0.41],
    credit: { a: 'ed g2s', l: 'CC BY-SA 3.0', u: 'https://commons.wikimedia.org/wiki/File:Honda_NSX_red.jpg' } },
  { id: 'etype', label: 'Jaguar E-Type Series 1', makes: ['Jaguar'], accept: ['Jaguar|E-Type'], near: { 'Jaguar|XK150': 'Close: that’s its predecessor.', 'Jaguar|D-Type': 'Close: that’s the racer it grew from.' },
    era: '1960s (launched 1961)', body: 'Roadster · RWD', engine: '3.8L inline-6, front', origin: 'UK', f: [0.54, 0.72],
    credit: { a: 'DeFacto', l: 'CC BY-SA 4.0', u: 'https://commons.wikimedia.org/wiki/File:Jaguar_E-Type_Series_1_3.8_Litre_1961.jpg' } },
  { id: 'countach', label: 'Lamborghini Countach', makes: ['Lamborghini'], accept: ['Lamborghini|Countach'], near: { 'Lamborghini|Diablo': 'Close: that’s the one that replaced it.' },
    era: '1970s (launched 1974)', body: 'Coupe · RWD', engine: 'V12, mid-engine', origin: 'Italy', f: [0.16, 0.40],
    credit: { a: 'Brian Snelson', l: 'CC BY 2.0', u: 'https://commons.wikimedia.org/wiki/File:Lamborghini_Countach_-_Flickr_-_exfordy_(2)_(cropped-2).jpg' } },
  { id: 'mini', label: 'Morris Mini-Minor (the original Mini)', makes: ['Morris', 'Austin', 'Mini', 'Rover'], accept: ['Morris|Mini-Minor', 'Austin|Mini', 'Mini|Classic', 'Mini|Cooper', 'Mini|Cooper S', 'Rover|Mini'], near: { 'Morris|Minor': 'Close: right maker, but that’s the bigger car.' },
    era: '1950s (launched 1959)', body: 'Small 2-door saloon · FWD', engine: '848cc inline-4, front (sideways)', origin: 'UK', f: [0.89, 0.65],
    credit: { a: 'DeFacto', l: 'CC BY-SA 2.5', u: 'https://commons.wikimedia.org/wiki/File:Morris_Mini-Minor_1959_(621_AOK).jpg' } },
  { id: 'skyline', label: 'Nissan Skyline GT-R (R34)', makes: ['Nissan'], accept: ['Nissan|Skyline GT-R', 'Nissan|Skyline'], near: { 'Nissan|GT-R': 'Close: right bloodline, but go back a generation.' },
    era: '1990s (R34 launched 1999)', body: 'Coupe · AWD', engine: '2.6L twin-turbo inline-6, front', origin: 'Japan', f: [0.885, 0.64],
    credit: { a: 'TTTNIS', l: 'CC0', u: 'https://commons.wikimedia.org/wiki/File:Nissan_Skyline_GT-R_R34_V_Spec_II.jpg' } },
  { id: 'beetle', label: 'Volkswagen Beetle (Type 1)', makes: ['Volkswagen'], accept: ['Volkswagen|Beetle'], near: { 'Volkswagen|New Beetle': 'Close: right idea, wrong century.', 'Volkswagen|Karmann Ghia': 'Close: same bones underneath.' },
    era: '1930s (launched 1938)', body: '2-door saloon · RWD', engine: 'Air-cooled flat-4, rear', origin: 'Germany', f: [0.26, 0.76],
    credit: { a: 'Vwexport1300', l: 'CC BY-SA 3.0', u: 'https://commons.wikimedia.org/wiki/File:VW_K%C3%A4fer_Baujahr_1966.jpg' } },
  { id: 'corvette', label: 'Chevrolet Corvette Sting Ray (C2)', makes: ['Chevrolet'], accept: ['Chevrolet|Corvette'], near: {},
    era: '1960s (C2 launched 1963)', body: 'Coupe · RWD', engine: 'V8, front', origin: 'USA', f: [0.62, 0.54],
    credit: { a: 'MercurySable99', l: 'CC BY-SA 4.0', u: 'https://commons.wikimedia.org/wiki/File:1963_Chevrolet_Corvette_Sting_Ray_Sport_Coupe,_front_left,_08-25-2024.jpg' } },
  { id: '2cv', label: 'Citroën 2CV', makes: ['Citroën'], accept: ['Citroën|2CV'], near: { 'Citroën|Méhari': 'Close: same chassis, different body.' },
    era: '1940s (launched 1948)', body: '4-door saloon with roll-back roof · FWD', engine: 'Air-cooled flat-2, front', origin: 'France', f: [0.08, 0.42],
    credit: { a: 'Alexander Migl', l: 'CC BY-SA 4.0', u: 'https://commons.wikimedia.org/wiki/File:Citroen_2CV_1X7A7979.jpg' } },
  { id: 'delorean', label: 'DMC DeLorean', makes: ['DMC'], accept: ['DMC|DeLorean'], near: {},
    era: '1980s (launched 1981)', body: 'Gull-wing coupe · RWD', engine: '2.85L V6, rear', origin: 'An American company, built in Northern Ireland', f: [0.23, 0.2],
    credit: { a: 'Kevin Abato', l: 'CC BY-SA 3.0', u: 'https://commons.wikimedia.org/wiki/File:Delorean_DMC-12_side.jpg' } },
  { id: 'mustang', label: 'Ford Mustang (first generation)', makes: ['Ford'], accept: ['Ford|Mustang'], near: { 'Shelby|GT350': 'Close: that’s the hot version.', 'Mercury|Cougar': 'Close: that’s its cousin.' },
    era: '1960s (launched 1964)', body: 'Coupe · RWD', engine: 'V8 or inline-6, front', origin: 'USA', f: [0.85, 0.42],
    credit: { a: 'Kroelleboelle', l: 'CC BY-SA 3.0', u: 'https://commons.wikimedia.org/wiki/File:1965_Ford_Mustang_2D_Hardtop_Front.jpg' } },
  { id: 'miura', label: 'Lamborghini Miura', makes: ['Lamborghini'], accept: ['Lamborghini|Miura'], near: { 'Lamborghini|Countach': 'Close: that’s the one that came next.' },
    era: '1960s (launched 1966)', body: 'Coupe · RWD', engine: 'V12, mid-engine (sideways)', origin: 'Italy', f: [0.14, 0.2],
    credit: { a: 'Chelsea Jay', l: 'CC BY-SA 4.0', u: 'https://commons.wikimedia.org/wiki/File:1971_Lamborghini_Miura_P400_SV.jpg' } },
  { id: 'stratos', label: 'Lancia Stratos HF Stradale', makes: ['Lancia'], accept: ['Lancia|Stratos'], near: { 'Lancia|037': 'Close: that’s its rally successor.' },
    era: '1970s (launched 1973)', body: 'Coupe · RWD', engine: '2.4L V6, mid-engine', origin: 'Italy', f: [0.91, 0.53],
    credit: { a: 'Mr.choppers', l: 'CC BY-SA 3.0', u: 'https://commons.wikimedia.org/wiki/File:1974_Lancia_Stratos_Stradale_at_Greenwich_2021,_front_left.jpg' } },
  { id: 'defender', label: 'Land Rover Defender 90', makes: ['Land Rover'], accept: ['Land Rover|Defender'], near: { 'Land Rover|Series III': 'Close: right lineage, go newer.', 'Land Rover|Series II': 'Close: right lineage, go newer.', 'Land Rover|Series I': 'Close: right lineage, go newer.' },
    era: '1990s as the Defender (roots in 1948)', body: 'SUV · 4WD', engine: '2.2L diesel inline-4, front', origin: 'UK', f: [0.24, 0.42],
    credit: { a: 'OSX', l: 'Public domain', u: 'https://commons.wikimedia.org/wiki/File:2015_Land_Rover_Defender_(L316_MY15)_90_3-door_wagon_(2015-10-24)_01.jpg' } },
  { id: 'volvo', label: 'Volvo 240 GL wagon', makes: ['Volvo'], accept: ['Volvo|240'], near: { 'Volvo|740': 'Close: same boxy family, one size up.', 'Volvo|940': 'Close: same boxy family, later.' },
    era: '1970s (launched 1974)', body: 'Wagon · RWD', engine: 'Inline-4, front', origin: 'Sweden', f: [0.13, 0.5],
    credit: { a: 'OSX', l: 'Public domain', u: 'https://commons.wikimedia.org/wiki/File:1988-1991_Volvo_240_GL_station_wagon_(2011-06-15)_01.jpg' } },
  { id: 'p930', label: 'Porsche 911 Turbo (930)', makes: ['Porsche'], accept: ['Porsche|911 Turbo', 'Porsche|930', 'Porsche|911'], near: { 'Porsche|964': 'Close: right family, go a generation older.', 'Porsche|993': 'Close: right family, go older.', 'Porsche|912': 'Close: right shape, wrong engine.' },
    era: '1970s (launched 1975)', body: 'Coupe · RWD', engine: '3.0L turbo flat-6, rear', origin: 'Germany', f: [0.86, 0.22],
    credit: { a: 'Mr.choppers', l: 'CC BY-SA 3.0', u: 'https://commons.wikimedia.org/wiki/File:1976_Porsche_930_Turbo,_Emerald_Green_met,_front_left.jpg' } },
];

// Barn Find trivia v3: six questions per car, asked after the photo round reveals it.
// Generated question types: country, decade, class, engine (position + layout), drive. Plus hand-written fact questions.
// cls.o / fact.o are wrong options only. eng = [position, layout]; engAvoid = engine combos that would also be true for some versions.
// f = zoom start point on plain bodywork (checked visually; no badge, light, wheel or vent in the first close-up).
const TRIVIA = {
  mx5: { f: [0.36, 0.62], country: 'Japan', decade: 1980, year: 'Launched in 1989.', cls: { a: 'Two-seat roadster', o: ['Hot hatch', 'Grand tourer', 'Off-roader'] },
    eng: ['Front', 'Inline-4'], engWhy: 'A 1.6-litre four up front.', drive: 'Rear',
    fact: { q: 'Its look was famously inspired by which 1960s British roadster?', a: 'Lotus Elan', o: ['MGB', 'Triumph Spitfire', 'Austin-Healey Sprite'], why: 'Mazda’s designers openly drew on the Lotus Elan.' } },
  f40: { f: [0.36, 0.70], country: 'Italy', decade: 1980, year: 'Launched in 1987.', cls: { a: 'Supercar', o: ['Grand tourer', 'Pony car', 'Hot hatch'] },
    eng: ['Mid', 'V8'], engWhy: 'A 2.9-litre twin-turbo V8 behind the seats.', drive: 'Rear',
    fact: { q: 'What was the F40 built to celebrate?', a: 'Ferrari’s 40th anniversary', o: ['Enzo Ferrari’s 40th birthday', 'Ferrari’s 40th Le Mans win', 'A 40-car production run'], why: 'It marked 40 years of Ferrari, and was the last new model Enzo Ferrari signed off.' } },
  nsx: { f: [0.28, 0.56], country: 'Japan', decade: 1990, year: 'Launched in 1990.', cls: { a: 'Mid-engined sports car', o: ['Pony car', 'Family saloon', 'Off-roader'] },
    eng: ['Mid', 'V6'], engWhy: 'A 3.0-litre V6 behind the seats.', drive: 'Rear',
    fact: { q: 'Which Formula 1 driver famously helped refine its handling?', a: 'Ayrton Senna', o: ['Alain Prost', 'Nigel Mansell', 'Michael Schumacher'], why: 'Senna, then winning in Honda-powered McLarens, tested the prototypes.' } },
  etype: { f: [0.72, 0.40], country: 'UK', decade: 1960, year: 'Launched in 1961.', cls: { a: 'Sports car', o: ['Pony car', 'Economy car', 'Off-roader'] },
    eng: ['Front', 'Inline-6'], engAvoid: ['Front|V12'], engWhy: 'A 3.8-litre straight-six up front (a V12 came later).', drive: 'Rear',
    fact: { q: 'Who is said to have called it “the most beautiful car ever made”?', a: 'Enzo Ferrari', o: ['Henry Ford II', 'Ferdinand Porsche', 'Carroll Shelby'], why: 'The line is widely credited to Enzo Ferrari at its 1961 launch.' } },
  countach: { f: [0.50, 0.40], country: 'Italy', decade: 1970, year: 'On sale from 1974.', cls: { a: 'Supercar', o: ['Grand tourer', 'Pony car', 'Rally special'] },
    eng: ['Mid', 'V12'], engWhy: 'A V12 mounted behind the cabin.', drive: 'Rear',
    fact: { q: 'Unlike most Lamborghinis, Countach isn’t a bull. What is it?', a: 'A Piedmontese cry of amazement', o: ['The designer’s hometown', 'A Swiss mountain pass', 'Italian for “wedge”'], why: 'It’s an exclamation of astonishment in the Piedmont dialect.' } },
  mini: { f: [0.75, 0.52], country: 'UK', decade: 1950, year: 'Launched in 1959.', cls: { a: 'Economy car', o: ['Sports car', 'Off-roader', 'Luxury saloon'] },
    eng: ['Front', 'Inline-4'], engWhy: 'A small four mounted sideways up front.', drive: 'Front',
    fact: { q: 'Who designed the original Mini?', a: 'Alec Issigonis', o: ['John Cooper', 'Colin Chapman', 'Giorgetto Giugiaro'], why: 'Issigonis turned the engine sideways to free up cabin space. John Cooper built the fast versions later.' } },
  skyline: { f: [0.73, 0.50], country: 'Japan', decade: 1990, year: 'This R34 generation arrived in 1999.', cls: { a: 'Performance coupe', o: ['Hot hatch', 'Off-roader', 'Family estate'] },
    eng: ['Front', 'Inline-6'], engWhy: 'A 2.6-litre twin-turbo straight-six up front.', drive: 'All',
    fact: { q: 'Which nickname did the Skyline GT-R earn in Australia?', a: 'Godzilla', o: ['Mothra', 'Ronin', 'The Bullet'], why: 'Wheels magazine named it Godzilla after the R32 dominated Australian touring cars.' } },
  beetle: { f: [0.29, 0.57], country: 'Germany', decade: 1930, year: 'Production began in 1938; mass production came after 1945.', cls: { a: 'Economy car', o: ['Sports car', 'Luxury saloon', 'Off-roader'] },
    eng: ['Rear', 'Flat-4'], engWhy: 'An air-cooled flat-four in the tail.', drive: 'Rear',
    fact: { q: 'Who is credited with designing the Beetle?', a: 'Ferdinand Porsche', o: ['Alec Issigonis', 'Ettore Bugatti', 'Henry Ford'], why: 'Porsche’s team designed it in the 1930s as a “people’s car”.' } },
  corvette: { f: [0.74, 0.42], country: 'USA', decade: 1960, year: 'The C2 Sting Ray arrived for 1963.', cls: { a: 'Sports car', o: ['Family estate', 'Economy car', 'Off-roader'] },
    eng: ['Front', 'V8'], engWhy: 'A V8 up front.', drive: 'Rear',
    fact: { q: 'Which feature of the Sting Ray coupe was offered for 1963 only?', a: 'A split rear window', o: ['Gull-wing doors', 'A T-top roof', 'A mid-mounted engine'], why: 'The split window lasted one year because it blocked the view behind.' } },
  '2cv': { f: [0.25, 0.48], country: 'France', decade: 1940, year: 'Launched in 1948.', cls: { a: 'Economy car', o: ['Sports car', 'Grand tourer', 'Luxury saloon'] },
    eng: ['Front', 'Flat-2'], engWhy: 'An air-cooled two-cylinder up front.', drive: 'Front',
    fact: { q: 'Its brief: carry a basket of eggs across what without breaking one?', a: 'A ploughed field', o: ['A cobbled square', 'A mountain pass', 'A railway crossing'], why: 'Citroën wanted a car for farmers on rough rural roads.' } },
  delorean: { f: [0.55, 0.50], country: 'USA', countryWhy: 'DMC was an American company; the cars were built in Northern Ireland.', decade: 1980, year: 'Launched in 1981.', cls: { a: 'Sports car', o: ['Off-roader', 'Family estate', 'Economy car'] },
    eng: ['Rear', 'V6'], engWhy: 'A 2.85-litre V6 behind the rear axle.', drive: 'Rear',
    fact: { q: 'Which film made it famous?', a: 'Back to the Future', o: ['Knight Rider', 'Blade Runner', 'Ghostbusters'], why: 'Doc Brown’s time machine, 1985.' } },
  mustang: { f: [0.45, 0.30], country: 'USA', decade: 1960, year: 'Launched in 1964.', cls: { a: 'Pony car', o: ['Supercar', 'Off-roader', 'Family estate'] },
    eng: ['Front', 'V8'], engAvoid: ['Front|Inline-6'], engWhy: 'Most were sold with a V8 up front; base cars had a straight-six.', drive: 'Rear',
    fact: { q: 'Where was the Mustang unveiled in April 1964?', a: 'The New York World’s Fair', o: ['The Detroit Auto Show', 'The Daytona 500', 'Le Mans'], why: 'Ford revealed it on 17 April 1964 at the World’s Fair.' } },
  miura: { f: [0.30, 0.33], country: 'Italy', decade: 1960, year: 'Launched in 1966.', cls: { a: 'Supercar', o: ['Pony car', 'Rally special', 'Family estate'] },
    eng: ['Mid', 'V12'], engWhy: 'A V12 mounted sideways behind the seats.', drive: 'Rear',
    fact: { q: 'What is the Miura named after?', a: 'A Spanish fighting-bull breeder', o: ['A Japanese city', 'An Italian racing driver', 'Ferruccio Lamborghini’s hometown'], why: 'Don Eduardo Miura’s ranch bred famous fighting bulls.' } },
  stratos: { f: [0.66, 0.50], country: 'Italy', decade: 1970, year: 'Launched in 1973.', cls: { a: 'Rally homologation special', o: ['Grand tourer', 'Pony car', 'Family estate'] },
    eng: ['Mid', 'V6'], engWhy: 'A 2.4-litre V6 behind the seats.', drive: 'Rear',
    fact: { q: 'Which car donated the Stratos’s engine?', a: 'The Ferrari Dino', o: ['The Fiat 124', 'The Maserati Merak', 'The Alfa Romeo Montreal'], why: 'Its V6 came from the Dino 246; it went on to win three World Rally titles.' } },
  defender: { f: [0.22, 0.34], country: 'UK', decade: 1940, decadeQ: 'Its bloodline began with the Land Rover Series I. When did that launch?', year: 'The Series I arrived in 1948.', cls: { a: 'Off-roader', o: ['Sports car', 'Pony car', 'Economy car'] },
    noEngine: true, drive: 'All', driveWhy: 'Permanent four-wheel drive.',
    fact: { q: 'The first Land Rover was inspired by which wartime vehicle?', a: 'The Willys Jeep', o: ['The VW Kübelwagen', 'The Austin Champ', 'The Dodge WC'], why: 'Maurice Wilks used an ex-army Jeep on his farm and wanted a British answer.' },
    fact2: { q: 'Legend says the first Land Rover was sketched where?', a: 'In the sand on a beach', o: ['On a pub napkin', 'On a factory wall', 'On a tractor bonnet'], why: 'Wilks is said to have drawn it in the sand at Red Wharf Bay, Anglesey.' } },
  volvo: { f: [0.25, 0.45], country: 'Sweden', decade: 1970, year: 'Launched in 1974.', cls: { a: 'Family estate', o: ['Sports car', 'Off-roader', 'Pony car'] },
    eng: ['Front', 'Inline-4'], engAvoid: ['Front|Inline-6', 'Front|V6'], engWhy: 'Most had a four-cylinder up front.', drive: 'Rear',
    fact: { q: 'Which nickname did the 240 earn?', a: 'The Brick', o: ['The Tank', 'The Shoebox', 'The Fridge'], why: 'Its boxy shape and tough build made “the Brick” stick.' } },
  p930: { f: [0.68, 0.42], country: 'Germany', decade: 1970, year: 'On sale from 1975.', cls: { a: 'Sports car', o: ['Off-roader', 'Family estate', 'Economy car'] },
    eng: ['Rear', 'Flat-6'], engWhy: 'A turbocharged flat-six in the tail.', drive: 'Rear',
    fact: { q: 'Which nickname did the 930 earn?', a: 'The Widowmaker', o: ['Godzilla', 'The Black Widow', 'The Shark'], why: 'Sudden turbo boost plus a rear engine made it easy to spin.' } },
};

// Barn Find question builder: turns a car's TRIVIA entry into six multiple-choice rounds.
function qrng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function qshuffle(a, r) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const COUNTRIES = ['Japan', 'Italy', 'Germany', 'UK', 'USA', 'France', 'Sweden'];
const COUNTRY_NAME = { UK: 'the UK', USA: 'the USA' };
const ENG_POS = ['Front', 'Mid', 'Rear'];
const ENG_CFG = ['Inline-4', 'Flat-2', 'Flat-4', 'Inline-6', 'Flat-6', 'V6', 'V8', 'V12'];
const engLabel = (p, c) => p + '-mounted ' + (c[0] === 'V' ? c : c.toLowerCase());
const DRIVE = { Rear: 'Rear wheels', Front: 'Front wheels', All: 'All four wheels' };
const DRIVE_WHY = { Rear: 'Rear-wheel drive.', Front: 'Front-wheel drive.', All: 'All four wheels are driven.' };

function makeQ(r, type, label, q, a, wrong, why) {
  const opts = qshuffle([a].concat(wrong), r);
  return { type, label, q, opts, a: opts.indexOf(a), why };
}
function buildQuestions(day, ans, tv) {
  const out = []; let n = 0;
  const R = () => qrng(day * 7919 + (n++) * 104729 + 17);
  // origin
  { const r = R(); const wrong = qshuffle(COUNTRIES.filter(c => c !== tv.country), r).slice(0, 3);
    const nm = c => COUNTRY_NAME[c] || c;
    out.push(makeQ(r, 'country', 'Origin', 'Where is its maker based?', tv.country, wrong, tv.countryWhy || (ans.makes[0] + ' is based in ' + nm(tv.country) + '.'))); }
  // era
  { const r = R(), d = tv.decade; const pool = [d - 20, d - 10, d + 10, d + 20, d - 30, d + 30].filter(x => x >= 1920 && x <= 2020);
    const wrong = qshuffle(pool.slice(0, 4), r).slice(0, 3).map(x => x + 's');
    out.push(makeQ(r, 'decade', 'Era', tv.decadeQ || 'When did it first go on sale?', d + 's', wrong, tv.year)); }
  // class
  { const r = R(); out.push(makeQ(r, 'class', 'Class', 'Which best describes it?', tv.cls.a, tv.cls.o, '')); }
  // engine
  if (!tv.noEngine) {
    const r = R(), [p, c] = tv.eng, avoid = new Set((tv.engAvoid || []).concat([p + '|' + c]));
    const ok = (pp, cc) => !avoid.has(pp + '|' + cc);
    const otherP = qshuffle(ENG_POS.filter(x => x !== p), r), otherC = qshuffle(ENG_CFG.filter(x => x !== c), r);
    const picks = [];
    const add = (pp, cc) => { if (ok(pp, cc) && !picks.some(x => x[0] === pp && x[1] === cc)) { picks.push([pp, cc]); return true; } return false; };
    for (const pp of otherP) if (add(pp, c)) break;
    for (const cc of otherC) if (add(p, cc)) break;
    for (const pp of otherP) { let done = false; for (const cc of otherC) if (add(pp, cc)) { done = true; break; } if (done) break; }
    out.push(makeQ(r, 'engine', 'Engine', 'Where is the engine, and what kind is it?', engLabel(p, c), picks.map(x => engLabel(x[0], x[1])), tv.engWhy));
  }
  // drive
  { const r = R(); out.push(makeQ(r, 'drive', 'Drive', 'Which wheels does it drive?', DRIVE[tv.drive], Object.keys(DRIVE).filter(k => k !== tv.drive).map(k => DRIVE[k]), tv.driveWhy || DRIVE_WHY[tv.drive])); }
  // story
  { const r = R(); out.push(makeQ(r, 'fact', 'Story', tv.fact.q, tv.fact.a, tv.fact.o, tv.fact.why)); }
  if (tv.fact2) { const r = R(); out.push(makeQ(r, 'fact', 'History', tv.fact2.q, tv.fact2.a, tv.fact2.o, tv.fact2.why)); }
  return out.slice(0, 6);
}

// Ten Tenth's test week: rounds 2-7 look past the day's car to its maker and its class.
// Each car: engine (photo + spec panel), family (another model from the maker), rival (same country, same class) and three harder text questions.
// o = wrong options only. img = key into XCREDITS / the photos folder.
// Rule: when a photo question asks to name a car whose make is recognisable from the photo (a badge or a signature shape),
// all four options come from that same make, so the round tests the model, not the badge.
const ROTATION = ['f40', 'skyline', 'beetle', 'mx5', 'corvette', 'countach', 'p930'];
const XCREDITS = {
  'eng-ls3': { a: 'Junglecat', l: 'CC BY-SA 4.0', u: 'https://commons.wikimedia.org/wiki/File:GM_LS3_Engine.jpg' },
  'eng-flat12': { a: 'Brett Weinstein', l: 'CC BY 2.5', u: 'https://commons.wikimedia.org/wiki/File:SC06_1991_Ferrari_Testarossa_engine.jpg' },
  'eng-917': { a: 'Thomas Vogt', l: 'CC BY-SA 2.0', u: 'https://commons.wikimedia.org/wiki/File:Porsche_917_Engine_(36335658192).jpg' },
  'eng-vr38': { a: 'RocketJohn', l: 'CC BY-SA 4.0', u: 'https://commons.wikimedia.org/wiki/File:Nissan_VR38DETT_Engine_at_Nissan_Engine_Museum.jpg' },
  'eng-13b': { a: 'Wikisympathisant', l: 'CC BY-SA 4.0', u: 'https://commons.wikimedia.org/wiki/File:Mazda_13B_rotary_engine_Deutsches_Museum.jpg' },
  'eng-v12': { a: 'Luc106', l: 'Public domain', u: 'https://commons.wikimedia.org/wiki/File:Lamborghini_Miura_Engine-bay.JPG' },
  'eng-vr6': { a: 'Iamjosemom', l: 'CC BY-SA 4.0', u: 'https://commons.wikimedia.org/wiki/File:Motor_VR6_en_un_Porsche_Cayenne.jpg' },
  'fam-c3': { a: 'Alexander Migl', l: 'CC BY-SA 4.0', u: 'https://commons.wikimedia.org/wiki/File:Chevrolet_Corvette_C3_Stingray_IMG_3199.jpg' },
  'fam-250gto': { a: 'MrWalkr', l: 'CC BY-SA 4.0', u: 'https://commons.wikimedia.org/wiki/File:1962_Ferrari_250_GTO_SP25.jpg' },
  'fam-959': { a: 'M 93', l: 'CC BY-SA 3.0 DE', u: 'https://commons.wikimedia.org/wiki/File:Porsche_959_%E2%80%93_Frontansicht_(2),_21._M%C3%A4rz_2013,_D%C3%BCsseldorf.jpg' },
  'fam-c10': { a: 'TTTNIS', l: 'CC0', u: 'https://commons.wikimedia.org/wiki/File:1970_Nissan_Skyline_2000GT-R.jpg' },
  'fam-cosmo': { a: 'Mytho88', l: 'CC BY-SA 3.0', u: 'https://commons.wikimedia.org/wiki/File:1968_Mazda_Cosmo-Sport_01.jpg' },
  'fam-lm002': { a: 'Detectandpreserve', l: 'CC BY-SA 3.0', u: 'https://commons.wikimedia.org/wiki/File:Lamborghini_LM002_Gen1_Type129_1986-1993_1988_frontleft_2013-03-17_U_(cropped).JPG' },
  'fam-t2': { a: 'Ank Kumar', l: 'CC BY-SA 4.0', u: 'https://commons.wikimedia.org/wiki/File:%27ZH-220661%27_1967_Swiss_Air_Volkswagen_%27Samba%27_Bus_at_Zurich_Paradeplatz_(Ank_Kumar)_01.jpg' },
  'riv-cobra': { a: 'Stahlkocher', l: 'CC BY-SA 3.0', u: 'https://commons.wikimedia.org/wiki/File:Shelby_AC_427_Cobra_vl_blue.jpg' },
  'riv-diablo': { a: 'MrWalkr', l: 'CC BY-SA 4.0', u: 'https://commons.wikimedia.org/wiki/File:1995_Lamborghini_Diablo_SE_30.jpg' },
  'riv-m1': { a: 'Mr.choppers', l: 'CC BY-SA 3.0', u: 'https://commons.wikimedia.org/wiki/File:BMW_M1,_front_right_(Brooklyn).jpg' },
  'riv-rx7': { a: 'Mr.choppers', l: 'CC BY-SA 3.0', u: 'https://commons.wikimedia.org/wiki/File:1994_Mazda_RX-7_R2_in_Vintage_Red,_front_left_(Lime_Rock).jpg' },
  'riv-s2000': { a: 'Rich Niewiroski Jr.', l: 'CC BY 2.5', u: 'https://commons.wikimedia.org/wiki/File:HondaS2000-004.jpg' },
  'riv-pantera': { a: 'MrWalkr', l: 'CC BY-SA 4.0', u: 'https://commons.wikimedia.org/wiki/File:1990_De_Tomaso_Pantera_GT5_S_LC23.jpg' },
  'riv-trabant': { a: 'David Perez', l: 'CC BY-SA 4.0', u: 'https://commons.wikimedia.org/wiki/File:Trabant_601_Limousine_01_by-dpc.jpg' },
};
const LAPS = {
  corvette: { maker: 'Chevrolet', rounds: [
    { label: 'Engine', img: 'eng-ls3', q: 'Name this Chevrolet V8.', stats: [['Layout', 'Pushrod V8'], ['Size', '6.2 litres'], ['Power', '430 hp in the Corvette'], ['Built', '2008 to 2017']], a: 'LS3', o: ['LS7', 'LT1', '454 big-block'], why: 'The LS3 arrived in the C6 Corvette for 2008. The 7.0-litre LS7 powered the Z06, and the LT1 replaced the LS3 in the C7.' },
    { label: 'Family', img: 'fam-c3', q: 'Which Corvette generation is this?', a: 'C3 (1968–1982)', o: ['C1 (1953–1962)', 'C4 (1984–1996)', 'C5 (1997–2004)'], why: 'The C3’s coke-bottle shape ran for 15 model years, longer than any other Corvette.' },
    { label: 'People', q: 'Who is known as the “father of the Corvette”?', a: 'Zora Arkus-Duntov', o: ['Bill Mitchell', 'John DeLorean', 'Carroll Shelby'], why: 'Duntov, a GM engineer, turned the early Corvette into a serious performance car.' },
    { label: 'Rival', img: 'riv-cobra', q: 'Built to beat the Corvette on track in the 1960s, which car is this?', a: 'Shelby Cobra 427', o: ['Shelby Cobra 289', 'Shelby Daytona Coupe', 'Shelby GT350'], why: 'Carroll Shelby put Ford V8s into the British AC Ace. The 427 has much wider wheel arches than the 289.' },
    { label: 'Firsts', q: 'Which Corvette generation was the first with its engine behind the driver?', a: 'C8', o: ['C4', 'C6', 'C7'], why: 'The C8 went mid-engined for the 2020 model year.' },
    { label: 'Legends', q: 'The 1990 Corvette ZR-1 earned which nickname?', a: 'King of the Hill', o: ['Godzilla', 'The Widowmaker', 'Big Daddy'], why: 'Its Lotus-designed LT5 V8 made it the fastest Corvette of its day.' },
  ] },
  f40: { maker: 'Ferrari', rounds: [
    { label: 'Engine', img: 'eng-flat12', q: 'This flat-12’s red cam covers gave which Ferrari its name?', stats: [['Layout', 'Flat-12 (180-degree V12)'], ['Size', '4.9 litres'], ['Power', '390 PS'], ['Built', '1984 to 1996']], a: 'Testarossa', o: ['512 BB', 'F50', 'Mondial'], why: 'Testa rossa means “red head” in Italian.' },
    { label: 'Family', img: 'fam-250gto', q: 'Name this Ferrari, one of the most valuable cars ever sold.', a: '250 GTO', o: ['275 GTB', '250 Testa Rossa', '330 P4'], why: 'Only 36 were built. One sold at auction for $48.4 million in 2018.' },
    { label: 'History', q: 'Ferrari’s prancing horse came from the plane of which First World War pilot?', a: 'Francesco Baracca', o: ['Manfred von Richthofen', 'Eddie Rickenbacker', 'Tazio Nuvolari'], why: 'Baracca’s mother suggested Enzo Ferrari use her son’s emblem for luck.' },
    { label: 'Rival', img: 'riv-diablo', q: 'Which Italian rival is this?', a: 'Lamborghini Diablo', o: ['Lamborghini Countach', 'Lamborghini Murciélago', 'Lamborghini Jalpa'], why: 'The Diablo replaced the Countach in 1990, and the Murciélago replaced the Diablo in 2001.' },
    { label: 'Lineage', q: 'Which car replaced the F40 as Ferrari’s flagship supercar?', a: 'F50', o: ['Enzo', '288 GTO', 'LaFerrari'], why: 'The F50 arrived in 1995, then the Enzo in 2002 and LaFerrari in 2013.' },
    { label: 'Names', q: 'Enzo Ferrari named the Dino line after whom?', a: 'His son, Alfredo', o: ['His father', 'A racing driver', 'His chief engineer'], why: 'Alfredo “Dino” Ferrari worked on the V6 before he died in 1956.' },
  ] },
  p930: { maker: 'Porsche', rounds: [
    { label: 'Engine', img: 'eng-917', q: 'This air-cooled flat-12 gave Porsche its first overall Le Mans win. Which car carried it?', stats: [['Layout', 'Air-cooled flat-12'], ['Size', '4.5 litres at first'], ['Power', 'About 520 hp at first'], ['Le Mans win', '1970']], a: '917', o: ['956', '935', '908'], why: 'The 917K won Le Mans in 1970 and again in 1971.' },
    { label: 'Family', img: 'fam-959', q: 'Name this 1980s Porsche, a showcase for all-wheel drive and twin turbos.', a: '959', o: ['928', '911 GT1', '944 Turbo'], why: 'Built from 1986, it was briefly the fastest road car in the world.' },
    { label: 'Names', q: 'The 911 was nearly called what, until Peugeot objected?', a: '901', o: ['900', '910', '999'], why: 'Peugeot claimed three-digit names with a zero in the middle, so Porsche switched to 911.' },
    { label: 'Rival', img: 'riv-m1', q: 'Which mid-engined German rival from 1978 is this?', a: 'BMW M1', o: ['BMW Turbo (1972 concept)', 'BMW 3.0 CSL', 'BMW Z1'], why: 'The 1972 Turbo concept inspired the M1’s wedge shape. The M1 stayed BMW’s only mid-engined production car until the i8.' },
    { label: 'Firsts', q: 'Which 911 generation was the first with a water-cooled engine?', a: '996', o: ['964', '993', '997'], why: 'The 996 arrived in 1997 and ended the air-cooled era.' },
    { label: 'Firsts', q: 'What was Porsche’s first production car?', a: '356', o: ['911', '550 Spyder', '912'], why: 'The 356 went on sale in 1948.' },
  ] },
  skyline: { maker: 'Nissan', rounds: [
    { label: 'Engine', img: 'eng-vr38', q: 'Name this Nissan engine. Each one is hand-assembled by a single craftsman.', stats: [['Layout', 'Twin-turbo V6'], ['Size', '3.8 litres'], ['Power', '480 to 600 hp'], ['From', '2007']], a: 'VR38DETT', o: ['RB26DETT', 'VQ35DE', 'SR20DET'], why: 'It powers the R35 GT-R, which dropped the Skyline name. The builders are called takumi.' },
    { label: 'Family', img: 'fam-c10', q: 'This first Skyline GT-R, from 1969, earned which nickname?', a: 'Hakosuka', o: ['Kenmeri', 'Godzilla', 'Fairlady'], why: 'Hakosuka roughly means “boxy Skyline”. The next generation was the Kenmeri.' },
    { label: 'Racing', q: 'Which series did the R32 GT-R dominate, winning all 29 races it entered?', a: 'Japanese Touring Car Championship', o: ['Super GT', 'D1 Grand Prix', 'Formula Nippon'], why: 'It won every Group A round from 1990 to 1993.' },
    { label: 'Rival', img: 'riv-rx7', q: 'Which 1990s Japanese rival is this?', a: 'Mazda RX-7', o: ['Mazda RX-8', 'Mazda MX-6', 'Mazda Cosmo (1990)'], why: 'This third-generation RX-7 (FD) ran a twin-turbo rotary. The RX-8 replaced it in 2003.' },
    { label: 'Tech', q: 'Which Nissan system sends power to the front wheels when the rears slip?', a: 'ATTESA E-TS', o: ['HICAS', 'VTEC', 'SH-AWD'], why: 'HICAS is Nissan’s four-wheel steering. VTEC and SH-AWD belong to Honda.' },
    { label: 'Rules', q: 'Under Japan’s “gentlemen’s agreement”, what was the most power a car could claim?', a: '276 hp', o: ['250 hp', '300 hp', '320 hp'], why: 'Makers declared 280 PS (276 hp), though many cars made more.' },
  ] },
  mx5: { maker: 'Mazda', rounds: [
    { label: 'Engine', img: 'eng-13b', q: 'Name this Mazda engine from its specs.', stats: [['Type', 'Wankel rotary'], ['Rotors', 'Two'], ['Size', '1.3 litres'], ['Built', '1973 to 2012']], a: '13B', o: ['12A', '20B', '26B'], why: 'The 12A was smaller, the 20B had three rotors, and the four-rotor 26B won Le Mans in the 787B.' },
    { label: 'Family', img: 'fam-cosmo', q: 'Name this 1967 Mazda, its first rotary-powered car.', a: 'Cosmo Sport', o: ['RX-3', 'R100', 'Luce'], why: 'The Cosmo Sport 110S started Mazda’s twin-rotor era.' },
    { label: 'People', q: 'Mazda’s rotary engine is named after which German engineer?', a: 'Felix Wankel', o: ['Rudolf Diesel', 'Nikolaus Otto', 'August Horch'], why: 'Mazda licensed Wankel’s design from NSU in 1961.' },
    { label: 'Rival', img: 'riv-s2000', q: 'Which Japanese roadster rival is this?', a: 'Honda S2000', o: ['Honda S660', 'Honda Beat', 'Honda CR-X del Sol'], why: 'Its 2.0-litre four revved to 9,000 rpm. The S660 and Beat are much smaller kei-car roadsters.' },
    { label: 'Records', q: 'The MX-5 holds a Guinness world record as the best-selling what?', a: 'Two-seat convertible sports car', o: ['Rear-wheel-drive car', 'Japanese car in Europe', 'Car with pop-up headlights'], why: 'Mazda built its millionth MX-5 in 2016.' },
    { label: 'Lineage', q: 'Which was Mazda’s last rotary-powered sports car?', a: 'RX-8', o: ['RX-7', 'Cosmo', 'MX-6'], why: 'The RX-8 ended production in 2012.' },
  ] },
  countach: { maker: 'Lamborghini', rounds: [
    { label: 'Engine', img: 'eng-v12', q: 'Lamborghini’s first V12, designed by Giotto Bizzarrini, ran from 1963. Which car was the last to use it?', stats: [['Layout', 'Four-cam V12'], ['Size', '3.5 litres at first, 6.5 at the end'], ['In this photo', 'A Miura'], ['Built', '1963 to 2010']], a: 'Murciélago', o: ['Aventador', 'Diablo', 'Gallardo'], why: 'The Aventador got an all-new V12 in 2011. The Gallardo used a V10.' },
    { label: 'Family', img: 'fam-lm002', q: 'Name this 1980s Lamborghini, nicknamed the “Rambo Lambo”.', a: 'LM002', o: ['Urus', 'Espada', 'Jalpa'], why: 'It used the Countach’s V12 and was built from 1986 to 1993.' },
    { label: 'History', q: 'What did Ferruccio Lamborghini build before he built cars?', a: 'Tractors', o: ['Motorcycles', 'Boats', 'Aircraft engines'], why: 'Lamborghini Trattori still makes tractors today.' },
    { label: 'Rival', img: 'riv-pantera', q: 'Which Italian rival is this?', a: 'De Tomaso Pantera', o: ['De Tomaso Mangusta', 'De Tomaso Guarà', 'De Tomaso Longchamp'], why: 'The Pantera replaced the Mangusta in 1971, pairing Italian styling with a Ford V8.' },
    { label: 'People', q: 'Which Bertone designer drew the Countach?', a: 'Marcello Gandini', o: ['Giorgetto Giugiaro', 'Leonardo Fioravanti', 'Battista Pininfarina'], why: 'Gandini also drew the Lancia Stratos.' },
    { label: 'Owners', q: 'Which company has owned Lamborghini since 1998?', a: 'Audi', o: ['Chrysler', 'Fiat', 'Mercedes-Benz'], why: 'Chrysler owned it from 1987 to 1994.' },
  ] },
  beetle: { maker: 'Volkswagen', rounds: [
    { label: 'Engine', img: 'eng-vr6', q: 'Name this Volkswagen engine, a V6 so narrow it uses one cylinder head.', stats: [['Layout', 'Narrow-angle V6'], ['Size', '2.8 to 3.6 litres'], ['This one', 'In a Porsche Cayenne'], ['From', '1991']], a: 'VR6', o: ['W8', 'TDI', 'W12'], why: 'VW Group shared it widely; this 3.6-litre version sits in a Cayenne.' },
    { label: 'Family', img: 'fam-t2', q: 'Name this Volkswagen, built on Beetle mechanicals from 1950.', a: 'Type 2', o: ['Type 3', 'Type 181', 'Karmann Ghia'], why: 'The Type 2 (Bus, Kombi, Transporter) used the Beetle’s air-cooled engine. This one is a Samba.' },
    { label: 'Records', q: 'In 1972 the Beetle passed which car’s production record?', a: 'Ford Model T', o: ['Toyota Corolla', 'Mini', 'Citroën 2CV'], why: 'It passed 15 million cars on 17 February 1972.' },
    { label: 'Rival', img: 'riv-trabant', q: 'Which German economy car is this?', a: 'Trabant 601', o: ['Trabant P50', 'Trabant P60', 'Trabant 1.1'], why: 'The 601 ran from 1964 to 1990 with a two-stroke engine and a Duroplast body. The 1.1 swapped in a VW engine.' },
    { label: 'Records', q: 'The last original Beetle was built in 2003 in which country?', a: 'Mexico', o: ['Brazil', 'Germany', 'South Africa'], why: 'It rolled off the line in Puebla on 30 July 2003.' },
    { label: 'Screen', q: 'In Disney’s films, the Beetle Herbie wears which race number?', a: '53', o: ['7', '99', '1'], why: 'Herbie first raced in The Love Bug (1968).' },
  ] },
};
function lapSeed(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function buildRounds(day, id) {
  return LAPS[id].rounds.map((r, n) => { const rr = qrng(lapSeed(id + ':' + day + ':' + n + ':' + r.q)); rr(); rr(); const opts = qshuffle([r.a].concat(r.o), rr); return Object.assign({}, r, { opts, ans: opts.indexOf(r.a) }); });
}

const PHOTO_FILE = {"f40": "3536341a85.jpg", "skyline": "1452bf89c9.jpg", "beetle": "f6d1c54299.jpg", "mx5": "b242c8238b.jpg", "corvette": "fda6fcc2f3.jpg", "countach": "21ccd7b317.jpg", "p930": "4d68a3dc8a.jpg", "eng-13b": "xe816d5b1be.jpg", "eng-917": "xc2f93ef4e6.jpg", "eng-flat12": "xc979166e01.jpg", "eng-ls3": "xe62907edac.jpg", "eng-v12": "x1cbbcbaed9.jpg", "eng-vr38": "x8841e9daa4.jpg", "eng-vr6": "x2d707f6115.jpg", "fam-250gto": "xb15d86eb49.jpg", "fam-959": "x48f0055497.jpg", "fam-c10": "x03d4d2b080.jpg", "fam-c3": "xd83cfad8e6.jpg", "fam-cosmo": "x94eb347015.jpg", "fam-lm002": "x931742e2ec.jpg", "fam-t2": "x5843e002c2.jpg", "riv-cobra": "xe5e1b7208b.jpg", "riv-diablo": "xcbb4ab8099.jpg", "riv-m1": "x52ffccdaf7.jpg", "riv-pantera": "x6bb49a9b7b.jpg", "riv-rx7": "x2f28919446.jpg", "riv-s2000": "xb65295e01a.jpg", "riv-trabant": "xd0cf2b6928.jpg"};

const NEWS_LIB = [{"src": "news/stratos.jpg", "alt": "Blue Lancia Stratos Stradale on a lawn", "credit": {"a": "Mr.choppers", "l": "CC BY-SA 3.0", "u": "https://commons.wikimedia.org/wiki/File:1974_Lancia_Stratos_Stradale_at_Greenwich_2021,_front_left.jpg"}}, {"src": "news/nsx.jpg", "alt": "Red first-generation Honda NSX parked on a street", "credit": {"a": "ed g2s", "l": "CC BY-SA 3.0", "u": "https://commons.wikimedia.org/wiki/File:Honda_NSX_red.jpg"}}, {"src": "news/mustang.jpg", "alt": "Red 1965 Ford Mustang hardtop", "credit": {"a": "Kroelleboelle", "l": "CC BY-SA 3.0", "u": "https://commons.wikimedia.org/wiki/File:1965_Ford_Mustang_2D_Hardtop_Front.jpg"}}, {"src": "news/delorean.jpg", "alt": "DeLorean DMC-12 with its gull-wing doors open", "credit": {"a": "Kevin Abato", "l": "CC BY-SA 3.0", "u": "https://commons.wikimedia.org/wiki/File:Delorean_DMC-12_side.jpg"}}, {"src": "news/volvo.jpg", "alt": "White Volvo 240 GL estate parked by a kerb", "credit": {"a": "OSX", "l": "Public domain", "u": "https://commons.wikimedia.org/wiki/File:1988-1991_Volvo_240_GL_station_wagon_(2011-06-15)_01.jpg"}}, {"src": "news/mini.jpg", "alt": "Cream 1959 Morris Mini-Minor", "credit": {"a": "DeFacto", "l": "CC BY-SA 2.5", "u": "https://commons.wikimedia.org/wiki/File:Morris_Mini-Minor_1959_(621_AOK).jpg"}}, {"src": "news/etype.jpg", "alt": "Dark green Jaguar E-Type Series 1 roadster", "credit": {"a": "DeFacto", "l": "CC BY-SA 4.0", "u": "https://commons.wikimedia.org/wiki/File:Jaguar_E-Type_Series_1_3.8_Litre_1961.jpg"}}, {"src": "news/defender.jpg", "alt": "Red Land Rover Defender 90", "credit": {"a": "OSX", "l": "Public domain", "u": "https://commons.wikimedia.org/wiki/File:2015_Land_Rover_Defender_(L316_MY15)_90_3-door_wagon_(2015-10-24)_01.jpg"}}, {"src": "news/2cv.jpg", "alt": "Red Citroën 2CV at a classic car show", "credit": {"a": "Alexander Migl", "l": "CC BY-SA 4.0", "u": "https://commons.wikimedia.org/wiki/File:Citroen_2CV_1X7A7979.jpg"}}, {"src": "news/miura.jpg", "alt": "Gold Lamborghini Miura P400 SV on gravel", "credit": {"a": "Chelsea Jay", "l": "CC BY-SA 4.0", "u": "https://commons.wikimedia.org/wiki/File:1971_Lamborghini_Miura_P400_SV.jpg"}}];
