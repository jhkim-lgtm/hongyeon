// 홍연 카카오 로그인 설정
// ─────────────────────────────────────────────
// 1) https://developers.kakao.com → 애플리케이션 추가 ("홍연")
// 2) 앱 설정 > 플랫폼 > Web 에 사이트 도메인 등록: https://jhkim-lgtm.github.io
// 3) 제품 설정 > 카카오 로그인 활성화 + Redirect URI 등록:
//    https://jhkim-lgtm.github.io/hongyeon/
// 4) 동의항목: 닉네임(필수), 프로필 사진(필수), 카카오계정 이메일(선택 동의)
//    → 이메일까지 받으려면 scopes 에 account_email 추가
// 5) 아래 kakaoRestKey 에 "REST API 키"를 붙여넣고 커밋/배포
// ─────────────────────────────────────────────
window.HONGYEON_CONFIG = {
  kakaoRestKey: "3c332eaa14dace9d7a5705280ba5381b",  // ← 카카오 REST API 키 (1%CLUB/myblocks 앱)
  // 이 앱은 Client Secret이 ON(myblocks 연동 때문에 유지). 프론트 토큰교환에 함께 전달.
  clientSecret: "ImeOXP3lDrcAoINSttV83PHNk3tEyTnm",
  // scopes 비움 = 동의항목 요청 없이 로그인(회원번호만 수집). KOE205 방지.
  scopes: "",
  // 카카오톡 채널 '친구 추가' URL (http://pf.kakao.com/_XXXXX/friend) → 완료화면 '채널 추가' 버튼.
  channelAddUrl: "https://pf.kakao.com/_xaSNxgxj/friend"
};
