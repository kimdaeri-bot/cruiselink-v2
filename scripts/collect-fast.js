#!/usr/bin/env node
// 2단계 수집: Phase 1 = 선박+크루즈 ref, Phase 2 = 크루즈 상세(가격/일정)
const fs = require('fs');
const path = require('path');

const BASE = 'https://www.widgety.co.uk/api';
const AUTH = 'app_id=fdb0159a2ae2c59f9270ac8e42676e6eb0fb7c36&token=03428626b23f5728f96bb58ff9bcf4bcb04f8ea258b07ed9fa69d8dd94b46b40';
const OUT = path.join(__dirname, '..', 'assets', 'data');
const TODAY = new Date().toISOString().slice(0,10);
const BATCH = 15;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function apiFetch(ep) {
  const url = `${BASE}/${ep}${ep.includes('?')?'&':'?'}${AUTH}`;
  try { const r = await fetch(url); if(!r.ok) return null; return await r.json(); }
  catch { return null; }
}

async function batchFetch(eps) {
  const results = [];
  for(let i=0; i<eps.length; i+=BATCH) {
    const batch = eps.slice(i, i+BATCH);
    const r = await Promise.all(batch.map(apiFetch));
    results.push(...r);
    process.stdout.write(`  ${Math.min(i+BATCH, eps.length)}/${eps.length}\r`);
    if(i+BATCH < eps.length) await sleep(400);
  }
  console.log();
  return results;
}

