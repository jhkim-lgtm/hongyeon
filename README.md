# 홍연 紅緣 — 사주 매칭 소개팅

> 내 친구의 친구 중, 사주가 점지한 단 한 사람. 매일 카카오톡으로.

| 페이지 | URL |
|---|---|
| 가입 폼 (카카오 로그인 게이트) | https://jhkim-lgtm.github.io/hongyeon/ |
| 앱 데모 | https://jhkim-lgtm.github.io/hongyeon/app/ |
| 운영 콘솔 (매칭 엔진) | https://jhkim-lgtm.github.io/hongyeon/app/admin.html |

폼 응답은 jh.kim@1percentclub.kr Drive의 구글폼
`[홍연] 사주 매칭 데이팅 신청서 (응답 DB)` 에 자동 축적됩니다.

## 카카오 로그인 활성화 (15분, BK 1회 셋업)

1. https://developers.kakao.com → **애플리케이션 추가** ("홍연")
2. 앱 설정 > 플랫폼 > **Web** → 사이트 도메인 `https://jhkim-lgtm.github.io`
3. 제품 설정 > **카카오 로그인 활성화** → Redirect URI `https://jhkim-lgtm.github.io/hongyeon/`
4. 동의항목: 닉네임·프로필 사진(필수 동의), 카카오계정 이메일(선택 동의)
5. 앱 키의 **REST API 키** 복사 → 이 레포 `config.js`의 `kakaoRestKey`에 붙여넣고 커밋
   - 이메일까지 수집하려면 `scopes`에 `,account_email` 추가

키가 비어 있는 동안에는 "카카오 없이 테스트로 계속하기" 링크로 폼 동작을 확인할 수 있습니다.

## 구조

```
index.html      가입 폼 (카카오 게이트 + 8스텝 설문 → 구글폼 POST)
config.js       카카오 앱 키 설정
app/index.html  데이팅 앱 데모 (오늘의 인연·인연함·스토어·MY)
app/admin.html  운영 콘솔 (응답 CSV → 궁합 매트릭스 → 발송 큐)
app/saju.js     사주 엔진 (만세력 근사 + 궁합 점수)
app/data.js     데모 프로필 데이터
```
