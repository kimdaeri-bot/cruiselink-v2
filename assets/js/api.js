// CruiseLink V2 - Hybrid API (Local JSON + Live API)
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

  // ===== LOCAL JSON (목록/검색/필터용) =====

  _localShips: null,
  _localCruises: null,

  async loadLocalShips() {
    if (this._localShips) return this._localShips;
    try {
      const res = await fetch('assets/data/ships.json');
      this._localShips = await res.json();
    } catch { this._localShips = []; }
    return this._localShips;
  },

  async loadLocalCruises() {
    if (this._localCruises) return this._localCruises;
    try {
      const res = await fetch('assets/data/cruises.json');
      this._localCruises = await res.json();
    } catch { this._localCruises = []; }
    return this._localCruises;
  },

  // Filter local cruises
  async filterCruises({ dest, operator, month, duration, limit, minDate } = {}) {
    const cruises = await this.loadLocalCruises();
    const now = minDate || new Date().toISOString().slice(0, 10);
    return cruises.filter(c => {
      if (c.dateFrom < now) return false;
      if (dest && c.destination !== dest) return false;
      if (operator && !c.operator.includes(operator)) return false;
      if (month) {
        const cm = c.dateFrom.slice(0, 7);
        if (cm !== month) return false;
      }
      if (duration === 'short' && c.nights > 5) return false;
      if (duration === 'medium' && (c.nights < 6 || c.nights > 10)) return false;
      if (duration === 'long' && c.nights < 11) return false;
      return true;
    }).slice(0, limit || 9999);
  },

  // Get recommended cruises (nearest departure, one per ship)
  async getRecommendedCruises(count = 9) {
    const cruises = await this.loadLocalCruises();
    const now = new Date().toISOString().slice(0, 10);
    const seen = new Set();
    const result = [];
    for (const c of cruises) {
      if (c.dateFrom < now) continue;
      if (seen.has(c.shipSlug)) continue;
      seen.add(c.shipSlug);
      result.push(c);
      if (result.length >= count) break;
    }
    return result;
  },

  // Get local ship by slug
  async getLocalShip(slug) {
    const ships = await this.loadLocalShips();
    return ships.find(s => s.slug === slug) || null;
  },

  // Get cruises for a specific ship
  async getShipCruises(shipSlug) {
    const cruises = await this.loadLocalCruises();
    const now = new Date().toISOString().slice(0, 10);
    return cruises.filter(c => c.shipSlug === shipSlug && c.dateFrom >= now);
  },

  // ===== LIVE API (상세 페이지 전용) =====

  // 선박 상세 (시설/덱플랜/객실 = 라이브)
  async getShipLive(slug) {
    return await this.fetch(`ships/${slug}.json`);
  },

  // 크루즈 상세 (일정, 가격, 기항지 이미지 = 라이브)
  async getHoliday(ref) {
    return await this.fetch(`holidays/dates/${ref}.json`);
  },

  // 전체 선박 목록 (API, 폴백용)
  async getAllShips() {
    if (this.cache._allShips) return this.cache._allShips;
    const p1 = await this.fetch('ships.json', 'per_page=50');
    let ships = p1?.ships || [];
    if (p1?.total > 50) {
      const p2 = await this.fetch('ships.json', 'per_page=50&page=2');
      ships = ships.concat(p2?.ships || []);
    }
    this.cache._allShips = ships;
    return ships;
  },

  // ===== 유틸리티 =====

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
    const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
    return `${d.getFullYear()}년 ${months[d.getMonth()]} ${d.getDate()}일`;
  },

  formatPrice(price, currency = 'USD') {
    if (!price) return '문의';
    const num = parseFloat(price);
    if (isNaN(num)) return '문의';
    const symbols = { USD: '$', GBP: '£', EUR: '€' };
    return `${symbols[currency] || '$'}${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}~`;
  },

  // 기항지 경로 (라이브 itinerary용)
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

  hashtags(holiday) {
    const tags = [];
    if (holiday.regions) holiday.regions.forEach(r => tags.push('#' + r.replace(/\s+/g, '')));
    if (holiday.operator_title) tags.push('#' + holiday.operator_title.replace(/\s+/g, ''));
    if (holiday.ship_title) tags.push('#' + holiday.ship_title.replace(/\s+/g, ''));
    return tags.slice(0, 5);
  },
};
