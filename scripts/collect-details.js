#!/usr/bin/env node
// CruiseLink V2 - Ship details & port details collector
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://www.widgety.co.uk/api';
const AUTH = 'app_id=fdb0159a2ae2c59f9270ac8e42676e6eb0fb7c36&token=03428626b23f5728f96bb58ff9bcf4bcb04f8ea258b07ed9fa69d8dd94b46b40';
const DATA_DIR = path.join(__dirname, '..', 'assets', 'data');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function apiFetch(endpoint) {
  const sep = endpoint.includes('?') ? '&' : '?';
  const url = `${API_BASE}/${endpoint}${sep}${AUTH}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API ${res.status}: ${endpoint}`);
  return res.json();
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, '').trim();
}

// ============ SHIP DETAILS ============
async function collectShipDetails() {
  const ships = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ships.json'), 'utf8'));
  const results = [];
  
  console.log(`Collecting details for ${ships.length} ships...`);
  
  for (let i = 0; i < ships.length; i += 10) {
    const batch = ships.slice(i, i + 10);
    const promises = batch.map(async (ship) => {
      try {
        const data = await apiFetch(`ships/${ship.slug}.json`);
        const s = data;
        const facts = s.ship_facts || {};
        
        const result = {
          slug: ship.slug,
          title: ship.title,
          teaserEn: stripHtml(s.teaser),
          introductionEn: stripHtml(s.introduction),
          accommodationIntroEn: stripHtml(s.accomodation?.intro),
          diningIntroEn: stripHtml(s.dining?.intro),
          entertainmentIntroEn: stripHtml(s.entertainment?.intro),
          healthIntroEn: stripHtml(s.health_and_fitness?.intro),
          kidsIntroEn: stripHtml(s.kids_and_teens?.intro),
          accommodations: (s.accomodation_types || []).map(a => ({
            name: a.name,
            image: a.images?.[0]?.href || null
          })),
          dining: (s.dining_options || []).map(d => ({
            name: d.name,
            descEn: stripHtml(d.description).slice(0, 300),
            image: d.images?.[0]?.href || null
          })),
          entertainment: (s.entertainment_types || []).map(e => ({
            name: e.name,
            descEn: stripHtml(e.description).slice(0, 300),
            image: e.images?.[0]?.href || null
          })),
          health: (s.health_fitness_types || []).map(h => ({
            name: h.name,
            descEn: stripHtml(h.description).slice(0, 300),
            image: h.images?.[0]?.href || null
          })),
          kids: (s.kid_teen_types || []).map(k => ({
            name: k.name,
            descEn: stripHtml(k.description).slice(0, 300),
            image: k.images?.[0]?.href || null
          })),
          deckplans: (s.deckplans || []).map(d => ({
            name: d.name,
            image: d.images?.[0]?.href || null
          }))
        };
        console.log(`  ✓ ${ship.slug} (${result.dining.length} dining, ${result.entertainment.length} ent, ${result.accommodations.length} cabins, ${result.deckplans.length} decks)`);
        return result;
      } catch (e) {
        console.error(`  ✗ ${ship.slug}: ${e.message}`);
        return { slug: ship.slug, title: ship.title, error: e.message };
      }
    });
    
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
    if (i + 10 < ships.length) await sleep(400);
  }
  
  const outPath = path.join(DATA_DIR, 'ships-detail.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nSaved ${results.length} ships to ships-detail.json (${(fs.statSync(outPath).size / 1024).toFixed(0)}KB)`);
}

// ============ PORT DETAILS ============
async function collectPortDetails() {
  console.log('\nCollecting port details...');
  const allPorts = {};
  let page = 1;
  let total = 0;
  
  while (true) {
    try {
      const data = await apiFetch(`ports.json?per_page=50&page=${page}`);
      const ports = data.ports || data;
      if (!Array.isArray(ports) || ports.length === 0) break;
      
      for (const p of ports) {
        const unlocode = p.unlocode || p.id;
        if (!unlocode) continue;
        allPorts[unlocode] = {
          name: p.name || p.title,
          country: p.country,
          lat: p.latitude || p.lat,
          lng: p.longitude || p.lng,
          image: p.images?.[0]?.href || p.image_href || null,
          descriptionEn: stripHtml(p.description).slice(0, 500)
        };
      }
      
      total += ports.length;
      console.log(`  Page ${page}: ${ports.length} ports (total: ${total})`);
      
      if (ports.length < 50) break;
      page++;
      await sleep(400);
    } catch (e) {
      console.error(`  Error page ${page}: ${e.message}`);
      break;
    }
  }
  
  const outPath = path.join(DATA_DIR, 'ports-detail.json');
  fs.writeFileSync(outPath, JSON.stringify(allPorts, null, 2));
  console.log(`Saved ${Object.keys(allPorts).length} ports to ports-detail.json (${(fs.statSync(outPath).size / 1024).toFixed(0)}KB)`);
}

async function main() {
  console.log('=== CruiseLink V2 Detail Collector ===\n');
  await collectShipDetails();
  await collectPortDetails();
  console.log('\n=== Done! ===');
}

main().catch(e => { console.error(e); process.exit(1); });
