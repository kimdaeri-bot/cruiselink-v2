#!/usr/bin/env node
// CruiseLink V2 - API 데이터 수집 스크립트 (병렬 처리)
const fs = require('fs');
const path = require('path');

const BASE = 'https://www.widgety.co.uk/api';
const AUTH = 'app_id=fdb0159a2ae2c59f9270ac8e42676e6eb0fb7c36&token=03428626b23f5728f96bb58ff9bcf4bcb04f8ea258b07ed9fa69d8dd94b46b40';
const BATCH = 10; // concurrent requests
const BATCH_DELAY = 500; // ms between batches
const TODAY = new Date().toISOString().slice(0,10);

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function apiFetch(endpoint) {
  const sep = endpoint.includes('?') ? '&' : '?';
  const url = `${BASE}/${endpoint}${sep}${AUTH}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// Batch fetch with concurrency limit
async function batchFetch(endpoints) {
  const results = [];
  for (let i = 0; i < endpoints.length; i += BATCH) {
    const batch = endpoints.slice(i, i + BATCH);
    const batchResults = await Promise.all(batch.map(ep => apiFetch(ep)));
    results.push(...batchResults);
    if (i + BATCH < endpoints.length) await sleep(BATCH_DELAY);
  }
  return results;
}

const portNameKo = {"Tokyo":"도쿄","Yokohama":"요코하마","Kobe":"고베","Osaka":"오사카","Hiroshima":"히로시마","Naha":"나하","Kagoshima":"가고시마","Nagasaki":"나가사키","Hakodate":"하코다테","Aomori":"아오모리","Akita":"아키타","Kanazawa":"가나자와","Miyazaki":"미야자키","Beppu":"벳푸","Shimizu":"시미즈","Sasebo":"사세보","Ishigaki":"이시가키","Busan":"부산","Incheon":"인천","Jeju":"제주","Shanghai":"상하이","Hong Kong":"홍콩","Singapore":"싱가포르","Ho Chi Minh City":"호치민","Bangkok":"방콕","Phuket":"푸켓","Penang":"페낭","Manila":"마닐라","Barcelona":"바르셀로나","Rome":"로마","Civitavecchia":"치비타베키아","Naples":"나폴리","Venice":"베네치아","Dubrovnik":"두브로브니크","Santorini":"산토리니","Mykonos":"미코노스","Athens":"아테네","Piraeus":"피레우스","Istanbul":"이스탄불","Marseille":"마르세유","Nice":"니스","Genoa":"제노바","Palermo":"팔레르모","Valletta":"발레타","Lisbon":"리스본","Southampton":"사우샘프턴","Amsterdam":"암스테르담","Copenhagen":"코펜하겐","Stockholm":"스톡홀름","Helsinki":"헬싱키","Oslo":"오슬로","Bergen":"베르겐","Juneau":"주노","Ketchikan":"케치칸","Skagway":"스캐그웨이","Seward":"수어드","Glacier Bay":"글레이셔 베이","Miami":"마이애미","Fort Lauderdale":"포트 로더데일","Cozumel":"코수멜","Nassau":"나소","Honolulu":"호놀룰루","Maui":"마우이","Santos":"산투스","Messina":"메시나","Cagliari":"칼리아리","La Spezia":"라스페치아","Cannes":"칸","Monaco":"모나코","Malaga":"말라가","Cadiz":"카디스","Funchal":"푼샬","Tenerife":"테네리페","Ocean Cay":"오션 케이","Bridgetown":"브리지타운","Philipsburg":"필립스버그","Charlotte Amalie":"샬럿아말리에","Costa Maya":"코스타 마야","George Town":"조지타운","Roatan":"로아탄","Belize City":"벨리즈시티","Dubai":"두바이","Abu Dhabi":"아부다비","Reykjavik":"레이캬비크","Split":"스플리트","Kotor":"코토르","Corfu":"코르푸","Heraklion":"이라클리온","Rhodes":"로도스","Catania":"카타니아","Bari":"바리","Ravenna":"라벤나","Trieste":"트리에스테","Kiel":"킬","Tallinn":"탈린","Flam":"플롬","Geiranger":"게이랑에르","Stavanger":"스타방에르","Seattle":"시애틀","Victoria":"빅토리아","Sitka":"싯카","New York":"뉴욕","Boston":"보스턴","Bermuda":"버뮤다","San Juan":"산후안","Aruba":"아루바","Curacao":"큐라소","Hilo":"힐로","Kona":"코나","Ensenada":"엔세나다","Ko Samui":"코사무이","Langkawi":"랑카위","Nha Trang":"나트랑","Da Nang":"다낭","Halong Bay":"하롱베이","Port Klang":"포트클랑","Laem Chabang":"램차방","Colombo":"콜롬보","Kochi":"고치","Miyakojima":"미야코지마","Keelung":"지룽","Warnemunde":"바르네뮌데","Warnemünde":"바르네뮌데","Hamburg":"함부르크","Le Havre":"르아브르","Zeebrugge":"제브뤼허","Rio de Janeiro":"리우데자네이루","Salvador":"살바도르","Ajaccio":"아작시오","Ibiza":"이비자","Palma de Mallorca":"팔마 데 마요르카","Ocho Rios":"오초리오스","Labadee":"라바디","Great Stirrup Cay":"그레이트 스터럽 케이","Harvest Caye":"하베스트 케이","Cabo San Lucas":"카보산루카스","Puerto Vallarta":"푸에르토 바야르타","Mazatlan":"마사틀란","Sydney":"시드니","Auckland":"오클랜드","Bora Bora":"보라보라","Las Palmas de G.Canaria":"라스팔마스","Fukuoka":"후쿠오카","Okinawa":"오키나와","Sakaiminato":"사카이미나토","Maizuru":"마이즈루","Aburatsu":"아부라쓰","Cairns":"케언즈","Portland":"포틀랜드","Halifax":"핼리팩스","Havana":"아바나","Cartagena":"카르타헤나","Bonaire":"보네르","Antigua":"안티구아","Grenada":"그레나다","Barbados":"바베이도스","Tortola":"토르톨라","Puerto Plata":"푸에르토플라타","Grand Turk":"그랜드 터크","Nawiliwili":"나윌리윌리","Noumea":"누메아","Suva":"수바","Papeete":"파페에테","Sihanoukville":"시아누크빌","Kuala Lumpur":"쿠알라룸푸르","Mumbai":"뭄바이","Muscat":"무스카트","Doha":"도하","Haifa":"하이파","Limassol":"리마솔","Kusadasi":"쿠사다시","Bodrum":"보드룸","Gdynia":"그디니아","Visby":"비스뷔","Alesund":"올레순","Haugesund":"하우게순","Tromsø":"트롬쇠","Invergordon":"인버고든","Edinburgh":"에딘버러","Icy Strait Point":"아이시 스트레이트 포인트","Haines":"헤인스","Taranto":"타란토","Ilheus":"일레우스","Ilha Grande":"이랴그란지","St. Maarten":"세인트마틴","Ocho Rios":"오초리오스"};
const countryKo = {"Japan":"일본","South Korea":"한국","China":"중국","Taiwan":"대만","Singapore":"싱가포르","Vietnam":"베트남","Thailand":"태국","Malaysia":"말레이시아","Philippines":"필리핀","Indonesia":"인도네시아","India":"인도","Sri Lanka":"스리랑카","Cambodia":"캄보디아","Spain":"스페인","Italy":"이탈리아","France":"프랑스","Greece":"그리스","Turkey":"터키","Croatia":"크로아티아","Montenegro":"몬테네그로","Portugal":"포르투갈","Malta":"몰타","United Kingdom":"영국","Netherlands":"네덜란드","Germany":"독일","Denmark":"덴마크","Sweden":"스웨덴","Norway":"노르웨이","Finland":"핀란드","Iceland":"아이슬란드","Estonia":"에스토니아","Poland":"폴란드","Belgium":"벨기에","United States":"미국","USA":"미국","Canada":"캐나다","Mexico":"멕시코","Bahamas":"바하마","Jamaica":"자메이카","Honduras":"온두라스","Belize":"벨리즈","Brazil":"브라질","Argentina":"아르헨티나","Australia":"호주","New Zealand":"뉴질랜드","United Arab Emirates":"아랍에미리트","Oman":"오만","Qatar":"카타르","Israel":"이스라엘","Egypt":"이집트","Barbados":"바베이도스","Grenada":"그레나다","Aruba":"아루바","Curacao":"큐라소","Dominican Republic":"도미니카 공화국","Puerto Rico":"푸에르토리코","Haiti":"아이티","Cuba":"쿠바","Bermuda":"버뮤다","Cyprus":"키프로스","Monaco":"모나코","Ireland":"아일랜드","Russia":"러시아","Colombia":"콜롬비아","Chile":"칠레","Mauritius":"모리셔스","South Africa":"남아프리카"};
const shipTitleKo = {"MSC Divina":"MSC 디비나","MSC Fantasia":"MSC 판타지아","MSC Splendida":"MSC 스플렌디다","MSC Preziosa":"MSC 프레치오사","MSC Meraviglia":"MSC 메라빌리아","MSC Bellissima":"MSC 벨리시마","MSC Grandiosa":"MSC 그란디오사","MSC Virtuosa":"MSC 비르투오사","MSC Seascape":"MSC 씨스케이프","MSC Seashore":"MSC 씨쇼어","MSC Seaside":"MSC 씨사이드","MSC Seaview":"MSC 씨뷰","MSC Musica":"MSC 무지카","MSC Orchestra":"MSC 오케스트라","MSC Poesia":"MSC 포에시아","MSC Magnifica":"MSC 마그니피카","MSC Lirica":"MSC 리리카","MSC Opera":"MSC 오페라","MSC Sinfonia":"MSC 신포니아","MSC Armonia":"MSC 아르모니아","MSC World Europa":"MSC 월드 유로파","MSC World America":"MSC 월드 아메리카","MSC Euribia":"MSC 유리비아","Norwegian Jewel":"노르웨이전 주얼","Norwegian Jade":"노르웨이전 제이드","Norwegian Pearl":"노르웨이전 펄","Norwegian Gem":"노르웨이전 젬","Norwegian Epic":"노르웨이전 에픽","Norwegian Breakaway":"노르웨이전 브레이크어웨이","Norwegian Getaway":"노르웨이전 겟어웨이","Norwegian Escape":"노르웨이전 이스케이프","Norwegian Joy":"노르웨이전 조이","Norwegian Bliss":"노르웨이전 블리스","Norwegian Encore":"노르웨이전 앙코르","Norwegian Prima":"노르웨이전 프리마","Norwegian Viva":"노르웨이전 비바","Norwegian Aqua":"노르웨이전 아쿠아","Norwegian Star":"노르웨이전 스타","Norwegian Dawn":"노르웨이전 던","Norwegian Sun":"노르웨이전 선","Norwegian Spirit":"노르웨이전 스피릿","Norwegian Sky":"노르웨이전 스카이","Pride of America":"프라이드 오브 아메리카"};

const SE_ASIA = ['Vietnam','Thailand','Malaysia','Philippines','Indonesia','Cambodia','Myanmar','Singapore','Sri Lanka','India'];

function getDest(h) {
  const regions = h.regions||[], sc = h.starts_at?.country||'', countries = h.countries||[];
  for (const r of regions) {
    if (r.includes('Mediterranean')) return 'mediterranean';
    if (r.includes('Alaska')) return 'alaska';
    if (r.includes('Caribbean')||r.includes('Bahamas')) return 'caribbean';
    if (r.includes('Northern Europe')||r.includes('Scandinavia')||r.includes('Baltic')) return 'northern-europe';
    if (r.includes('Hawaii')) return 'hawaii';
  }
  if (regions.some(r=>r.includes('Asia'))) {
    if (['Japan','South Korea'].includes(sc)) {
      if (countries.every(c=>c==='Japan')) return 'japan';
      if (countries.some(c=>SE_ASIA.includes(c))) return 'southeast-asia';
      return 'korea';
    }
    if (countries.some(c=>SE_ASIA.includes(c))) return 'southeast-asia';
    if (countries.length>0&&countries.every(c=>c==='Japan')) return 'japan';
    return 'asia';
  }
  return 'other';
}
const destKo = {'mediterranean':'지중해','alaska':'알래스카','caribbean':'카리브해','northern-europe':'북유럽','hawaii':'하와이','japan':'일본','korea':'한국·일본','southeast-asia':'동남아','asia':'아시아','other':''};

function genTitle(c) {
  const dk=destKo[c.destination]||'', countries=c.countries||[];
  if (countries.length>=2&&['korea','asia','other','southeast-asia'].includes(c.destination)) {
    return `${[...new Set(countries.map(x=>countryKo[x]||x))].slice(0,3).join('·')} ${c.nights}박 크루즈`;
  }
  if (dk) return `${dk} ${c.nights}박 크루즈`;
  if (countries.length>0) return `${[...new Set(countries.map(x=>countryKo[x]||x))].slice(0,2).join('·')} ${c.nights}박 크루즈`;
  return `${c.nights}박 크루즈`;
}
function genHashtags(c) {
  const tags=[];
  const dk=destKo[c.destination]; if(dk)tags.push(`#${dk}크루즈`);
  if(c.operatorShort==='MSC')tags.push('#MSC크루즈'); else if(c.operatorShort==='NCL')tags.push('#NCL크루즈');
  const sk=shipTitleKo[c.shipTitle]; if(sk)tags.push(`#${sk.replace(/\s+/g,'')}`);
  (c.ports||[]).filter(p=>p.nameKo!==c.startsAt?.nameKo).slice(0,2).forEach(p=>{if(p.nameKo)tags.push(`#${p.nameKo}`);});
  return tags.slice(0,5);
}
function extractPorts(it) {
  const ports=[],seen=new Set();
  if(!it?.days) return ports;
  for(const d of it.days) for(const l of(d.locations||[])) if(l.name&&!seen.has(l.name)){seen.add(l.name);ports.push({name:l.name,nameKo:portNameKo[l.name]||l.name});}
  return ports;
}

