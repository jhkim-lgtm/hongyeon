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
  clientSecret: "lmeOXP3IDrcAoINSttV83PHNk3tEyTnm",
  // 이 앱(1%CLUB/myblocks 공용)은 '개인정보 제3자 제공' 방식으로 프로필사진만 승인됨 → scope 무시됨.
  // 로그인으로 수집 가능한 건 회원번호 + 프로필사진뿐. 나머지(이름·전화·생일 등)는 폼에서 입력받음.
  // 이름·전화·생일 등을 카카오로 자동수집하려면 홍연 전용앱 + 카카오 비즈니스 검수 필요(별건).
  scopes: ""
};
