// CruiseLink V2 - Widgety API Wrapper
const API = {
  base: 'https://www.widgety.co.uk/api',
  auth: 'app_id=fdb0159a2ae2c59f9270ac8e42676e6eb0fb7c36&token=03428626b23f5728f96bb58ff9bcf4bcb04f8ea258b07ed9fa69d8dd94b46b40',
  cache: {},

  url(endpoint, params = '') {
    const sep = endpoint.includes('?') ? '&' : '?';
    return `${this.base}/${endpoint}${sep}${this.auth}${params ? '&' + params : ''}`;
  },

  async fetch(endpoint, params = '') {
    const key = endpoint + params;
    if (this.cache[key]) return this.cache[key];
    try {
      const res = await fetch(this.url(endpoint, params));
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      this.cache[key] = data;
      return data;
    } catch (e) {
      console.error('API Error:', e);
      return null;
    }
  },

  // 전체 선박 목록 (47척, 페이지네이션 처리)
  async getAllShips() {
    if (this.cache._allShips) return this.cache._allShips;
    const p1 = await this.fetch('ships.json', 'per_page=50');
    let ships = p1?.ships || [];
    // Check if more pages needed
    if (p1?.total > 50) {
      const p2 = await this.fetch('ships.json', 'per_page=50&page=2');
      ships = ships.concat(p2?.ships || []);
    }
    this.cache._allShips = ships;
    return ships;
  },

  // 선박 상세 (크루즈 목록 포함)
  async getShip(slug) {
    return await this.fetch(`ships/${slug}.json`);
  },

  // 크루즈 상세 (일정, 가격, 기항지)
  async getHoliday(ref) {
    return await this.fetch(`holidays/dates/${ref}.json`);
  },

  // 모든 선박의 크루즈 수집 (메인/목적지용)
  async getAllCruises() {
    if (this.cache._allCruises) return this.cache._allCruises;
    const ships = await this.getAllShips();
    const allCruises = [];
    const now = new Date();
    const threeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Fetch all ships in parallel (batched)
    const slugs = ships.map(s => {
      const href = s.href || '';
      const match = href.match(/ships\/([^.]+)\.json/);
      return match ? match[1] : null;
    }).filter(Boolean);

    const batchSize = 5;
    for (let i = 0; i < slugs.length; i += batchSize) {
      const batch = slugs.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(slug => this.getShip(slug)));
      results.forEach((shipData, idx) => {
        if (!shipData?.cruises) return;
        const ship = ships.find(s => s.href?.includes(batch[idx]));
        shipData.cruises.forEach(c => {
          allCruises.push({
            ref: c.ref,
            name: c.name,
            holiday_date: c.holiday_date,
            shipSlug: batch[idx],
            shipTitle: ship?.title || shipData.title || '',
            operator: ship?.operator?.name || '',
            coverImage: ship?.cover_image_href || '',
            profileImage: ship?.profile_image_href || '',
          });
        });
      });
    }

    this.cache._allCruises = allCruises;
    return allCruises;
  },

  // 크루즈 refs에서 holiday details 가져오기 (배치)
  async getHolidaysBatch(refs, batchSize = 5) {
    const results = [];
    for (let i = 0; i < refs.length; i += batchSize) {
      const batch = refs.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(ref => this.getHoliday(ref)));
      results.push(...batchResults);
    }
    return results;
  },

  // 날짜 유틸
  parseDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr);
  },

  formatDate(dateStr) {
    const d = this.parseDate(dateStr);
    if (!d) return '';
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  },

  formatDateKo(dateStr) {
    const d = this.parseDate(dateStr);
    if (!d) return '';
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    return `${d.getFullYear()}년 ${months[d.getMonth()]} ${d.getDate()}일`;
  },

  // 목적지 매핑
  destMap: {
    'korea': (h) => h.regions?.some(r => r.includes('Asia')) && ['Japan', 'South Korea'].includes(h.starts_at?.country),
    'mediterranean': (h) => h.regions?.some(r => r.includes('Mediterranean')),
    'alaska': (h) => h.regions?.some(r => r.includes('Alaska')),
    'caribbean': (h) => h.regions?.some(r => r.includes('Caribbean')),
    'northern-europe': (h) => h.regions?.some(r => r.includes('Northern Europe') || r.includes('Scandinavia') || r.includes('Baltic')),
    'southeast-asia': (h) => h.regions?.some(r => r.includes('Asia')) && !['Japan', 'South Korea'].includes(h.starts_at?.country),
    'japan': (h) => h.regions?.some(r => r.includes('Asia')) && h.itinerary?.days?.every(d => d.locations?.every(l => !l.country || l.country === 'Japan')),
    'hawaii': (h) => h.regions?.some(r => r.includes('Hawaii')),
  },

  matchesDest(holiday, dest) {
    const fn = this.destMap[dest];
    return fn ? fn(holiday) : false;
  },

  // 가격 포맷
  formatPrice(price, currency = 'USD') {
    if (!price) return '문의';
    const num = parseFloat(price);
    if (isNaN(num)) return '문의';
    const symbols = { USD: '$', GBP: '£', EUR: '€' };
    return `${symbols[currency] || '$'}${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}~`;
  },

  // 기항지 경로 문자열
  routeString(itinerary) {
    if (!itinerary?.days) return '';
    const ports = [];
    itinerary.days.forEach(d => {
      d.locations?.forEach(l => {
        if (l.name && !ports.includes(l.name)) ports.push(l.name);
      });
    });
    return ports.map(p => Translations.portName(p)).join(' → ');
  },

  // 기항지 짧은 경로 (최대 5개)
  shortRoute(itinerary, max = 5) {
    if (!itinerary?.days) return '';
    const ports = [];
    itinerary.days.forEach(d => {
      d.locations?.forEach(l => {
        if (l.name && !ports.includes(l.name)) ports.push(l.name);
      });
    });
    const shown = ports.slice(0, max).map(p => Translations.portName(p));
    if (ports.length > max) shown.push('...');
    return shown.join(' → ');
  },

  // 해시태그 생성
  hashtags(holiday) {
    const tags = [];
    if (holiday.regions) {
      holiday.regions.forEach(r => {
        tags.push('#' + r.replace(/\s+/g, ''));
      });
    }
    if (holiday.operator_title) tags.push('#' + holiday.operator_title.replace(/\s+/g, ''));
    if (holiday.ship_title) tags.push('#' + holiday.ship_title.replace(/\s+/g, ''));
    return tags.slice(0, 5);
  },
};