// Port/country/ship translations
const portKo = {"Tokyo":"도쿄","Yokohama":"요코하마","Kobe":"고베","Osaka":"오사카","Hiroshima":"히로시마","Naha":"나하","Kagoshima":"가고시마","Nagasaki":"나가사키","Hakodate":"하코다테","Beppu":"벳푸","Shimizu":"시미즈","Sasebo":"사세보","Ishigaki":"이시가키","Busan":"부산","Incheon":"인천","Jeju Island":"제주도","Shanghai":"상하이","Hong Kong":"홍콩","Singapore":"싱가포르","Barcelona":"바르셀로나","Rome":"로마","Civitavecchia":"치비타베키아","Naples":"나폴리","Venice":"베네치아","Dubrovnik":"두브로브니크","Santorini":"산토리니","Mykonos":"미코노스","Athens":"아테네","Piraeus":"피레우스","Marseille":"마르세유","Genoa":"제노바","Valletta":"발레타","Lisbon":"리스본","Southampton":"사우샘프턴","Amsterdam":"암스테르담","Copenhagen":"코펜하겐","Stockholm":"스톡홀름","Helsinki":"헬싱키","Oslo":"오슬로","Bergen":"베르겐","Juneau":"주노","Ketchikan":"케치칸","Skagway":"스캐그웨이","Seward":"수어드","Miami":"마이애미","Fort Lauderdale":"포트 로더데일","Cozumel":"코수멜","Nassau":"나소","Honolulu":"호놀룰루","Maui":"마우이","Keelung (Chilung)":"지룽","Keelung":"지룽","Miyako Islands":"미야코지마","Kochi":"고치","Fukuoka":"후쿠오카","Messina":"메시나","La Spezia":"라스페치아","Cannes":"칸","Malaga":"말라가","Split":"스플리트","Kotor":"코토르","Corfu":"코르푸","Rhodes":"로도스","Phuket":"푸켓","Penang":"페낭","Langkawi":"랑카위","Cabo San Lucas":"카보산루카스","Puerto Vallarta":"푸에르토 바야르타","Seattle":"시애틀","Victoria":"빅토리아","New York":"뉴욕","Bermuda":"버뮤다","Reykjavik":"레이캬비크","Dubai":"두바이","Haifa":"하이파","Kusadasi":"쿠사다시","Flam":"플롬","Geiranger":"게이랑에르","Stavanger":"스타방에르","Tallinn":"탈린","Kiel":"킬","Hamburg":"함부르크","Le Havre":"르아브르","Palma de Mallorca":"팔마 데 마요르카","Ibiza":"이비자","Ajaccio":"아작시오","Cagliari":"칼리아리","Catania":"카타니아","Bari":"바리","Ocean Cay":"오션 케이","Great Stirrup Cay":"그레이트 스터럽 케이","Harvest Caye":"하베스트 케이","Labadee":"라바디","Roatan":"로아탄","George Town":"조지타운","Ocho Rios":"오초리오스","Gangjeong":"강정","Sakaiminato":"사카이미나토","Maizuru":"마이즈루","Aburatsu":"아부라쓰","Aomori":"아오모리","Akita":"아키타","Kanazawa":"가나자와"};
const countryKo = {"Japan":"일본","South Korea":"한국","China":"중국","Taiwan":"대만","Singapore":"싱가포르","Vietnam":"베트남","Thailand":"태국","Malaysia":"말레이시아","Philippines":"필리핀","Indonesia":"인도네시아","Spain":"스페인","Italy":"이탈리아","France":"프랑스","Greece":"그리스","Turkey":"터키","Croatia":"크로아티아","Montenegro":"몬테네그로","Portugal":"포르투갈","Malta":"몰타","United Kingdom":"영국","Netherlands":"네덜란드","Germany":"독일","Denmark":"덴마크","Sweden":"스웨덴","Norway":"노르웨이","Finland":"핀란드","Iceland":"아이슬란드","Estonia":"에스토니아","United States":"미국","Canada":"캐나다","Mexico":"멕시코","Bahamas":"바하마","Jamaica":"자메이카","Honduras":"온두라스","Belize":"벨리즈","Brazil":"브라질","Australia":"호주","New Zealand":"뉴질랜드","United Arab Emirates":"아랍에미리트","Oman":"오만","Qatar":"카타르","Israel":"이스라엘","Cyprus":"키프로스","Belgium":"벨기에","Poland":"폴란드","Barbados":"바베이도스","Aruba":"아루바","Bermuda":"버뮤다","Cuba":"쿠바","Puerto Rico":"푸에르토리코","Colombia":"콜롬비아","Monaco":"모나코"};
const shipKo = {"MSC Divina":"MSC 디비나","MSC Musica":"MSC 무지카","MSC Opera":"MSC 오페라","MSC Meraviglia":"MSC 메라빌리아","MSC Lirica":"MSC 리리카","MSC Armonia":"MSC 아르모니아","MSC Sinfonia":"MSC 신포니아","MSC Orchestra":"MSC 오케스트라","MSC Poesia":"MSC 포에시아","MSC Magnifica":"MSC 마그니피카","MSC Fantasia":"MSC 판타지아","MSC Preziosa":"MSC 프레치오사","MSC Seaside":"MSC 씨사이드","MSC Splendida":"MSC 스플렌디다","MSC Seaview":"MSC 씨뷰","MSC Bellissima":"MSC 벨리시마","MSC Grandiosa":"MSC 그란디오사","MSC Virtuosa":"MSC 비르투오사","MSC Seashore":"MSC 씨쇼어","MSC World Europa":"MSC 월드 유로파","MSC Euribia":"MSC 유리비아","MSC Seascape":"MSC 씨스케이프","MSC World America":"MSC 월드 아메리카","MSC World Asia":"MSC 월드 아시아","MSC World Atlantic":"MSC 월드 아틀란틱","Norwegian Breakaway":"노르웨이전 브레이크어웨이","Norwegian Dawn":"노르웨이전 던","Norwegian Epic":"노르웨이전 에픽","Norwegian Escape":"노르웨이전 이스케이프","Norwegian Jewel":"노르웨이전 주얼","Norwegian Sky":"노르웨이전 스카이","Norwegian Spirit":"노르웨이전 스피릿","Pride of America":"프라이드 오브 아메리카","Norwegian Sun":"노르웨이전 선","Norwegian Star":"노르웨이전 스타","Norwegian Pearl":"노르웨이전 펄","Norwegian Jade":"노르웨이전 제이드","Norwegian Gem":"노르웨이전 젬","Norwegian Getaway":"노르웨이전 겟어웨이","Norwegian Joy":"노르웨이전 조이","Norwegian Bliss":"노르웨이전 블리스","Norwegian Encore":"노르웨이전 앙코르","Norwegian Prima":"노르웨이전 프리마","Norwegian Viva":"노르웨이전 비바","Norwegian Aqua":"노르웨이전 아쿠아","Norwegian Luna":"노르웨이전 루나","Norwegian Aura":"노르웨이전 아우라"};

const SE_ASIA_COUNTRIES = ['Vietnam','Thailand','Malaysia','Philippines','Indonesia','Cambodia','Myanmar','Sri Lanka','India'];

function getDest(regions, countries, startsAt) {
  const r = (regions||[]).join(' ');
  if(r.includes('Mediterranean')) return 'mediterranean';
  if(r.includes('Alaska')) return 'alaska';
  if(r.includes('Caribbean')||r.includes('Bahamas')) return 'caribbean';
  if(r.includes('Northern Europe')||r.includes('Scandinavia')||r.includes('Baltic')) return 'northern-europe';
  if(r.includes('Hawaii')) return 'hawaii';
  if(r.includes('Asia')) {
    const sc = startsAt?.country||'';
    if(sc==='Japan'||sc==='South Korea') return 'korea';
    const hasJP = countries.includes('Japan');
    const hasSEA = countries.some(c => SE_ASIA_COUNTRIES.includes(c));
    if(hasSEA) return 'southeast-asia';
    if(hasJP) return 'japan';
    return 'asia';
  }
  if(r.includes('South America')) return 'south-america';
  if(r.includes('Middle East')) return 'middle-east';
  return 'other';
}

