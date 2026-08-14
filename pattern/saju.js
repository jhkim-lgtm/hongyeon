/* 홍연 사주 엔진 v1
 * - 양력 생년월일(+태어난 시각 지지)로 사주팔자(년·월·일·시주)를 세우고
 * - 두 사람의 궁합 점수(1~99)와 근거 리포트를 생성한다.
 * 주의: 년주는 입춘(2/4), 월주는 절기 근사일 기준. MVP용 근사 만세력이며
 *       상용 단계에서는 KASI 절기 데이터로 교체한다.
 */
(function (global) {
  const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const STEMS_H = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  const BRANCHES_H = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const ZODIAC = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
  const STEM_ELEM = ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수'];
  const STEM_YANG = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
  const BRANCH_ELEM = ['수', '토', '목', '목', '토', '화', '화', '토', '금', '금', '토', '수'];
  const ELEMS = ['목', '화', '토', '금', '수'];
  // 상생: 목→화→토→금→수→목
  const GEN = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' };
  // 상극: 목→토→수→화→금→목
  const OVERCOME = { 목: '토', 토: '수', 수: '화', 화: '금', 금: '목' };

  // 절기 근사 (월지 경계): [월지 index, 경계 월, 경계 일]
  // 인월=입춘(2/4) 묘월=경칩(3/6) 진월=청명(4/5) 사월=입하(5/6) 오월=망종(6/6)
  // 미월=소서(7/7) 신월=입추(8/8) 유월=백로(9/8) 술월=한로(10/8) 해월=입동(11/7)
  // 자월=대설(12/7) 축월=소한(1/6)
  // 달력 순서(1월→12월)로 나열 — 마지막으로 지난 경계가 그 달의 월지
  const TERMS = [
    [1, 1, 6], [2, 2, 4], [3, 3, 6], [4, 4, 5], [5, 5, 6], [6, 6, 6],
    [7, 7, 7], [8, 8, 8], [9, 9, 8], [10, 10, 8], [11, 11, 7], [0, 12, 7]
  ];

  function jdn(y, m, d) {
    const a = Math.floor((14 - m) / 12);
    const yy = y + 4800 - a;
    const mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy +
      Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }

  function pillars(y, m, d, hourBranch /* 0-11 or null */) {
    // 일주: (JDN + 49) % 60  — 2000-01-01 = 무오(54) 검증 앵커
    const dayIdx = ((jdn(y, m, d) + 49) % 60 + 60) % 60;
    const dayStem = dayIdx % 10, dayBranch = dayIdx % 12;

    // 년주: 입춘(2/4) 기준
    const sajuYear = (m < 2 || (m === 2 && d < 4)) ? y - 1 : y;
    const yStem = ((sajuYear - 4) % 10 + 10) % 10;
    const yBranch = ((sajuYear - 4) % 12 + 12) % 12;

    // 월주: 절기 경계로 월지 결정
    let mBranch = 0; // 1/1~1/5 = 자월 (전년 대설 구간)
    for (const [bi, bm, bd] of TERMS) {
      if (m > bm || (m === bm && d >= bd)) mBranch = bi;
    }
    // 월간: 년간에 따른 인월 시작 천간 (갑기→병, 을경→무, 병신→경, 정임→임, 무계→갑)
    const firstMonthStem = [2, 4, 6, 8, 0][yStem % 5];
    const monthOrder = (mBranch - 2 + 12) % 12; // 인월부터 몇 번째 달인지
    const mStem = (firstMonthStem + monthOrder) % 10;

    // 시주: 일간에 따른 자시 시작 천간 (갑기→갑, 을경→병, 병신→무, 정임→경, 무계→임)
    let hStem = null;
    if (hourBranch !== null && hourBranch !== undefined && hourBranch >= 0) {
      const firstHourStem = [0, 2, 4, 6, 8][dayStem % 5];
      hStem = (firstHourStem + hourBranch) % 10;
    }

    const p = {
      year: { stem: yStem, branch: yBranch },
      month: { stem: mStem, branch: mBranch },
      day: { stem: dayStem, branch: dayBranch },
      hour: (hStem === null) ? null : { stem: hStem, branch: hourBranch }
    };
    p.elements = countElements(p);
    p.zodiac = ZODIAC[yBranch];
    p.dayMaster = STEMS[dayStem];
    p.dayMasterElem = STEM_ELEM[dayStem];
    p.text = fmt(p);
    return p;
  }

  function countElements(p) {
    const c = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    for (const key of ['year', 'month', 'day', 'hour']) {
      const pl = p[key];
      if (!pl) continue;
      c[STEM_ELEM[pl.stem]]++;
      c[BRANCH_ELEM[pl.branch]]++;
    }
    return c;
  }

  function pillarStr(pl) {
    if (!pl) return '시주 미상';
    return STEMS[pl.stem] + BRANCHES[pl.branch] +
      '(' + STEMS_H[pl.stem] + BRANCHES_H[pl.branch] + ')';
  }
  function fmt(p) {
    return {
      year: pillarStr(p.year), month: pillarStr(p.month),
      day: pillarStr(p.day), hour: pillarStr(p.hour)
    };
  }

  // ── 궁합 규칙표 ──────────────────────────────
  const STEM_HAP = [[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]]; // 천간합
  const SIX_HAP = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]]; // 지지육합
  const TRINE = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]]; // 삼합국
  const WONJIN = [[0, 7], [1, 6], [2, 9], [3, 8], [4, 11], [5, 10]]; // 원진 근사

  const inPair = (list, a, b) => list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  const inTrine = (a, b) => a !== b && TRINE.some(t => t.includes(a) && t.includes(b));
  const isChung = (a, b) => (a + 6) % 12 === b;

  function compat(pa, pb) {
    let score = 50;
    const good = [], bad = [];

    // 1) 일간 천간합 — 배필의 연
    if (inPair(STEM_HAP, pa.day.stem, pb.day.stem)) {
      score += 18;
      good.push('두 사람의 일간이 천간합(天干合)을 이룹니다. 명리에서 배필의 연으로 보는 가장 강한 신호예요.');
    }
    // 2) 일간 오행 상생/상극
    const ea = STEM_ELEM[pa.day.stem], eb = STEM_ELEM[pb.day.stem];
    if (GEN[ea] === eb || GEN[eb] === ea) {
      score += 8;
      good.push(`일간 오행이 상생(${ea}↔${eb}) 관계 — 서로의 기운을 살려주는 사이입니다.`);
    } else if (OVERCOME[ea] === eb || OVERCOME[eb] === ea) {
      score -= 6;
      bad.push(`일간 오행이 상극(${ea}↔${eb}) 관계 — 부딪힘이 있을 수 있어 배려가 필요해요.`);
    }
    // 3) 일지 관계 (배우자궁)
    const da = pa.day.branch, db = pb.day.branch;
    if (inPair(SIX_HAP, da, db)) { score += 12; good.push('배우자궁인 일지가 육합(六合) — 함께 있을수록 편안해지는 조합입니다.'); }
    else if (inTrine(da, db)) { score += 8; good.push('일지가 삼합(三合)의 짝 — 자연스럽게 뜻이 모이는 사이예요.'); }
    if (isChung(da, db)) { score -= 10; bad.push('일지가 충(沖) — 생활 리듬이 부딪힐 수 있어요. 다름을 인정하면 오히려 자극이 됩니다.'); }
    if (inPair(WONJIN, da, db)) { score -= 6; bad.push('일지 원진(元嗔) — 사소한 오해가 쌓이지 않게 대화가 중요해요.'); }
    // 4) 띠(년지) 관계
    const ya = pa.year.branch, yb = pb.year.branch;
    if (inPair(SIX_HAP, ya, yb)) { score += 6; good.push(`${ZODIAC[ya]}띠와 ${ZODIAC[yb]}띠 — 띠 육합의 어울리는 짝입니다.`); }
    else if (inTrine(ya, yb)) { score += 5; good.push(`${ZODIAC[ya]}띠와 ${ZODIAC[yb]}띠 — 띠 삼합, 주변에서도 잘 어울린다는 말을 듣는 조합.`); }
    if (isChung(ya, yb)) { score -= 6; bad.push('띠끼리는 충(沖)이라 첫인상이 강하게 부딪힐 수 있지만, 오래 보면 보완이 되기도 합니다.'); }
    // 5) 오행 보완 — 내게 부족한 기운을 상대가 채우는가
    let fill = 0;
    for (const el of ELEMS) {
      if (pa.elements[el] === 0 && pb.elements[el] >= 2) { fill++; good.push(`나에게 없는 ${el}(五行) 기운을 상대가 넉넉히 채워줍니다.`); }
      if (pb.elements[el] === 0 && pa.elements[el] >= 2) { fill++; }
    }
    score += Math.min(fill * 5, 10);
    // 6) 음양 조화
    if (STEM_YANG[pa.day.stem] !== STEM_YANG[pb.day.stem]) {
      score += 6;
      good.push('일간의 음양이 서로 달라 자연스러운 균형을 이룹니다.');
    }

    score = Math.max(8, Math.min(99, score));
    let grade, headline;
    if (score >= 88) { grade = '천생연분'; headline = '붉은 실이 가장 굵게 이어진 인연입니다.'; }
    else if (score >= 76) { grade = '상서로운 연'; headline = '만나볼 가치가 충분한, 상서로운 인연입니다.'; }
    else if (score >= 62) { grade = '무난한 연'; headline = '서로 노력하면 좋은 그림이 나오는 조합입니다.'; }
    else { grade = '수행의 연'; headline = '배울 점은 많지만, 연인보다는 인연 공부에 가까워요.'; }

    return { score, grade, headline, good, bad };
  }

  // 폼 응답 파싱 도우미: "1994.03.15" / "19940315" → [y,m,d], "오시 (11:00~12:59)" → 6
  function parseBirth(str) {
    const v = String(str || '').replace(/[^0-9]/g, '');
    if (v.length !== 8) return null;
    return [+v.slice(0, 4), +v.slice(4, 6), +v.slice(6, 8)];
  }
  function parseHourBranch(str) {
    const i = BRANCHES.findIndex(b => String(str || '').startsWith(b + '시'));
    return i >= 0 ? i : null;
  }

  global.Saju = { pillars, compat, parseBirth, parseHourBranch, STEMS, BRANCHES, ZODIAC, ELEMS };
})(window);