async function main() {
  console.log('🚢 CruiseLink V2 데이터 수집 시작');
  console.log(`📅 ${TODAY}, 병렬 ${BATCH}개씩\n`);

  // Get all ships
  const p1 = await apiFetch('ships.json?per_page=50');
  let rawShips = p1?.ships||[];
  if (p1?.total > rawShips.length) {
    const p2 = await apiFetch('ships.json?per_page=50&page=2');
    rawShips = rawShips.concat(p2?.ships||[]);
  }
  console.log(`선박 ${rawShips.length}척 (total: ${p1?.total})\n`);

  // Get all ship details in batch
  const slugs = rawShips.map(s=>s.href?.match(/ships\/([^.]+)\.json/)?.[1]).filter(Boolean);
  console.log('선박 상세 수집 중...');
  const shipDetails = await batchFetch(slugs.map(s=>`ships/${s}.json`));
  console.log('선박 상세 완료\n');

  const ships = [];
  const allCruises = [];
  const allPorts = new Set();

  for (let i = 0; i < rawShips.length; i++) {
    const s = rawShips[i];
    const slug = slugs[i];
    const detail = shipDetails[i];
    if (!detail || !slug) continue;

    const facts = detail.ship_facts||{};
    const opName = s.operator?.name||'';
    const opShort = opName.includes('MSC')?'MSC':opName.includes('Norwegian')?'NCL':opName;

    const cruiseRefs = (detail.cruises||[]).map(c=>c.ref).filter(Boolean);
    console.log(`[${i+1}/${rawShips.length}] ${s.title}: ${cruiseRefs.length}개 크루즈 수집 중...`);

    // Batch fetch all holiday details
    const endpoints = cruiseRefs.map(r=>`holidays/dates/${r}.json`);
    const holidays = await batchFetch(endpoints);

    let count = 0;
    for (let j = 0; j < holidays.length; j++) {
      const h = holidays[j];
      if (!h || !h.date_from) continue;
      const df = h.date_from.slice(0,10);
      if (df < TODAY) continue;

      const ports = extractPorts(h.itinerary);
      const countries = h.countries||[];
      ports.forEach(p=>allPorts.add(p.name));
      const price = h.headline_prices?.cruise?.double;
      const sa = h.starts_at||{}, ea = h.ends_at||{};

      const obj = {
        ref:h.date_ref||cruiseRefs[j], shipSlug:slug, shipTitle:s.title,
        operator:opName, operatorShort:opShort,
        dateFrom:df, dateTo:(h.date_to||'').slice(0,10),
        nights:h.cruise_nights||h.duration_days||0,
        regions:h.regions||[], countries, destination:'',
        startsAt:{name:sa.name||'',nameKo:portNameKo[sa.name]||sa.name||'',country:sa.country||'',countryKo:countryKo[sa.country]||sa.country||''},
        endsAt:{name:ea.name||'',nameKo:portNameKo[ea.name]||ea.name||'',country:ea.country||'',countryKo:countryKo[ea.country]||ea.country||''},
        ports, portRoute:ports.map(p=>p.nameKo).join(' → '),
        priceInside:price?.from_inside?Math.round(parseFloat(price.from_inside)):null,
        priceOutside:price?.from_outside?Math.round(parseFloat(price.from_outside)):null,
        priceBalcony:price?.from_balcony?Math.round(parseFloat(price.from_balcony)):null,
        priceSuite:price?.from_suite?Math.round(parseFloat(price.from_suite)):null,
        currency:h.currency||'USD', availability:'available',
        image:s.cover_image_href||'', title:'', hashtags:[],
      };
      obj.destination = getDest(h);
      obj.title = genTitle(obj);
      obj.hashtags = genHashtags(obj);
      allCruises.push(obj);
      count++;
    }

    ships.push({
      id:s.id, slug, title:s.title, titleKo:shipTitleKo[s.title]||s.title,
      operator:opName, operatorShort:opShort,
      profileImage:s.profile_image_href||'', coverImage:s.cover_image_href||'',
      shipClass:s.ship_class||'',
      size:(facts.gross_tonnage||0)>100000?'large':(facts.gross_tonnage||0)>50000?'medium':'small',
      style:opShort==='MSC'?'resort':'freestyle',
      launchYear:facts.launch_year?String(facts.launch_year):'',
      refitYear:facts.refit_year?String(facts.refit_year):'',
      grossTonnage:facts.gross_tonnage||0, length:facts.length||0,
      width:facts.width||0, speed:facts.speed||0,
      capacity:facts.capacity||0, crewCount:facts.crew_count||0,
      deckCount:facts.deck_count||0, cabinCount:facts.cabin_count||0,
      teaser:detail.teaser||'', videoUrl:detail.video_url||'',
      cruiseCount:count,
    });
    console.log(`  → ${count}개 미래 크루즈`);
  }

  allCruises.sort((a,b)=>a.dateFrom.localeCompare(b.dateFrom));

  const dataDir = path.join(__dirname,'..','assets','data');
  fs.mkdirSync(dataDir,{recursive:true});
  fs.writeFileSync(path.join(dataDir,'ships.json'), JSON.stringify(ships,null,2));
  fs.writeFileSync(path.join(dataDir,'cruises.json'), JSON.stringify(allCruises,null,2));

  const untranslated = [...allPorts].filter(n=>!portNameKo[n]);
  if(untranslated.length) fs.writeFileSync(path.join(dataDir,'untranslated-ports.json'), JSON.stringify(untranslated.sort(),null,2));

  const ds={};
  allCruises.forEach(c=>{ds[c.destination]=(ds[c.destination]||0)+1;});
  console.log(`\n📊 ${ships.length}척, ${allCruises.length}개 크루즈`);
  console.log('목적지:', Object.entries(ds).sort((a,b)=>b[1]-a[1]).map(([d,c])=>`${destKo[d]||d}:${c}`).join(', '));
  if(untranslated.length) console.log(`⚠️ 미번역 ${untranslated.length}곳:`, untranslated.slice(0,20).join(', '));
  console.log('✅ 완료!');
}

main().catch(e=>{console.error('Fatal:',e);process.exit(1);});
