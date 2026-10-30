#!/usr/bin/env node
// 구글폼 생성 스크립트(.gs)의 데이터 변수만 읽어 survey/consumer.json, survey/merchant.json 을 만든다.
// FormApp 같은 Google 서비스는 호출하지 않는다. 함수는 정의만 되고 실행되지 않는다.
//
// 사용법: node scripts/extract-survey.mjs [입력 .gs 경로]
// 입력 경로를 주지 않으면 저장소 안 google-forms/jejuyeora-forms.gs 를 읽는다.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = path.resolve(process.argv[2] || path.join(root, 'google-forms', 'jejuyeora-forms.gs'));
const outDir = path.join(root, 'survey');

const src = fs.readFileSync(input, 'utf8');

// .gs 파일을 격리된 컨텍스트에서 실행한다. 최상위 var 선언이 ctx 의 속성이 된다.
const ctx = {};
vm.createContext(ctx);
vm.runInContext(src, ctx, { filename: path.basename(input) });

const need = [
  'LANGS', 'LANG_NAME', 'C_INTRO_TITLE', 'C_INTRO', 'C_PRIVACY_TITLE', 'C_PRIVACY_HELP',
  'C_CONSENT_YES', 'C_CONSENT_NO', 'CONSUMER_SECTIONS', 'M_INTRO', 'PRIVACY_TITLE',
  'M_PRIVACY_HELP', 'MERCHANT_SECTIONS'
];
for (const name of need) {
  if (ctx[name] === undefined) throw new Error(`변수 ${name} 를 찾지 못했습니다: ${input}`);
}

const LANGS = [...ctx.LANGS];
const plain = (v) => JSON.parse(JSON.stringify(v));

// 'en | zh | ja | ko' 처럼 한 줄에 모든 언어를 이어 쓴 문구를 LANGS 순서로 나눈다.
// 언어별 객체(T 함수 결과)로 바뀌어 있으면 그대로 쓴다.
function perLang(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === 'object') return pick(v, LANGS);
  const parts = String(v).split(' | ');
  if (parts.length !== LANGS.length) return Object.fromEntries(LANGS.map((l) => [l, String(v)]));
  return Object.fromEntries(LANGS.map((l, i) => [l, parts[i]]));
}

function pick(obj, langs) {
  if (obj === undefined || obj === null) return null;
  return Object.fromEntries(langs.map((l) => [l, plain(obj[l])]));
}

// addItem_ 과 같은 기준: text, para 는 req 가 true 일 때만 필수, 나머지는 req 가 false 가 아니면 필수.
function isRequired(q) {
  return (q.type === 'text' || q.type === 'para') ? q.req === true : q.req !== false;
}

function question(q, langs) {
  const out = {
    code: q.code,
    type: q.type,
    required: isRequired(q),
    other: q.other === true,
    max: q.max ?? null,
    text: pick(q.t, langs)
  };
  if (q.o) out.options = pick(q.o, langs);
  if (q.type === 'grid') {
    out.rows = pick(q.rows, langs);
    out.cols = pick(q.cols, langs);
  }
  if (q.type === 'scale') {
    out.scale = { min: 1, max: 5, lo: pick(q.lo, langs), hi: pick(q.hi, langs) };
  }
  return out;
}

function sections(list, langs) {
  return list.map((sec, i) => ({
    index: i + 1,
    title: pick(sec.title, langs),
    description: sec.desc ? pick(sec.desc, langs) : null,
    questions: sec.items.map((q) => question(q, langs))
  }));
}

// 함수 안에 문자열로만 들어 있는 값은 정규식으로 찾는다. 없으면 null.
function findLiteral(re) {
  const m = src.match(re);
  return m ? m[1] : null;
}

const consumer = {
  survey: 'consumer',
  source: path.basename(input),
  languages: LANGS,
  languageNames: pick(ctx.LANG_NAME, LANGS),
  title: perLang(ctx.C_TITLE),
  confirmation: perLang(ctx.C_CONFIRM),
  intro: {
    title: pick(ctx.C_INTRO_TITLE, LANGS),
    body: pick(ctx.C_INTRO, LANGS)
  },
  privacy: {
    title: pick(ctx.C_PRIVACY_TITLE, LANGS),
    help: pick(ctx.C_PRIVACY_HELP, LANGS),
    agree: pick(ctx.C_CONSENT_YES, LANGS),
    disagree: pick(ctx.C_CONSENT_NO, LANGS)
  },
  sections: sections(ctx.CONSUMER_SECTIONS, LANGS)
};

const KO = ['ko'];
const merchant = {
  survey: 'merchant',
  source: path.basename(input),
  languages: KO,
  title: { ko: findLiteral(/newForm_\('([^']+)',\s*M_INTRO\)/) },
  confirmation: { ko: findLiteral(/function createMerchantForm[\s\S]*?setConfirmationMessage\('([^']+)'\)/) },
  intro: { body: { ko: ctx.M_INTRO } },
  privacy: {
    title: { ko: ctx.PRIVACY_TITLE },
    help: { ko: ctx.M_PRIVACY_HELP },
    agree: { ko: ctx.C_CONSENT_YES.ko },
    disagree: { ko: ctx.C_CONSENT_NO.ko }
  },
  sections: sections(ctx.MERCHANT_SECTIONS, KO)
};

fs.mkdirSync(outDir, { recursive: true });
for (const [name, data] of [['consumer', consumer], ['merchant', merchant]]) {
  const file = path.join(outDir, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  const n = data.sections.reduce((s, sec) => s + sec.questions.length, 0);
  console.log(`${path.relative(root, file)}: 섹션 ${data.sections.length}개, 문항 ${n}개`);
}
