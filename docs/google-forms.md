# 구글폼 링크

2026년 10월 30일 기준으로 실제 운영하는 구글폼이다. 모든 폼은 플랜더 구글 계정에 있고, "다음" 버튼 없이 한 페이지에서 끝까지 답한 뒤 제출한다.

## 소비자 설문 (언어별 4개)

응답은 시트 하나에 언어별 탭으로 모인다. 문항 번호(Q1부터 Q29까지)는 네 폼이 모두 같다.

| 언어 | 응답 링크 | 편집 |
| --- | --- | --- |
| 영어 | https://docs.google.com/forms/d/e/1FAIpQLScDCfjVQAr2VL3dp5Pjew5SHmzvkppFFUs4oNdhuBi4AweVGw/viewform | https://docs.google.com/forms/d/10kmJfS4NCCp7wXTZgMHWwzAGv8ZGFMcUKfZ_1xKRK4w/edit |
| 중국어 간체 | https://docs.google.com/forms/d/e/1FAIpQLSdLee-wnvtn_Rt-8jv4yqIl2c0NyFPfbwf-x4fSqJz8fKseUA/viewform | https://docs.google.com/forms/d/1sd_0parC6KTGZq9k4LzaRO-EzjtYacxBJwPKfJj1PM8/edit |
| 일본어 | https://docs.google.com/forms/d/e/1FAIpQLScJDIYra-Xiw_OgEptOGA_Z_VZZ7tUEGDK05xUzoKOvpknITg/viewform | https://docs.google.com/forms/d/1Mwqz4DCdWxsC8dGob4hT3RZjyuVwB6j-bFvCJ_oOXEY/edit |
| 한국어 | https://docs.google.com/forms/d/e/1FAIpQLSctxvNNwX5GPTQqSTwpcrta2yIoG8A2tY5Q_rOQ6vcZ7rp0pQ/viewform | https://docs.google.com/forms/d/18Io2ZvXWIiq66NHhDc8x21jBbCPu25MTfMwttK27sOQ/edit |

- 응답 시트: https://docs.google.com/spreadsheets/d/12HNR2ycziZuIxH2_yZFOkN2_Skie4ifH64ibokaEiLM/edit

## 입점사 설문 (한국어 1개)

- 응답 링크: https://docs.google.com/forms/d/e/1FAIpQLSdPU_yFAlpUERGScuRdd24AGT7aOYihf2xXpcGGHbmcO4X1vg/viewform
- 편집: https://docs.google.com/forms/d/1LvJXWRgDZEleQApyjwrTBug4YMe15Vq5dq4WvpK0WYs/edit
- 응답 시트: https://docs.google.com/spreadsheets/d/1FJfXcZTgPQUo6QQJMzj51RR1LffGOF3Az-8aywKAJbY/edit

## 운영 방식

- 한 페이지에서는 답에 따라 다른 곳으로 이동할 수 없다. 그래서 개인정보 동의는 체크해야만 제출되는 필수 체크박스로 받는다.
- 섹션은 페이지 나눔 대신 섹션 제목으로 구분한다.
- 진행률 표시는 끈다.

## 닫은 폼

- 4개 언어 통합 소비자 폼(ID 16cLie43cygZfk1UTSK8kjUAT_Zkp9ai7AS_PTzpt_94)은 응답 받기를 껐다. 폼과 예전 응답 시트는 지우지 않았다.
- 닫힌 화면의 안내 문구는 API가 거부해서 설정하지 못했다. 필요하면 폼 편집 화면에서 직접 넣는다.

## 다시 만들거나 고칠 때

`google-forms/jejuyeora-forms.gs` 를 Apps Script 프로젝트(1XaNbBobxdLvhQguqiLrcIRrQjc30KKxtF2PKxSzMz0FnkG8ycZ3Ey_MW)에 붙여넣고 함수를 고른다.

- `createConsumerOnePageForms`: 언어별 소비자 폼 4개와 응답 시트를 새로 만든다. 실행할 때마다 새 폼이 생기므로 주의한다.
- `convertMerchantToOnePage`: 입점사 폼을 같은 링크에서 한 페이지로 바꾼다. 다시 실행해도 안전하다.
- 실행 한 번은 6분을 넘길 수 없다. 소비자 폼 4개를 만드는 데 약 4분이 걸린다.
