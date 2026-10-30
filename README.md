# 제주여라 설문

이 저장소는 업토너의 "제주여라" 연구용역에서 쓰는 설문 두 가지를 담고 있습니다. 하나는 외국인 관광객 대상 소비자 설문이고, 다른 하나는 제주 소상공인 대상 입점사 설문입니다. 지금은 설문 문항 데이터와 구글폼 생성 스크립트가 들어 있으며, 이 데이터를 읽는 설문 웹사이트를 이어서 만들 예정입니다.

## 폴더 구조

```
jejuyeora-survey/
  README.md                    이 문서입니다.
  CLAUDE.md                    다음 Claude Code 세션을 위한 프로젝트 맥락입니다.
  survey/
    consumer.json              소비자 설문입니다. 영어, 중국어 간체, 일본어, 한국어 4개 언어가 들어 있고 Q1부터 Q29까지 29문항입니다.
    merchant.json              입점사 설문입니다. 한국어이고 M1부터 M28까지 28문항입니다.
  scripts/
    extract-survey.mjs         .gs 파일에서 survey/*.json 을 다시 만드는 스크립트입니다.
  google-forms/
    jejuyeora-forms.gs         구글폼 생성 스크립트(Google Apps Script) 사본입니다. 설문 문항의 원본입니다.
  docs/
    google-forms.md            운영 중인 구글폼 링크와 운영 방식입니다.
```

## 설문 문항의 원본과 JSON 생성

설문 문항의 원본은 `google-forms/jejuyeora-forms.gs` 입니다. JSON 파일은 손으로 고치지 않고, .gs 파일을 고친 뒤 스크립트로 다시 만듭니다.

```bash
node scripts/extract-survey.mjs                      # 기본 입력은 google-forms/jejuyeora-forms.gs 입니다.
node scripts/extract-survey.mjs 다른/경로/파일.gs     # 다른 .gs 파일을 읽을 수도 있습니다.
```

스크립트는 Node.js 18 이상에서 동작하며 외부 패키지가 필요하지 않습니다. .gs 파일을 격리된 컨텍스트에서 실행해 데이터 변수(LANGS, CONSUMER_SECTIONS, MERCHANT_SECTIONS 등)만 읽습니다. FormApp 같은 Google 서비스는 호출하지 않습니다. 실행이 끝나면 섹션 수와 문항 수를 출력합니다.

## JSON 형식

두 파일은 같은 구조를 씁니다. 언어별 텍스트는 언어 코드를 키로 하는 객체입니다. 소비자 설문의 언어 코드는 `en`, `zh`, `ja`, `ko` 이고, 입점사 설문은 `ko` 하나입니다.

```json
{
  "survey": "consumer",
  "source": "jejuyeora-forms.gs",
  "languages": ["en", "zh", "ja", "ko"],
  "languageNames": { "en": "English", "zh": "中文（简体）", "ja": "日本語", "ko": "한국어" },
  "title": { "en": "Jeju Travel Survey", "ko": "제주 여행 설문" },
  "confirmation": { "en": "Thank you. ...", "ko": "감사합니다. ..." },
  "intro": { "title": { "ko": "설문 안내" }, "body": { "ko": "안녕하세요. ..." } },
  "privacy": { "title": {}, "help": {}, "agree": {}, "disagree": {} },
  "sections": [
    {
      "index": 1,
      "title": { "ko": "1. 응답자 정보" },
      "description": null,
      "questions": [ ]
    }
  ]
}
```

위 예시는 일부 언어만 보여 줍니다. 실제 파일에는 모든 언어가 들어 있습니다. `languageNames` 는 소비자 설문에만 있고, 입점사 설문의 `intro` 에는 `body` 만 있습니다. `privacy.help` 는 줄바꿈(`\n`)으로 항목을 나눈 문자열입니다.

### 문항 필드

| 필드 | 설명 |
| --- | --- |
| `code` | 문항 번호입니다(Q1, M1 등). 언어와 무관하게 같습니다. |
| `type` | 문항 종류입니다. 아래 표를 참고합니다. |
| `required` | 필수 응답 여부입니다. |
| `other` | true 이면 "기타" 보기와 직접 입력 칸을 함께 보여 줍니다. |
| `max` | 체크박스에서 고를 수 있는 최대 개수입니다. 제한이 없으면 null 입니다. |
| `text` | 언어별 질문 문장입니다. |
| `options` | 언어별 보기 목록입니다. mc, cb, list 에만 있습니다. |
| `rows`, `cols` | 언어별 행렬 행과 열입니다. grid 에만 있습니다. |
| `scale` | 척도 정보입니다. `min` 은 1, `max` 는 5 이고 `lo`, `hi` 는 양 끝의 언어별 라벨입니다. scale 에만 있습니다. |

### 문항 종류

| type | 의미 |
| --- | --- |
| `mc` | 객관식으로 하나를 고릅니다. |
| `cb` | 체크박스로 여러 개를 고릅니다. `max` 가 있으면 그 수까지만 고릅니다. |
| `list` | 드롭다운에서 하나를 고릅니다. |
| `grid` | 행렬형 문항입니다. 행마다 열 하나를 고릅니다. |
| `scale` | 1에서 5 사이의 척도입니다. |
| `text` | 단답형입니다. |
| `para` | 장문형입니다. |

필수 여부는 구글폼 스크립트와 같은 기준으로 정합니다. 객관식 계열(mc, cb, list, grid, scale)은 원본에 `req: false` 가 없으면 필수입니다. text 와 para 는 원본에 `req: true` 가 있을 때만 필수입니다.

"기타" 보기의 언어별 문구는 원본에 없습니다. 구글폼이 자동으로 붙이기 때문입니다. 웹사이트에서는 화면 문구로 따로 정해야 합니다.
