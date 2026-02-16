// ===== 크루즈링크 문의 접수 - Google Apps Script =====
// 배포 방법:
// 1. https://script.google.com 접속 (info@londonshow.co.kr 로그인)
// 2. 새 프로젝트 만들기
// 3. 이 코드 전체 복사 → 붙여넣기
// 4. 상단 "배포" → "새 배포" → 유형: "웹 앱"
// 5. 실행 주체: "나" / 액세스: "모든 사용자"
// 6. "배포" 클릭 → URL 복사
// 7. 그 URL을 김대리에게 전달

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
  <div style="max-width:640px;margin:20px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background:#1a237e;padding:28px 32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">🚢 크루즈링크</h1>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">CRUISE QUOTATION / 견적서</p>
    </div>
    
    <!-- Cruise Info -->
    <div style="padding:28px 32px;border-bottom:2px solid #e0e0e0;">
      <h2 style="color:#1a237e;font-size:15px;margin:0 0 16px;border-left:4px solid #ff6f00;padding-left:12px;">크루즈 정보</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:8px 0;color:#757575;width:100px;">상품명</td>
          <td style="padding:8px 0;font-weight:700;color:#1a237e;">${data.product || '-'}</td>
        </tr>
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:8px 0;color:#757575;">선사</td>
          <td style="padding:8px 0;">${data.cruiseline || '-'}</td>
        </tr>
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:8px 0;color:#757575;">선박</td>
          <td style="padding:8px 0;">${data.ship || '-'}</td>
        </tr>
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:8px 0;color:#757575;">출발일</td>
          <td style="padding:8px 0;">${data.date || '-'}</td>
        </tr>
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:8px 0;color:#757575;">일정</td>
          <td style="padding:8px 0;font-size:13px;line-height:1.5;">${data.ports || '-'}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#757575;">참고가격</td>
          <td style="padding:8px 0;font-weight:700;color:#ff6f00;font-size:16px;">${data.price || '문의'}</td>
        </tr>
      </table>
    </div>
    
    <!-- Customer Info -->
    <div style="padding:28px 32px;border-bottom:2px solid #e0e0e0;">
      <h2 style="color:#1a237e;font-size:15px;margin:0 0 16px;border-left:4px solid #ff6f00;padding-left:12px;">고객 정보</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:8px 0;color:#757575;width:100px;">이름</td>
          <td style="padding:8px 0;font-weight:700;">${data.name || '-'}</td>
        </tr>
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:8px 0;color:#757575;">연락처</td>
          <td style="padding:8px 0;">${data.phone || '-'}</td>
        </tr>
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:8px 0;color:#757575;">이메일</td>
          <td style="padding:8px 0;"><a href="mailto:${data.email || ''}" style="color:#1a237e;">${data.email || '-'}</a></td>
        </tr>
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:8px 0;color:#757575;">인원</td>
          <td style="padding:8px 0;">${data.pax || '-'}명</td>
        </tr>
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:8px 0;color:#757575;">희망 객실</td>
          <td style="padding:8px 0;">${data.cabin || '-'}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#757575;">요청사항</td>
          <td style="padding:8px 0;color:#424242;">${data.message || '없음'}</td>
        </tr>
      </table>
    </div>
    
    <!-- Quotation (담당자 작성용) -->
    <div style="padding:28px 32px;background:#fff8e1;border-bottom:2px solid #e0e0e0;">
      <h2 style="color:#e65100;font-size:15px;margin:0 0 16px;border-left:4px solid #ff6f00;padding-left:12px;">💰 요금 안내 (담당자 작성)</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="border-bottom:1px dashed #ffcc80;">
          <td style="padding:10px 0;color:#757575;width:120px;">확정 객실 타입</td>
          <td style="padding:10px 0;color:#bdbdbd;">__________________</td>
        </tr>
        <tr style="border-bottom:1px dashed #ffcc80;">
          <td style="padding:10px 0;color:#757575;">1인 요금</td>
          <td style="padding:10px 0;color:#bdbdbd;">$ __________________</td>
        </tr>
        <tr style="border-bottom:1px dashed #ffcc80;">
          <td style="padding:10px 0;color:#757575;">총 요금</td>
          <td style="padding:10px 0;color:#bdbdbd;">$ __________________</td>
        </tr>
        <tr style="border-bottom:1px dashed #ffcc80;">
          <td style="padding:10px 0;color:#757575;">포트 차지/세금</td>
          <td style="padding:10px 0;color:#bdbdbd;">$ __________________</td>
        </tr>
        <tr style="border-bottom:1px dashed #ffcc80;">
          <td style="padding:10px 0;color:#757575;">특별 할인</td>
          <td style="padding:10px 0;color:#bdbdbd;">__________________</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#757575;">비고</td>
          <td style="padding:10px 0;color:#bdbdbd;">__________________</td>
        </tr>
      </table>
    </div>
    
    <!-- Footer -->
    <div style="padding:24px 32px;background:#fafafa;text-align:center;font-size:12px;color:#9e9e9e;">
      <p style="margin:0 0 4px;">
        <strong style="color:#1a237e;">크루즈링크</strong> | 디플랫코리아
      </p>
      <p style="margin:0 0 4px;">📞 02-3788-9119 | 💬 카카오톡 상담</p>
      <p style="margin:0;">info@cruiselink.co.kr | www.cruiselink.co.kr</p>
    </div>
    
  </div>
</body>
</html>`;

    // 담당자에게 이메일 발송
    GmailApp.sendEmail(
      'info@cruiselink.co.kr',  // 받는 사람
      `[크루즈링크 문의] ${data.product} - ${data.name}님`,  // 제목
      // 텍스트 버전 (HTML 안 될 경우 대비)
      `크루즈: ${data.product}\n고객: ${data.name} (${data.phone})\n이메일: ${data.email}\n인원: ${data.pax}명 / 객실: ${data.cabin}\n요청: ${data.message}`,
      {
        htmlBody: htmlBody,
        name: '크루즈링크',
        replyTo: data.email  // 답장하면 고객에게 바로 감
      }
    );

    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// CORS 허용
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({status: 'ok'}))
    .setMimeType(ContentService.MimeType.JSON);
}
