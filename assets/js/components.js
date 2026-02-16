// Shared components
const Components = {
  header(active = 'home') {
    return `
    <header class="header">
      <div class="container">
        <a href="index.html" class="logo">크루즈<span>링크</span></a>
        <nav class="nav" id="mainNav">
          <a href="index.html" class="${active === 'home' ? 'active' : ''}">홈</a>
          <a href="destination.html?dest=mediterranean" class="${active === 'dest' ? 'active' : ''}">목적지</a>
          <a href="ships.html" class="${active === 'ships' ? 'active' : ''}">선박</a>
          <a href="https://pf.kakao.com/_xgYbJG" target="_blank" class="${active === 'contact' ? 'active' : ''}">문의</a>
        </nav>
        <a href="tel:02-3788-9119" class="header-phone">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
          02-3788-9119
        </a>
        <button class="mobile-menu-btn" onclick="document.getElementById('mainNav').classList.toggle('open')">☰</button>
      </div>
    </header>`;
  },

  footer() {
    return `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-col">
            <h4>크루즈링크</h4>
            <p>디플랫코리아<br>프리미엄 크루즈 여행 전문</p>
          </div>
          <div class="footer-col">
            <h4>연락처</h4>
            <p>📞 <a href="tel:02-3788-9119">02-3788-9119</a></p>
            <p>💬 <a href="https://pf.kakao.com/_xgYbJG" target="_blank">카카오톡 상담</a></p>
            <p>✉️ <a href="mailto:info@londonshow.co.kr">info@londonshow.co.kr</a></p>
          </div>
          <div class="footer-col">
            <h4>목적지</h4>
            <p><a href="destination.html?dest=korea">한국/일본</a></p>
            <p><a href="destination.html?dest=mediterranean">지중해</a></p>
            <p><a href="destination.html?dest=alaska">알래스카</a></p>
            <p><a href="destination.html?dest=caribbean">카리브해</a></p>
          </div>
        </div>
        <div class="footer-bottom">
          © ${new Date().getFullYear()} 크루즈링크 by 디플랫코리아. All rights reserved.
        </div>
      </div>
    </footer>`;
  },

  ctaSection() {
    return `
    <section class="cta-section">
      <div class="container">
        <h2>크루즈 여행, 지금 상담하세요</h2>
        <p>전문 상담원이 최적의 크루즈를 찾아드립니다</p>
        <div class="cta-buttons">
          <a href="https://pf.kakao.com/_xgYbJG" target="_blank" class="btn btn-orange">💬 카카오톡 상담</a>
          <a href="tel:02-3788-9119" class="btn btn-white">📞 02-3788-9119</a>
          <a href="mailto:info@londonshow.co.kr" class="btn btn-outline">✉️ 이메일 문의</a>
        </div>
      </div>
    </section>`;
  },

  loading() {
    return `<div class="loading"><div class="loading-spinner"></div><p>크루즈 정보를 불러오는 중...</p></div>`;
  },

  cruiseCard(holiday, shipInfo) {
    const price = holiday.headline_prices?.cruise?.double;
    const fromPrice = price?.from_balcony || price?.from_inside || price?.from_outside;
    const route = API.shortRoute(holiday.itinerary, 4);
    const region = holiday.regions?.[0] || '';
    const img = shipInfo?.coverImage || holiday.images?.[0]?.href || '';
    return `
    <div class="cruise-card" onclick="location.href='cruise-view.html?ref=${holiday.date_ref}'">
      <div class="cruise-card-img">
        <img src="${img}" alt="${holiday.ship_title}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 200%22><rect fill=%22%23e0e0e0%22 width=%22400%22 height=%22200%22/><text x=%2250%%22 y=%2250%%22 fill=%22%239e9e9e%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2220%22>🚢</text></svg>'">
        ${region ? `<span class="cruise-card-tag">${region}</span>` : ''}
      </div>
      <div class="cruise-card-body">
        <div class="cruise-card-operator">${holiday.operator_title || shipInfo?.operator || ''} · ${holiday.ship_title || ''}</div>
        <div class="cruise-card-title">${Translations.portName(holiday.starts_at?.name || '')} 출발 ${holiday.cruise_nights || holiday.duration_days || ''}박 크루즈</div>
        <div class="cruise-card-route">${route}</div>
        <div class="cruise-card-meta">
          <span class="cruise-card-date">📅 ${API.formatDate(holiday.date_from)} · ${holiday.cruise_nights || holiday.duration_days || ''}박</span>
          <span class="cruise-card-price">${API.formatPrice(fromPrice)}</span>
        </div>
        <a href="cruise-view.html?ref=${holiday.date_ref}" class="cruise-card-btn">자세히 보기</a>
      </div>
    </div>`;
  },

  cruiseItem(holiday, shipInfo) {
    const price = holiday.headline_prices?.cruise?.double;
    const fromPrice = price?.from_balcony || price?.from_inside || price?.from_outside;
    const route = API.shortRoute(holiday.itinerary, 5);
    const region = holiday.regions?.[0] || '';
    const img = shipInfo?.coverImage || holiday.images?.[0]?.href || '';
    const tags = API.hashtags(holiday);
    return `
    <div class="cruise-item">
      <div class="cruise-item-img">
        <img src="${img}" alt="${holiday.ship_title}" loading="lazy" onerror="this.style.display='none'">
        ${region ? `<span class="cruise-item-tag">${region}</span>` : ''}
      </div>
      <div class="cruise-item-body">
        <div class="cruise-item-operator">${holiday.operator_title || ''} · ${holiday.ship_title || ''}</div>
        <div class="cruise-item-title">${Translations.portName(holiday.starts_at?.name || '')} 출발 ${holiday.cruise_nights || holiday.duration_days || ''}박 크루즈</div>
        <div class="cruise-item-route">🚢 ${route}</div>
        <div class="cruise-item-hashtags">${tags.map(t => `<span>${t}</span>`).join('')}</div>
        <div class="cruise-item-footer">
          <div>
            <div class="cruise-item-date">📅 ${API.formatDate(holiday.date_from)} ~ ${API.formatDate(holiday.date_to)} · ${holiday.cruise_nights || holiday.duration_days || ''}박</div>
            <div class="cruise-item-price">${API.formatPrice(fromPrice)} <small style="font-weight:400;font-size:0.8rem;color:#616161">/1인 2인기준</small></div>
          </div>
          <div class="cruise-item-actions">
            <a href="cruise-view.html?ref=${holiday.date_ref}" class="btn btn-navy btn-sm">상세보기</a>
            <a href="https://pf.kakao.com/_xgYbJG" target="_blank" class="btn btn-orange btn-sm">문의</a>
          </div>
        </div>
      </div>
    </div>`;
  },
};