const destNameKo = {mediterranean:'지중해',alaska:'알래스카',caribbean:'카리브해','northern-europe':'북유럽',hawaii:'하와이',korea:'일본',japan:'일본','southeast-asia':'동남아',asia:'아시아','south-america':'남미','middle-east':'중동',other:''};

function makeTitle(dest, countries, nights) {
  const dname = destNameKo[dest]||'';
  const cko = (countries||[]).map(c=>countryKo[c]||c);
  const unique = [...new Set(cko)];
  if(unique.length<=3 && unique.length>0) return `${unique.join('·')} ${nights}박 크루즈`;
  if(dname) return `${dname} ${nights}박 크루즈`;
  return `${nights}박 크루즈`;
}

function makeHashtags(dest, operator, shipTitle, ports) {
  const tags = [];
  const dname = destNameKo[dest];
  if(dname) tags.push(`#${dname}크루즈`);
  const op = operator.includes('MSC')?'MSC':'NCL';
  tags.push(`#${op}크루즈`);
  const sKo = shipKo[shipTitle]||shipTitle;
  tags.push(`#${sKo.replace(/\s/g,'')}`);
  const topPorts = ports.slice(0,2).map(p=>portKo[p]||p);
  topPorts.forEach(p=>tags.push(`#${p}`));
  return tags;
}

(async () => {
  console.log('🚢 CruiseLink V2 고속 데이터 수집');
  console.log(`📅 ${TODAY}\n`);
  
  // Phase 1: Get all ships
  console.log('Phase 1: 선박 목록 수집...');
  const allShips = [];
  for(let page=1; page<=2; page++) {
    const d = await apiFetch(`ships.json?per_page=50&page=${page}`);
    if(d?.ships) allShips.push(...d.ships);
  }
  console.log(`  ${allShips.length}척 확인\n`);
  
  // Phase 2: Get ship details (for cruises refs)
  console.log('Phase 2: 선박 상세 + 크루즈 ref 수집...');
  const slugs = allShips.map(s => s.title.toLowerCase().replace(/\s+/g,'-'));
  const shipDetails = await batchFetch(slugs.map(s => `ships/${s}.json`));
  
  // Build ships.json
  const shipsJson = [];
  const allCruiseRefs = []; // {ref, shipSlug, shipTitle, operator}
  
  for(let i=0; i<allShips.length; i++) {
    const s = allShips[i];
    const detail = shipDetails[i];
    if(!detail) continue;
    const facts = detail.ship_facts||{};
    const slug = slugs[i];
    const cruises = detail.cruises||[];
    const op = s.title.startsWith('MSC')?'MSC Cruises':'Norwegian Cruise Line';
    const opShort = s.title.startsWith('MSC')?'MSC':'NCL';
    
    shipsJson.push({
      id: s.id, slug, title: s.title, titleKo: shipKo[s.title]||s.title,
      operator: op, operatorShort: opShort,
      profileImage: s.profile_image_href, coverImage: s.cover_image_href||s.profile_image_href,
      shipClass: s.ship_class?.trim()||'', size: s.size, style: s.style,
      launchYear: facts.launch_year, refitYear: facts.refit_year,
      grossTonnage: facts.gross_tonnage, length: facts.length, width: facts.width,
      speed: facts.speed, capacity: facts.capacity, crewCount: facts.crew_count,
      deckCount: facts.deck_count, cabinCount: facts.cabin_count,
      videoUrl: detail.video_url||'',
      cruiseCount: cruises.length
    });
    
    cruises.forEach(c => allCruiseRefs.push({
      ref: c.ref, shipSlug: slug, shipTitle: s.title, operator: op, operatorShort: opShort,
      coverImage: s.cover_image_href||s.profile_image_href,
      profileImage: s.profile_image_href
    }));
  }
  
  // Save ships.json
  fs.mkdirSync(OUT, {recursive:true});
  fs.writeFileSync(path.join(OUT,'ships.json'), JSON.stringify(shipsJson, null, 0));
  console.log(`\n✅ ships.json: ${shipsJson.length}척 저장`);
  console.log(`📋 전체 크루즈 ref: ${allCruiseRefs.length}건\n`);
  
  // Phase 3: Fetch cruise details (the big one)
  console.log('Phase 3: 크루즈 상세 수집 (가격/일정)...');
  console.log(`  ${allCruiseRefs.length}건, 예상 시간: ~${Math.ceil(allCruiseRefs.length/BATCH*0.4/60)}분\n`);
  
  const cruiseDetails = await batchFetch(allCruiseRefs.map(c => `holidays/dates/${c.ref}.json`));
  
  // Build cruises.json
  const cruisesJson = [];
  const unmappedPorts = new Set();
  let skipped = 0;
  
  for(let i=0; i<allCruiseRefs.length; i++) {
    const meta = allCruiseRefs[i];
    const d = cruiseDetails[i];
    if(!d || d.status) { skipped++; continue; }
    
    const dateFrom = d.date_from?.slice(0,10);
    const dateTo = d.date_to?.slice(0,10);
    if(!dateFrom || dateFrom < TODAY) { skipped++; continue; } // past cruise
    
    const nights = Math.round((new Date(dateTo)-new Date(dateFrom))/(86400000));
    const regions = d.regions||[];
    const countries = d.countries||[];
    const dest = getDest(regions, countries, d.starts_at);
    
    // Extract ports
    const days = d.itinerary?.days||[];
    const portNames = [];
    const uniquePortNames = [];
    days.forEach(day => {
      const loc = day.locations?.[0];
      if(loc) {
        portNames.push(loc.name);
        if(!uniquePortNames.includes(loc.name)) uniquePortNames.push(loc.name);
        if(!portKo[loc.name]) unmappedPorts.add(loc.name);
      }
    });
    
    const portRoute = uniquePortNames.map(p => portKo[p]||p).join(' → ');
    const prices = d.headline_prices?.cruise;
    const title = makeTitle(dest, countries, nights);
    const hashtags = makeHashtags(dest, meta.operator, meta.shipTitle, uniquePortNames);
    
    cruisesJson.push({
      ref: meta.ref,
      shipSlug: meta.shipSlug,
      shipTitle: meta.shipTitle,
      shipTitleKo: shipKo[meta.shipTitle]||meta.shipTitle,
      operator: meta.operator,
      operatorShort: meta.operatorShort,
      dateFrom, dateTo, nights,
      regions, countries,
      countriesKo: countries.map(c=>countryKo[c]||c),
      destination: dest,
      startsAt: {name:d.starts_at?.name, nameKo:portKo[d.starts_at?.name]||d.starts_at?.name, country:d.starts_at?.country, countryKo:countryKo[d.starts_at?.country]||d.starts_at?.country},
      endsAt: {name:d.ends_at?.name, nameKo:portKo[d.ends_at?.name]||d.ends_at?.name, country:d.ends_at?.country, countryKo:countryKo[d.ends_at?.country]||d.ends_at?.country},
      ports: uniquePortNames.map(p=>({name:p, nameKo:portKo[p]||p})),
      portRoute,
      priceInside: prices?.double?.from_inside ? Math.round(parseFloat(prices.double.from_inside)) : null,
      priceOutside: prices?.double?.from_outside ? Math.round(parseFloat(prices.double.from_outside)) : null,
      priceBalcony: prices?.double?.from_balcony ? Math.round(parseFloat(prices.double.from_balcony)) : null,
      priceSuite: prices?.double?.from_suite ? Math.round(parseFloat(prices.double.from_suite)) : null,
      currency: 'USD',
      availability: d.availability_string||'available',
      image: meta.coverImage,
      title, hashtags
    });
  }
  
  // Sort by dateFrom
  cruisesJson.sort((a,b) => a.dateFrom.localeCompare(b.dateFrom));
  
  fs.writeFileSync(path.join(OUT,'cruises.json'), JSON.stringify(cruisesJson, null, 0));
  console.log(`\n✅ cruises.json: ${cruisesJson.length}건 저장 (${skipped}건 스킵)`);
  
  // Destination breakdown
  const destCount = {};
  cruisesJson.forEach(c => { destCount[c.destination] = (destCount[c.destination]||0)+1; });
  console.log('\n📊 목적지별:');
  Object.entries(destCount).sort((a,b)=>b[1]-a[1]).forEach(([d,n]) => console.log(`  ${d}: ${n}건`));
  
  // Unmapped ports
  if(unmappedPorts.size > 0) {
    console.log(`\n⚠️ 미번역 기항지: ${unmappedPorts.size}개`);
    const arr = [...unmappedPorts].sort();
    fs.writeFileSync(path.join(OUT,'unmapped-ports.json'), JSON.stringify(arr, null, 2));
    console.log(`  → unmapped-ports.json 저장`);
    arr.slice(0,20).forEach(p => console.log(`  - ${p}`));
  }
  
  // File sizes
  const shipSize = fs.statSync(path.join(OUT,'ships.json')).size;
  const cruiseSize = fs.statSync(path.join(OUT,'cruises.json')).size;
  console.log(`\n📦 파일 크기: ships.json ${(shipSize/1024).toFixed(0)}KB, cruises.json ${(cruiseSize/1024).toFixed(0)}KB`);
  console.log('\n🎉 수집 완료!');
})();
