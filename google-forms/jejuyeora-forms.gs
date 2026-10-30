/**
 * 제주여라 연구용역 설문 생성 스크립트 (수행: 주식회사 플랜더, 의뢰: 업토너)
 *
 * 사용법
 * 1. https://script.google.com 에서 새 프로젝트를 만든다.
 * 2. 기본 코드를 지우고 이 파일 전체를 붙여넣고 저장한다.
 * 3. 위쪽 함수 선택에서 createAllForms 를 고르고 실행한다. 처음 한 번은 권한 승인이 필요하다.
 * 4. 실행 로그에 두 설문의 편집 주소, 응답 주소, 응답 시트 주소가 나온다.
 *
 * 만들어지는 것
 * - 소비자 설문: 영어, 중국어 간체, 일본어, 한국어 중 하나를 고르면 그 언어 섹션으로 이동한다.
 *   모든 언어의 문항 번호(Q1, Q2 ...)가 같아서 응답 시트에서 번호로 합쳐 분석할 수 있다.
 * - 입점사 설문: 제주 소상공인용 한국어 설문이다.
 *
 * 이미 만든 폼을 고칠 때
 * - rebuildConsumerForm: 기존 소비자 설문의 링크를 그대로 두고 문항을 4개 언어로 다시 구성한다.
 * - updateMerchantIntro: 입점사 설문의 안내문을 이 파일의 내용으로 바꾼다.
 *
 * 한 페이지 버전(현재 사용)
 * - createConsumerOnePageForms: 소비자 설문을 언어별 한 페이지 폼 4개로 만들고 기존 통합 폼을 닫는다.
 * - convertMerchantToOnePage: 입점사 설문을 같은 링크에서 한 페이지로 바꾼다.
 */

var CONSUMER_FORM_ID = '16cLie43cygZfk1UTSK8kjUAT_Zkp9ai7AS_PTzpt_94';
var MERCHANT_FORM_ID = '1LvJXWRgDZEleQApyjwrTBug4YMe15Vq5dq4WvpK0WYs';

// 언어 선택 화면에 보이는 순서다.
var LANGS = ['en', 'zh', 'ja', 'ko'];
var LANG_NAME = { ko: '한국어', zh: '中文（简体）', en: 'English', ja: '日本語' };

function T(ko, zh, en, ja) { return { ko: ko, zh: zh, en: en, ja: ja }; }

/* ------------------------------------------------------------------ */
/* 소비자 설문 공통 문구                                                 */
/* ------------------------------------------------------------------ */

var C_INTRO_TITLE = T('설문 안내', '问卷说明', 'About this survey', 'アンケートのご案内');

var C_INTRO = T(
  '안녕하세요. 이 설문은 제주 여행 중 맛집, 카페, 히든스팟, 로컬상품 정보를 더 쉽게 찾을 수 있는 서비스를 만들기 위한 조사입니다. 응답에는 약 10분이 걸립니다. 응답은 통계 목적으로만 쓰이며 개인을 식별하지 않습니다.',
  '您好！本问卷旨在打造一款帮助游客在济州旅行中更方便地找到美食、咖啡馆、小众景点和本地特产信息的服务。填写约需10分钟。您的回答仅用于统计分析，不会识别个人身份。',
  'Hello! This survey helps us build a service that makes it easier to find restaurants, cafes, hidden spots and local products while traveling in Jeju. It takes about 10 minutes. Your answers are used only for statistics and will not identify you.',
  'こんにちは。本アンケートは、済州旅行中にグルメ、カフェ、穴場スポット、ローカル商品の情報をより簡単に見つけられるサービスを作るための調査です。回答には約10分かかります。回答は統計目的にのみ使用され、個人を特定することはありません。'
);

var C_CONSENT_Q = T(
  '위 내용을 읽었고 설문 참여에 동의합니다.',
  '我已阅读以上内容，同意参与本调查。',
  'I have read the above and agree to take part in this survey.',
  '上記の内容を読み、アンケートへの参加に同意します。'
);
var C_CONSENT_YES = T('동의합니다', '同意', 'I agree', '同意します');

// 개인정보 보호법 제15조에 따라 알려야 하는 네 가지(목적, 항목, 보유 기간, 거부 권리)를 담는다.
var PRIVACY_TITLE = '개인정보 수집 및 이용에 동의합니다.';
var C_PRIVACY_TITLE = T(
  PRIVACY_TITLE,
  '我同意收集和使用个人信息。',
  'I agree to the collection and use of my personal information.',
  '個人情報の収集および利用に同意します。'
);
var C_PRIVACY_HELP = T(
  [
    '1. 수집 항목: 설문 응답 내용(국적, 연령대, 성별, 여행 정보 등)',
    '2. 수집 목적: 제주 여행 서비스 개선을 위한 통계 분석',
    '3. 보유 및 이용 기간: 조사가 끝나면 지체 없이 파기합니다.',
    '4. 동의를 거부할 권리: 동의를 거부할 수 있으며, 거부하면 설문에 참여할 수 없습니다.'
  ].join('\n'),
  [
    '1. 收集项目：问卷回答内容（国籍、年龄段、性别、旅行信息等）',
    '2. 收集目的：为改进济州旅行服务进行统计分析',
    '3. 保存及使用期限：调查结束后立即销毁。',
    '4. 拒绝同意的权利：您可以拒绝同意，但拒绝后将无法参与本问卷。'
  ].join('\n'),
  [
    '1. Information collected: your survey answers (nationality, age group, gender, travel details, etc.)',
    '2. Purpose: statistical analysis to improve travel services in Jeju',
    '3. Retention period: deleted without delay when the survey ends.',
    '4. Right to refuse: you may refuse, but then you cannot take part in the survey.'
  ].join('\n'),
  [
    '1. 収集項目：アンケートの回答内容（国籍、年代、性別、旅行情報など）',
    '2. 収集目的：済州旅行サービス改善のための統計分析',
    '3. 保有および利用期間：調査終了後、速やかに破棄します。',
    '4. 同意を拒否する権利：同意を拒否することができますが、拒否した場合はアンケートに参加できません。'
  ].join('\n')
);
var M_PRIVACY_HELP = [
  '1. 수집 항목: 업체명, 업종, 매장 위치 등 설문 응답 내용, 담당자 이름과 연락처(선택 입력)',
  '2. 수집 목적: 사업자 관리 기능 개선을 위한 통계 분석, 심층 인터뷰와 사용성 테스트 참여 안내, 사례비 지급',
  '3. 보유 및 이용 기간: 조사가 끝나면 지체 없이 파기합니다. 다만 사례비 지급 증빙에 필요한 정보는 사업 정산이 끝날 때까지 보관한 뒤 파기합니다.',
  '4. 동의를 거부할 권리: 동의를 거부할 수 있으며, 거부하면 설문에 참여할 수 없습니다. 담당자 이름과 연락처는 선택 항목이므로 적지 않아도 설문에 참여할 수 있습니다.'
].join('\n');
var C_CONSENT_NO = T('동의하지 않습니다', '不同意', 'I do not agree', '同意しません');

var C_TITLE = 'Jeju Travel Survey | 济州旅行问卷 | 済州旅行アンケート | 제주 여행 설문';
var C_DESC = 'Please choose your language on the next question. | 请在下方选择语言。 | 下の質問で言語を選んでください。 | 아래에서 언어를 선택해 주세요.';
var C_CONFIRM = 'Thank you. Your response has been submitted. | 感谢您的参与，问卷已提交。 | ご協力ありがとうございました。回答が送信されました。 | 감사합니다. 응답이 제출되었습니다.';
var C_LANG_Q = 'Language | 语言 | 言語 | 언어';

/* 여러 문항에서 다시 쓰는 보기 */

var CHANNELS = T(
  ['샤오홍슈', '더우인', '위챗', '인스타그램', '유튜브', '틱톡', '구글 검색이나 구글 지도', '네이버 지도', '카카오맵', '트립어드바이저', '여행사나 가이드', '블로그', '지인 추천'],
  ['小红书', '抖音', '微信', 'Instagram', 'YouTube', 'TikTok', '谷歌搜索或谷歌地图', 'Naver地图', 'Kakao地图', '猫途鹰（Tripadvisor）', '旅行社或导游', '博客', '亲友推荐'],
  ['Xiaohongshu (RED)', 'Douyin', 'WeChat', 'Instagram', 'YouTube', 'TikTok', 'Google Search or Google Maps', 'Naver Map', 'KakaoMap', 'Tripadvisor', 'Travel agency or guide', 'Blogs', 'Friends or family'],
  ['小紅書（RED）', '抖音（Douyin）', 'WeChat', 'Instagram', 'YouTube', 'TikTok', 'Google検索またはGoogleマップ', 'NAVER地図', 'カカオマップ', 'トリップアドバイザー', '旅行会社またはガイド', 'ブログ', '知人の紹介']
);

var CRITERIA = T(
  ['리뷰 평점', '현재 위치에서의 거리', '지금 영업 중인지', '외국어 메뉴나 안내', '알리페이나 위챗페이 결제 가능', '사진이 잘 나오는 곳', '가격', '같은 나라 여행자의 추천', '예약 가능 여부'],
  ['评价评分', '与当前位置的距离', '现在是否营业', '外语菜单或说明', '可使用支付宝或微信支付', '适合拍照', '价格', '同国游客的推荐', '能否预约'],
  ['Review rating', 'Distance from where I am', 'Open right now', 'Menu or information in my language', 'Accepts Alipay or WeChat Pay', 'Good for photos', 'Price', 'Recommended by travelers from my country', 'Can be reserved'],
  ['口コミ評価', '現在地からの距離', '今営業しているか', '外国語メニューや案内', 'AlipayやWeChat Payが使える', '写真映えする', '価格', '同じ国の旅行者のおすすめ', '予約できるか']
);

var IMPORTANCE = T(
  ['1 전혀 중요하지 않음', '2', '3', '4', '5 매우 중요함'],
  ['1 完全不重要', '2', '3', '4', '5 非常重要'],
  ['1 Not important at all', '2', '3', '4', '5 Very important'],
  ['1 全く重要でない', '2', '3', '4', '5 非常に重要']
);

var YESNO = T(['예', '아니오'], ['是', '否'], ['Yes', 'No'], ['はい', 'いいえ']);

/* ------------------------------------------------------------------ */
/* 소비자 설문 문항                                                     */
/* ------------------------------------------------------------------ */

var CONSUMER_SECTIONS = [
  {
    title: T('1. 응답자 정보', '1. 关于您', '1. About you', '1. あなたについて'),
    items: [
      { code: 'Q1', type: 'mc', other: true,
        t: T('국적을 골라 주세요.', '请选择您的国籍或地区。', 'What is your nationality?', '国籍を選んでください。'),
        o: T(['중국 본토', '홍콩', '마카오', '대만', '일본', '미국', '영국', '호주', '캐나다', '싱가포르', '말레이시아', '한국'],
             ['中国大陆', '香港', '澳门', '台湾', '日本', '美国', '英国', '澳大利亚', '加拿大', '新加坡', '马来西亚', '韩国'],
             ['Mainland China', 'Hong Kong', 'Macau', 'Taiwan', 'Japan', 'USA', 'UK', 'Australia', 'Canada', 'Singapore', 'Malaysia', 'Korea'],
             ['中国本土', '香港', 'マカオ', '台湾', '日本', 'アメリカ', 'イギリス', 'オーストラリア', 'カナダ', 'シンガポール', 'マレーシア', '韓国']) },
      { code: 'Q2', type: 'mc',
        t: T('연령대를 골라 주세요.', '您的年龄段是？', 'What is your age group?', '年代を選んでください。'),
        o: T(['20세 미만', '20대', '30대', '40대', '50대', '60세 이상'],
             ['20岁以下', '20多岁', '30多岁', '40多岁', '50多岁', '60岁及以上'],
             ['Under 20', '20s', '30s', '40s', '50s', '60 or older'],
             ['20歳未満', '20代', '30代', '40代', '50代', '60歳以上']) },
      { code: 'Q3', type: 'mc',
        t: T('성별을 골라 주세요.', '您的性别是？', 'What is your gender?', '性別を選んでください。'),
        o: T(['남성', '여성', '응답하지 않음'], ['男', '女', '不愿透露'], ['Male', 'Female', 'Prefer not to say'], ['男性', '女性', '回答しない']) },
      { code: 'Q4', type: 'mc', other: true,
        t: T('이번 여행은 누구와 함께 왔습니까?', '这次旅行您和谁一起？', 'Who are you traveling with?', '今回の旅行は誰と来ましたか。'),
        o: T(['혼자', '연인 또는 배우자', '가족(아이 동반)', '가족(아이 없음)', '친구', '단체 여행'],
             ['独自一人', '情侣或配偶', '家庭（带孩子）', '家庭（不带孩子）', '朋友', '跟团'],
             ['Alone', 'Partner or spouse', 'Family with children', 'Family without children', 'Friends', 'Tour group'],
             ['一人', '恋人または配偶者', '家族（子ども連れ）', '家族（子どもなし）', '友人', '団体ツアー']) },
      { code: 'Q5', type: 'mc',
        t: T('제주에 며칠 머무릅니까?', '您在济州停留几晚？', 'How many nights are you staying in Jeju?', '済州には何泊しますか。'),
        o: T(['당일', '1박', '2박', '3박', '4박 이상'], ['当天往返', '1晚', '2晚', '3晚', '4晚及以上'],
             ['Day trip', '1 night', '2 nights', '3 nights', '4 nights or more'], ['日帰り', '1泊', '2泊', '3泊', '4泊以上']) },
      { code: 'Q6', type: 'mc', other: true,
        t: T('제주에는 어떻게 왔습니까?', '您是如何来到济州的？', 'How did you arrive in Jeju?', '済州へはどのように来ましたか。'),
        o: T(['제주공항 국제선 직항', '한국 다른 도시를 거쳐 국내선', '크루즈', '여객선'],
             ['国际航班直飞济州', '经韩国其他城市转国内航班', '邮轮', '客轮'],
             ['Direct international flight to Jeju', 'Domestic flight via another Korean city', 'Cruise ship', 'Ferry'],
             ['済州への国際線直行便', '韓国の他都市経由の国内線', 'クルーズ船', 'フェリー']) },
      { code: 'Q7', type: 'mc',
        t: T('제주 방문은 몇 번째입니까?', '这是您第几次来济州？', 'How many times have you visited Jeju?', '済州への訪問は何回目ですか。'),
        o: T(['처음', '두 번째', '세 번째 이상'], ['第一次', '第二次', '三次及以上'],
             ['First time', 'Second time', 'Three times or more'], ['初めて', '2回目', '3回目以上']) },
      { code: 'Q8', type: 'cb', max: 3,
        t: T('이번 제주 여행의 주요 목적을 최대 3개까지 골라 주세요.', '请选择这次济州旅行的主要目的（最多3项）。', 'Choose up to 3 main purposes of this trip to Jeju.', '今回の済州旅行の主な目的を最大3つまで選んでください。'),
        o: T(['맛집', '카페', '자연 경관', '쇼핑', '사진 명소', '체험 활동', '휴양'],
             ['美食', '咖啡馆', '自然风光', '购物', '拍照打卡', '体验活动', '休闲度假'],
             ['Food', 'Cafes', 'Nature and scenery', 'Shopping', 'Photo spots', 'Activities and experiences', 'Relaxation'],
             ['グルメ', 'カフェ', '自然景観', 'ショッピング', '写真映えスポット', '体験アクティビティ', '休養']) }
    ]
  },
  {
    title: T('2. 정보 탐색', '2. 信息获取', '2. Finding information', '2. 情報収集'),
    items: [
      { code: 'Q9', type: 'cb', other: true,
        t: T('여행 전에 제주 정보를 찾을 때 쓴 채널을 모두 골라 주세요.', '出发前您通过哪些渠道查找济州信息？（可多选）', 'Which channels did you use to find information about Jeju before your trip? Choose all that apply.', '旅行前に済州の情報を探すときに使ったチャネルをすべて選んでください。'),
        o: CHANNELS },
      { code: 'Q10', type: 'list',
        t: T('여행 중에 가장 많이 쓰는 앱이나 채널 하나를 골라 주세요.', '旅行中您最常用的一个App或渠道是？', 'Which one app or channel do you use most during your trip?', '旅行中に最もよく使うアプリやチャネルを1つ選んでください。'),
        o: CHANNELS },
      { code: 'Q11', type: 'mc', other: true,
        t: T('장소를 고를 때 가장 믿는 정보는 무엇입니까?', '选择地点时，您最信任哪类信息？', 'When choosing a place, which information do you trust most?', '場所を選ぶとき、最も信頼する情報は何ですか。'),
        o: T(['같은 나라 여행자의 후기', '현지 한국인의 추천', '지도 앱 평점', '인플루언서 콘텐츠', '여행사나 가이드', '공식 관광 사이트'],
             ['同国游客的评价', '韩国当地人的推荐', '地图应用评分', '网红博主内容', '旅行社或导游', '官方旅游网站'],
             ['Reviews by travelers from my country', 'Recommendations from local Koreans', 'Ratings on map apps', 'Influencer content', 'Travel agency or guide', 'Official tourism websites'],
             ['同じ国の旅行者の口コミ', '地元の韓国人のおすすめ', '地図アプリの評価', 'インフルエンサーのコンテンツ', '旅行会社またはガイド', '公式観光サイト']) },
      { code: 'Q12', type: 'cb', other: true,
        t: T('제주에서 정보를 찾을 때 겪은 어려움을 모두 골라 주세요.', '在济州查找信息时，您遇到过哪些困难？（可多选）', 'What difficulties did you have finding information in Jeju? Choose all that apply.', '済州で情報を探すときに困ったことをすべて選んでください。'),
        o: T(['내 언어로 된 정보가 부족하다', '영업시간이나 휴무일 정보가 틀리다', '알리페이나 위챗페이 가능 여부를 알 수 없다', '위치를 찾기 어렵다', '광고성 후기가 많다', '예약하기 어렵다', '특별히 없다'],
             ['缺少我的语言的信息', '营业时间或休息日信息不准确', '无法确认能否使用支付宝或微信支付', '难以找到位置', '广告性质的评价太多', '难以预约', '没有特别的困难'],
             ['Not enough information in my language', 'Opening hours or closing days are wrong', 'Cannot tell if Alipay or WeChat Pay is accepted', 'Hard to find the location', 'Too many sponsored reviews', 'Hard to make reservations', 'No particular difficulty'],
             ['自分の言語の情報が少ない', '営業時間や定休日の情報が正しくない', 'AlipayやWeChat Payが使えるか分からない', '場所を見つけにくい', '広告的な口コミが多い', '予約しにくい', '特にない']) }
    ]
  },
  {
    title: T('3. 음식 취향', '3. 饮食偏好', '3. Food preferences', '3. 食の好み'),
    items: [
      { code: 'Q13', type: 'cb', other: true,
        t: T('제주에서 먹고 싶은 음식을 모두 골라 주세요.', '您在济州想吃哪些食物？（可多选）', 'What food do you want to eat in Jeju? Choose all that apply.', '済州で食べたいものをすべて選んでください。'),
        o: T(['해산물', '흑돼지', '한식 정식', '국수와 분식', '채식 메뉴', '디저트와 카페', '시장 먹거리', '술집과 야식'],
             ['海鲜', '黑猪肉', '韩式套餐', '面食和小吃', '素食', '甜点和咖啡', '市场小吃', '酒吧和夜宵'],
             ['Seafood', 'Black pork', 'Korean set meals', 'Noodles and snacks', 'Vegetarian dishes', 'Desserts and cafes', 'Market street food', 'Bars and late night food'],
             ['海鮮', '黒豚', '韓定食', '麺類と軽食', 'ベジタリアン料理', 'デザートとカフェ', '市場グルメ', '居酒屋と夜食']) },
      { code: 'Q14', type: 'cb', other: true,
        t: T('알레르기나 식사 제한이 있다면 모두 골라 주세요.', '您是否有过敏或饮食限制？（可多选）', 'Do you have any allergies or dietary restrictions? Choose all that apply.', 'アレルギーや食事制限があればすべて選んでください。'),
        o: T(['없음', '해산물 알레르기', '갑각류 알레르기', '견과류 알레르기', '채식(비건 포함)', '할랄 음식만 먹음', '돼지고기를 먹지 않음', '매운 음식을 못 먹음'],
             ['无', '海鲜过敏', '甲壳类过敏', '坚果过敏', '素食（含纯素）', '只吃清真食品', '不吃猪肉', '不能吃辣'],
             ['None', 'Seafood allergy', 'Shellfish allergy', 'Nut allergy', 'Vegetarian or vegan', 'Halal only', 'No pork', 'Cannot eat spicy food'],
             ['なし', '魚介類アレルギー', '甲殻類アレルギー', 'ナッツアレルギー', 'ベジタリアン（ヴィーガンを含む）', 'ハラール食のみ', '豚肉を食べない', '辛い料理が苦手']) },
      { code: 'Q15', type: 'mc',
        t: T('한 끼 식사에 1인당 보통 얼마를 씁니까?', '每餐人均通常花费多少？', 'How much do you usually spend per person on one meal?', '1食あたり1人いくらくらい使いますか。'),
        o: T(['1만원 미만', '1만원 이상 2만원 미만', '2만원 이상 4만원 미만', '4만원 이상'],
             ['1万韩元以下', '1万至2万韩元', '2万至4万韩元', '4万韩元以上'],
             ['Under 10,000 KRW', '10,000 to 20,000 KRW', '20,000 to 40,000 KRW', 'Over 40,000 KRW'],
             ['1万ウォン未満', '1万ウォン以上2万ウォン未満', '2万ウォン以上4万ウォン未満', '4万ウォン以上']) }
    ]
  },
  {
    title: T('4. 장소 선택 기준', '4. 选择地点的标准', '4. Choosing a place', '4. 場所選びの基準'),
    items: [
      { code: 'Q16', type: 'grid',
        t: T('식당, 카페, 관광지를 고를 때 아래 항목이 얼마나 중요합니까?', '选择餐厅、咖啡馆或景点时，以下各项有多重要？', 'When choosing a restaurant, cafe or attraction, how important is each item?', 'レストラン、カフェ、観光地を選ぶとき、次の項目はどのくらい重要ですか。'),
        rows: CRITERIA, cols: IMPORTANCE },
      { code: 'Q17', type: 'mc',
        t: T('위 항목 중 가장 중요한 하나를 골라 주세요.', '以上各项中，最重要的是哪一项？', 'Which one of these is the most important to you?', '上の項目のうち、最も重要なものを1つ選んでください。'),
        o: CRITERIA }
    ]
  },
  {
    title: T('5. 히든스팟', '5. 小众景点', '5. Hidden spots', '5. 穴場スポット'),
    desc: T('히든스팟은 관광객에게 잘 알려지지 않은 장소를 말합니다.', '小众景点是指不太为游客所知的地方。', 'A hidden spot is a place that most tourists do not know about.', '穴場スポットとは、観光客にあまり知られていない場所のことです。'),
    items: [
      { code: 'Q18', type: 'mc',
        t: T('이번 여행에서 히든스팟에 가 본 적이 있습니까?', '这次旅行中，您去过小众景点吗？', 'Have you visited a hidden spot on this trip?', '今回の旅行で穴場スポットに行きましたか。'),
        o: YESNO },
      { code: 'Q19', type: 'scale',
        t: T('직접 찾은 장소를 사진과 함께 앱에 등록해 다른 여행자와 나눌 의향이 있습니까?', '您是否愿意把自己发现的地方连同照片上传到App，与其他游客分享？', 'Would you share a place you found by posting it with photos in an app?', '自分で見つけた場所を写真と一緒にアプリに登録し、他の旅行者と共有したいですか。'),
        lo: T('전혀 없다', '完全不愿意', 'Not at all', '全く思わない'),
        hi: T('매우 많다', '非常愿意', 'Very much', 'とてもそう思う') },
      { code: 'Q20', type: 'cb', other: true,
        t: T('다른 사람이 올린 장소 정보를 믿게 되는 조건을 모두 골라 주세요.', '在什么情况下您会相信别人上传的地点信息？（可多选）', 'What makes you trust a place posted by someone else? Choose all that apply.', '他の人が投稿した場所の情報を信頼できる条件をすべて選んでください。'),
        o: T(['실제 방문 사진이 있다', '위치(GPS) 인증이 되어 있다', '같은 나라 여행자의 후기가 있다', '운영자가 검증했다', '최근에 등록된 정보다', '방문자 수가 많다'],
             ['有实际到访照片', '有位置（GPS）验证', '有同国游客的评价', '经过运营方审核', '信息是最近登记的', '到访人数多'],
             ['Real visit photos', 'Location verified by GPS', 'Reviews from travelers from my country', 'Checked by the operator', 'Recently posted', 'Many visitors'],
             ['実際の訪問写真がある', '位置（GPS）認証がある', '同じ国の旅行者の口コミがある', '運営者が確認済み', '最近登録された情報', '訪問者が多い']) }
    ]
  },
  {
    title: T('6. 로컬상품과 공항 픽업', '6. 本地特产与机场取货', '6. Local products and airport pickup', '6. ローカル商品と空港受け取り'),
    items: [
      { code: 'Q21', type: 'cb', other: true,
        t: T('이번 여행에서 샀거나 살 예정인 제주 상품을 모두 골라 주세요.', '这次旅行您已购买或打算购买哪些济州商品？（可多选）', 'Which Jeju products have you bought or plan to buy on this trip? Choose all that apply.', '今回の旅行で買った、または買う予定の済州の商品をすべて選んでください。'),
        o: T(['화장품', '감귤 가공품(초콜릿, 과자 등)', '오메기떡 등 전통 간식', '차(녹차 등)', '전통주와 맥주', '기념품', '소품과 굿즈', '사지 않았다'],
             ['化妆品', '柑橘加工品（巧克力、饼干等）', '传统小吃（如Omegi年糕）', '茶（如绿茶）', '传统酒和啤酒', '纪念品', '文创小物', '没有购买'],
             ['Cosmetics', 'Tangerine products (chocolate, cookies)', 'Traditional snacks such as omegi rice cake', 'Tea such as green tea', 'Traditional liquor and beer', 'Souvenirs', 'Small goods and character items', 'Did not buy anything'],
             ['化粧品', 'みかん加工品（チョコレート、お菓子など）', 'オメギ餅などの伝統菓子', 'お茶（緑茶など）', '伝統酒とビール', 'お土産', '雑貨とグッズ', '購入していない']) },
      { code: 'Q22', type: 'mc',
        t: T('이번 여행에서 제주 로컬상품에 쓸 예상 금액은 얼마입니까?', '这次旅行您预计在济州本地特产上花费多少？', 'How much do you expect to spend on Jeju local products on this trip?', '今回の旅行で済州のローカル商品に使う予定の金額はいくらですか。'),
        o: T(['쓰지 않음', '5만원 미만', '5만원 이상 10만원 미만', '10만원 이상 20만원 미만', '20만원 이상'],
             ['不花费', '5万韩元以下', '5万至10万韩元', '10万至20万韩元', '20万韩元以上'],
             ['Nothing', 'Under 50,000 KRW', '50,000 to 100,000 KRW', '100,000 to 200,000 KRW', 'Over 200,000 KRW'],
             ['使わない', '5万ウォン未満', '5万ウォン以上10万ウォン未満', '10万ウォン以上20万ウォン未満', '20万ウォン以上']) },
      { code: 'Q23', type: 'cb', other: true,
        t: T('사고 싶었지만 사지 못한 이유가 있다면 모두 골라 주세요.', '如果有想买却没买的情况，原因是什么？（可多选）', 'If you wanted to buy something but did not, why? Choose all that apply.', '買いたかったのに買わなかった理由があればすべて選んでください。'),
        o: T(['짐이 무겁거나 부피가 크다', '가격이 비싸다', '상품 정보가 부족하다', '어디서 파는지 모른다', '원하는 결제수단을 쓸 수 없다', '품질을 믿기 어렵다', '해당 없음'],
             ['行李太重或太占地方', '价格太贵', '商品信息不足', '不知道在哪里买', '无法使用想要的支付方式', '难以信任品质', '不适用'],
             ['Luggage too heavy or bulky', 'Too expensive', 'Not enough product information', 'Did not know where to buy', 'My payment method was not accepted', 'Unsure about quality', 'Not applicable'],
             ['荷物が重い、またはかさばる', '値段が高い', '商品情報が足りない', 'どこで売っているか分からない', '希望の決済手段が使えない', '品質が信頼しにくい', '該当なし']) },
      { code: 'Q24', type: 'mc',
        t: T('앱에서 미리 주문하고 출국할 때 공항이나 크루즈터미널에서 받을 수 있다면, 로컬상품 구매가 어떻게 달라지겠습니까?',
             '如果可以在App上提前下单，并在离境时于机场或邮轮码头取货，您购买本地特产的情况会有什么变化？',
             'If you could order in an app and pick up at the airport or cruise terminal when you leave, how would your shopping for local products change?',
             'アプリで事前に注文し、出国時に空港やクルーズターミナルで受け取れるとしたら、ローカル商品の購入はどう変わりますか。'),
        o: T(['훨씬 더 많이 살 것이다', '조금 더 살 것이다', '변화 없다', '오히려 덜 살 것이다'],
             ['会多买很多', '会多买一些', '没有变化', '反而会少买'],
             ['I would buy much more', 'I would buy a little more', 'No change', 'I would buy less'],
             ['かなり多く買う', '少し多く買う', '変わらない', 'むしろ減る']) },
      { code: 'Q25', type: 'mc', other: true,
        t: T('상품을 받고 싶은 곳은 어디입니까?', '您希望在哪里取货？', 'Where would you prefer to receive your products?', '商品はどこで受け取りたいですか。'),
        o: T(['제주국제공항 출국장', '제주국제크루즈터미널', '숙소', '판매 매장', '해외 배송'],
             ['济州国际机场出境大厅', '济州国际邮轮码头', '住宿处', '销售门店', '国际配送到家'],
             ['Jeju International Airport departure area', 'Jeju International Cruise Terminal', 'My hotel', 'The shop', 'International shipping to my home'],
             ['済州国際空港の出国エリア', '済州国際クルーズターミナル', '宿泊先', '販売店舗', '海外配送']) },
      { code: 'Q26', type: 'mc',
        t: T('공항이나 항만 수령 서비스에 주문 1건당 낼 수 있는 수수료는 얼마입니까?', '机场或港口取货服务，每笔订单您最多愿意支付多少服务费？', 'How much would you pay per order for airport or port pickup?', '空港や港での受け取りサービスに、注文1件あたりいくらまで払えますか。'),
        o: T(['무료일 때만 이용', '2,000원까지', '5,000원까지', '10,000원까지', '10,000원이 넘어도 이용'],
             ['仅在免费时使用', '最多2,000韩元', '最多5,000韩元', '最多10,000韩元', '超过10,000韩元也愿意'],
             ['Only if it is free', 'Up to 2,000 KRW', 'Up to 5,000 KRW', 'Up to 10,000 KRW', 'More than 10,000 KRW is fine'],
             ['無料の場合のみ', '2,000ウォンまで', '5,000ウォンまで', '10,000ウォンまで', '10,000ウォンを超えても利用する']) },
      { code: 'Q27', type: 'cb', other: true,
        t: T('여행 중 주로 쓰는 결제수단을 모두 골라 주세요.', '旅行中您主要使用哪些支付方式？（可多选）', 'Which payment methods do you mainly use while traveling? Choose all that apply.', '旅行中に主に使う決済手段をすべて選んでください。'),
        o: T(['알리페이', '위챗페이', '해외 신용카드', '애플페이나 구글페이', '현금', '한국 체크카드나 교통카드'],
             ['支付宝', '微信支付', '境外信用卡', 'Apple Pay或Google Pay', '现金', '韩国借记卡或交通卡'],
             ['Alipay', 'WeChat Pay', 'Foreign credit card', 'Apple Pay or Google Pay', 'Cash', 'Korean debit or transit card'],
             ['Alipay', 'WeChat Pay', '海外クレジットカード', 'Apple PayまたはGoogle Pay', '現金', '韓国のデビットカードや交通カード']) }
    ]
  },
  {
    title: T('7. 마무리', '7. 最后', '7. Final questions', '7. 最後に'),
    items: [
      { code: 'Q28', type: 'para', req: false,
        t: T('제주 여행 중 가장 불편했던 점은 무엇입니까?', '在济州旅行中，您觉得最不方便的是什么？', 'What was the most inconvenient thing during your trip in Jeju?', '済州旅行中に最も不便だったことは何ですか。') },
      { code: 'Q29', type: 'para', req: false,
        t: T('여행 앱에 꼭 있었으면 하는 기능이 있다면 적어 주세요.', '您希望旅行App一定要有哪些功能？', 'What feature would you most like a travel app to have?', '旅行アプリにぜひあってほしい機能があれば教えてください。') }
    ]
  }
];

/* ------------------------------------------------------------------ */
/* 입점사 설문 (한국어)                                                  */
/* ------------------------------------------------------------------ */

var M_INTRO = '안녕하세요. 이 설문은 제주 소상공인이 외국인 관광객을 맞이하고 상품을 판매할 때 겪는 어려움을 알아보고, 그 결과를 제주여라 플랫폼의 사업자 관리 기능에 반영하기 위한 조사입니다. 응답에는 약 10분이 걸립니다. 응답 내용은 통계 목적으로만 쓰이며 업체명은 외부에 공개하지 않습니다.';

var DIFFICULTY_ROWS = ['언어 응대', '메뉴와 상품 설명', '해외 결제(알리페이, 위챗페이 등)', '예약과 노쇼', '해외 리뷰 관리', '해외 SNS 홍보'];

function K(text) { return { ko: text }; }
function KO(arr) { return { ko: arr }; }

var MERCHANT_SECTIONS = [
  {
    title: K('1. 업체 정보'),
    items: [
      { code: 'M1', type: 'text', req: true, t: K('업체명을 적어 주세요.') },
      { code: 'M2', type: 'mc', other: true, t: K('업종을 골라 주세요.'),
        o: KO(['음식점', '카페와 디저트', '화장품', '특산품(감귤, 차, 가공식품 등)', '기념품과 소품', '체험 업체', '주류와 심야 식음']) },
      { code: 'M3', type: 'mc', t: K('매장은 어디에 있습니까?'),
        o: KO(['제주시 동 지역(구도심, 연동, 노형 등)', '제주시 읍면 지역', '서귀포시 동 지역', '서귀포시 읍면 지역']) },
      { code: 'M4', type: 'mc', t: K('운영한 지 얼마나 되었습니까?'),
        o: KO(['1년 미만', '1년 이상 3년 미만', '3년 이상 5년 미만', '5년 이상']) },
      { code: 'M5', type: 'mc', t: K('대표를 포함한 종사자는 몇 명입니까?'),
        o: KO(['1명', '2명에서 4명', '5명에서 9명', '10명 이상']) },
      { code: 'M6', type: 'mc', other: true, t: K('응답하시는 분의 직위를 골라 주세요.'),
        o: KO(['대표', '관리자급 직원', '직원']) }
    ]
  },
  {
    title: K('2. 외국인 손님'),
    items: [
      { code: 'M7', type: 'mc', t: K('전체 손님 중 외국인 손님은 어느 정도입니까?'),
        o: KO(['거의 없음', '10% 미만', '10% 이상 30% 미만', '30% 이상 50% 미만', '50% 이상']) },
      { code: 'M8', type: 'cb', other: true, t: K('외국인 손님의 주요 국적을 모두 골라 주세요.'),
        o: KO(['중국 본토', '대만', '홍콩과 마카오', '일본', '동남아시아', '영어권(미국, 영국, 호주 등)', '외국인 손님 없음']) },
      { code: 'M9', type: 'mc', t: K('최근 1년 동안 외국인 손님은 어떻게 변했습니까?'),
        o: KO(['크게 늘었다', '조금 늘었다', '비슷하다', '조금 줄었다', '크게 줄었다']) },
      { code: 'M10', type: 'cb', other: true, t: K('외국인 손님이 매장을 알게 되는 경로를 모두 골라 주세요.'),
        o: KO(['지나가다 방문', '샤오홍슈 등 해외 SNS', '지도 앱(구글, 네이버 등)', '여행사나 가이드', '숙소 추천', '인플루언서나 체험단', '잘 모르겠다']) }
    ]
  },
  {
    title: K('3. 응대와 결제'),
    items: [
      { code: 'M11', type: 'grid', t: K('외국인 손님을 맞이할 때 아래 일이 얼마나 어렵습니까?'),
        rows: KO(DIFFICULTY_ROWS), cols: KO(['1 전혀 어렵지 않음', '2', '3', '4', '5 매우 어려움']) },
      { code: 'M12', type: 'mc', t: K('위 항목 중 가장 어려운 하나를 골라 주세요.'), o: KO(DIFFICULTY_ROWS) },
      { code: 'M13', type: 'cb', other: true, t: K('현재 받는 결제수단을 모두 골라 주세요.'),
        o: KO(['알리페이', '위챗페이', '해외 신용카드', '애플페이', '국내 카드와 간편결제', '현금']) },
      { code: 'M14', type: 'cb', t: K('메뉴판이나 상품 설명을 제공하는 외국어를 모두 골라 주세요.'),
        o: KO(['영어', '중국어 간체', '중국어 번체', '일본어', '제공하지 않음']) }
    ]
  },
  {
    title: K('4. 상품과 판매 관리'),
    items: [
      { code: 'M15', type: 'mc', t: K('관광객에게 판매할 수 있는 상품은 몇 개입니까?'),
        o: KO(['없음(서비스 업종)', '5개 미만', '5개 이상 20개 미만', '20개 이상']) },
      { code: 'M16', type: 'mc', other: true, t: K('상품과 재고는 주로 어떻게 관리합니까?'),
        o: KO(['수기 장부', '엑셀', 'POS 프로그램', '온라인 쇼핑몰 관리자 화면', '따로 관리하지 않음']) },
      { code: 'M17', type: 'cb', other: true, t: K('현재 이용하는 온라인 판매 채널을 모두 골라 주세요.'),
        o: KO(['네이버 스마트스토어', '자사몰', '쿠팡 등 오픈마켓', '카카오톡 채널 주문', '해외 플랫폼', '온라인 판매 안 함']) }
    ]
  },
  {
    title: K('5. 공항, 항만 픽업 주문'),
    desc: K('제주여라에서 관광객이 미리 주문하면, 업체가 상품을 준비하고 관광객은 출국할 때 제주공항이나 크루즈터미널에서 상품을 받는 방식입니다.'),
    items: [
      { code: 'M18', type: 'scale', t: K('이 방식으로 주문을 받아 볼 의향이 있습니까?'),
        lo: K('전혀 없음'), hi: K('매우 있음') },
      { code: 'M19', type: 'cb', other: true, t: K('이 방식에서 걱정되는 점을 모두 골라 주세요.'),
        o: KO(['재고를 맞추기 어렵다', '포장 준비가 번거롭다', '공항까지 운반하는 비용과 시간', '관광객이 상품을 받지 않을 경우', '환불과 취소 처리', '플랫폼 수수료', '특별히 없다']) },
      { code: 'M20', type: 'mc', t: K('판매가 기준으로 감당할 수 있는 플랫폼 수수료는 어느 정도입니까?'),
        o: KO(['수수료가 없어야 한다', '5% 미만', '5% 이상 10% 미만', '10% 이상 15% 미만', '15% 이상도 가능']) },
      { code: 'M21', type: 'mc', t: K('주문을 받고 출고 준비에 필요한 시간은 어느 정도입니까?'),
        o: KO(['당일 준비 가능', '하루 전 주문 필요', '이틀 이상 전 주문 필요']) }
    ]
  },
  {
    title: K('6. 사업자 관리 기능'),
    items: [
      { code: 'M22', type: 'cb', max: 3, t: K('사업자 관리 화면에 가장 필요한 기능을 최대 3개까지 골라 주세요.'),
        o: KO(['상품 등록과 수정', '재고 관리', '주문 알림', '픽업 상태 관리', '상품 정보 자동 번역', '해외 리뷰 관리', '매출과 방문 통계', '예약 관리', '쿠폰과 프로모션']) },
      { code: 'M23', type: 'mc', t: K('관리 화면은 주로 어떤 기기로 쓰고 싶습니까?'),
        o: KO(['스마트폰', 'PC', '태블릿']) },
      { code: 'M24', type: 'scale', t: K('앱이나 관리 프로그램 같은 디지털 도구를 쓰는 것이 얼마나 익숙합니까?'),
        lo: K('매우 어렵다'), hi: K('매우 익숙하다') },
      { code: 'M25', type: 'mc', t: K('이런 관리 기능에 낼 수 있는 월 이용료는 어느 정도입니까?'),
        o: KO(['무료여야 이용', '월 1만원 미만', '월 1만원 이상 3만원 미만', '월 3만원 이상 5만원 미만', '월 5만원 이상']) }
    ]
  },
  {
    title: K('7. 마무리'),
    items: [
      { code: 'M26', type: 'para', req: false, t: K('외국인 손님을 맞이하면서 가장 필요하다고 느낀 도움은 무엇입니까?') },
      { code: 'M27', type: 'mc', t: K('개발된 사업자 관리 기능을 직접 써 보는 테스트(약 40분, 사례비 5만원)에 참여할 의향이 있습니까?'),
        o: KO(['예', '아니오']) },
      { code: 'M28', type: 'text', req: false, t: K('연락받을 담당자 이름과 연락처를 적어 주세요. 원하지 않으면 비워 두세요.') }
    ]
  }
];

/* ------------------------------------------------------------------ */
/* 생성 함수                                                            */
/* ------------------------------------------------------------------ */

function createAllForms() {
  var c = createConsumerForm();
  var m = createMerchantForm();
  Logger.log('[소비자 설문] 편집: ' + c.edit);
  Logger.log('[소비자 설문] 응답 링크: ' + c.pub);
  Logger.log('[소비자 설문] 응답 시트: ' + c.sheet);
  Logger.log('[입점사 설문] 편집: ' + m.edit);
  Logger.log('[입점사 설문] 응답 링크: ' + m.pub);
  Logger.log('[입점사 설문] 응답 시트: ' + m.sheet);
}

function newForm_(title, desc) {
  var form = FormApp.create(title);
  form.setDescription(desc)
      .setProgressBar(true)
      .setCollectEmail(false)
      .setAllowResponseEdits(false)
      .setShowLinkToRespondAgain(false);
  var ss = SpreadsheetApp.create(title + ' 응답');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  return { form: form, ss: ss };
}

function result_(o) {
  return { edit: o.form.getEditUrl(), pub: o.form.getPublishedUrl(), sheet: o.ss.getUrl() };
}

function addItem_(form, q, lang) {
  var title = q.code + '. ' + q.t[lang];
  var item;
  switch (q.type) {
    case 'mc':
      item = form.addMultipleChoiceItem().setTitle(title).setChoiceValues(q.o[lang]);
      if (q.other) item.showOtherOption(true);
      break;
    case 'cb':
      item = form.addCheckboxItem().setTitle(title).setChoiceValues(q.o[lang]);
      if (q.other) item.showOtherOption(true);
      if (q.max) item.setValidation(FormApp.createCheckboxValidation().requireSelectAtMost(q.max).build());
      break;
    case 'list':
      item = form.addListItem().setTitle(title).setChoiceValues(q.o[lang]);
      break;
    case 'grid':
      item = form.addGridItem().setTitle(title).setRows(q.rows[lang]).setColumns(q.cols[lang]);
      break;
    case 'scale':
      item = form.addScaleItem().setTitle(title).setBounds(1, 5).setLabels(q.lo[lang], q.hi[lang]);
      break;
    case 'text':
      item = form.addTextItem().setTitle(title);
      break;
    case 'para':
      item = form.addParagraphTextItem().setTitle(title);
      break;
  }
  // 객관식, 체크박스, 그리드, 척도는 필수. 주관식은 req 값을 따른다.
  var required = (q.type === 'text' || q.type === 'para') ? q.req === true : q.req !== false;
  item.setRequired(required);
  return item;
}

function createConsumerForm() {
  var o = newForm_(C_TITLE, C_DESC);
  buildConsumer_(o.form);
  return result_(o);
}

// 소비자 설문을 4개 언어로 채운다. 폼은 비어 있어야 한다.
function buildConsumer_(form) {
  form.setTitle(C_TITLE)
      .setDescription(C_DESC)
      .setConfirmationMessage(C_CONFIRM)
      .setProgressBar(false);

  var langQ = form.addMultipleChoiceItem().setTitle(C_LANG_Q).setRequired(true);

  var starts = {};
  LANGS.forEach(function (lang, i) {
    var start = form.addPageBreakItem().setTitle(C_INTRO_TITLE[lang]).setHelpText(C_INTRO[lang]);
    // 앞 언어의 마지막 섹션을 마치면 다음 언어로 넘어가지 않고 제출되게 한다.
    if (i > 0) start.setGoToPage(FormApp.PageNavigationType.SUBMIT);
    starts[lang] = start;

    var consent = form.addMultipleChoiceItem()
        .setTitle(C_PRIVACY_TITLE[lang])
        .setHelpText(C_PRIVACY_HELP[lang])
        .setRequired(true);

    var firstSection = null;
    CONSUMER_SECTIONS.forEach(function (sec) {
      var pb = form.addPageBreakItem().setTitle(sec.title[lang]);
      if (sec.desc) pb.setHelpText(sec.desc[lang]);
      if (!firstSection) firstSection = pb;
      sec.items.forEach(function (q) { addItem_(form, q, lang); });
    });

    consent.setChoices([
      consent.createChoice(C_CONSENT_YES[lang], firstSection),
      consent.createChoice(C_CONSENT_NO[lang], FormApp.PageNavigationType.SUBMIT)
    ]);
  });

  langQ.setChoices(LANGS.map(function (lang) {
    return langQ.createChoice(LANG_NAME[lang], starts[lang]);
  }));
}

// 기존 소비자 설문의 응답 링크는 그대로 두고 문항을 다시 만든다.
// 응답 시트는 같은 파일에 새 탭으로 다시 연결해 이전 문항의 열과 섞이지 않게 한다.
function rebuildConsumerForm() {
  var form = FormApp.openById(CONSUMER_FORM_ID);
  if (form.getResponses().length > 0) {
    throw new Error('이미 응답이 있어 문항을 지우지 않았습니다. 응답을 먼저 확인하세요.');
  }
  var sheetId = form.getDestinationId();
  form.getItems().forEach(function (item) { form.deleteItem(item); });
  buildConsumer_(form);

  form.removeDestination();
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheetId);

  Logger.log('[소비자 설문] 문항 수: ' + form.getItems().length);
  Logger.log('[소비자 설문] 응답 링크: ' + form.getPublishedUrl());
  Logger.log('[소비자 설문] 응답 시트: ' + SpreadsheetApp.openById(sheetId).getUrl());
}

function createMerchantForm() {
  var o = newForm_('제주여라 입점사(소상공인) 설문', M_INTRO);
  var form = o.form;
  form.setConfirmationMessage('응답해 주셔서 감사합니다. 결과는 제주여라 사업자 관리 기능 개발에 반영됩니다.');

  var consent = form.addMultipleChoiceItem()
      .setTitle(PRIVACY_TITLE)
      .setHelpText(M_PRIVACY_HELP)
      .setRequired(true);

  var firstSection = null;
  MERCHANT_SECTIONS.forEach(function (sec) {
    var pb = form.addPageBreakItem().setTitle(sec.title.ko);
    if (sec.desc) pb.setHelpText(sec.desc.ko);
    if (!firstSection) firstSection = pb;
    sec.items.forEach(function (q) { addItem_(form, q, 'ko'); });
  });

  consent.setChoices([
    consent.createChoice('동의합니다', firstSection),
    consent.createChoice('동의하지 않습니다', FormApp.PageNavigationType.SUBMIT)
  ]);

  return result_(o);
}

// 기존 소비자 설문에서 마지막 연락처 관련 문항(Q30, Q31, Q32)을 모든 언어에서 지우고,
// 안내문과 개인정보 동의 설명을 이 파일의 내용으로 바꾼다. 응답 링크와 시트는 그대로 둔다.
function trimConsumerEnding() {
  var form = FormApp.openById(CONSUMER_FORM_ID);
  var removed = 0;
  form.getItems().forEach(function (item) {
    var title = item.getTitle();
    if (/^Q3[0-2]\./.test(title)) { form.deleteItem(item); removed++; return; }
    LANGS.forEach(function (lang) {
      if (title === C_INTRO_TITLE[lang] && item.getType() === FormApp.ItemType.PAGE_BREAK) {
        item.asPageBreakItem().setHelpText(C_INTRO[lang]);
      }
      if (title === C_PRIVACY_TITLE[lang]) item.setHelpText(C_PRIVACY_HELP[lang]);
    });
  });
  Logger.log('[소비자 설문] 지운 문항 수: ' + removed + ', 남은 문항 수: ' + form.getItems().length);
}

/* ------------------------------------------------------------------ */
/* 한 페이지 버전 ("다음" 버튼 없이 한 화면에서 끝까지 답한다)              */
/* ------------------------------------------------------------------ */

var C_FORM_TITLE = T('제주 여행 설문', '济州旅行问卷', 'Jeju Travel Survey', '済州旅行アンケート');
var C_CONFIRM_LANG = T(
  '감사합니다. 응답이 제출되었습니다.',
  '感谢您的参与，问卷已提交。',
  'Thank you. Your response has been submitted.',
  'ご協力ありがとうございました。回答が送信されました。'
);
var C_CLOSED = '이 설문은 언어별 설문으로 바뀌었습니다. 안내받은 새 링크를 이용해 주세요. | This survey has moved. Please use the new link you were given. | 本问卷已更换，请使用新的链接。 | このアンケートは移動しました。新しいリンクをご利用ください。';

// 한 페이지에서는 답에 따라 이동할 수 없으므로, 동의는 체크해야만 제출되는 필수 체크박스로 받는다.
function addConsentCheckbox_(form, title, help, agree) {
  return form.addCheckboxItem().setTitle(title).setHelpText(help).setChoiceValues([agree]).setRequired(true);
}

function buildConsumerOnePage_(form, lang) {
  form.setTitle(C_FORM_TITLE[lang])
      .setDescription(C_INTRO[lang])
      .setConfirmationMessage(C_CONFIRM_LANG[lang])
      .setProgressBar(false)
      .setCollectEmail(false)
      .setAllowResponseEdits(false)
      .setShowLinkToRespondAgain(false);
  addConsentCheckbox_(form, C_PRIVACY_TITLE[lang], C_PRIVACY_HELP[lang], C_CONSENT_YES[lang]);
  CONSUMER_SECTIONS.forEach(function (sec) {
    var header = form.addSectionHeaderItem().setTitle(sec.title[lang]);
    if (sec.desc) header.setHelpText(sec.desc[lang]);
    sec.items.forEach(function (q) { addItem_(form, q, lang); });
  });
}

// 소비자 설문을 언어별 한 페이지 폼 4개로 만든다. 응답은 시트 하나에 언어별 탭으로 모인다.
// 기존 4개 언어 통합 폼은 응답을 받지 않도록 닫는다(지우지는 않는다).
function createConsumerOnePageForms() {
  var ss = SpreadsheetApp.create('제주 여행 설문 응답 (언어별)');
  LANGS.forEach(function (lang) {
    var form = FormApp.create('제주 여행 설문 (' + LANG_NAME[lang] + ')');
    buildConsumerOnePage_(form, lang);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    Logger.log('[소비자 ' + lang + '] 응답 링크: ' + form.getPublishedUrl());
    Logger.log('[소비자 ' + lang + '] 편집: ' + form.getEditUrl());
  });
  Logger.log('[소비자] 응답 시트: ' + ss.getUrl());
  closeOldConsumerForm();
}

// 기존 4개 언어 통합 폼이 더 이상 응답을 받지 않게 닫는다. 안내 문구 설정이 거부되면 닫기만 한다.
function closeOldConsumerForm() {
  var old = FormApp.openById(CONSUMER_FORM_ID);
  old.setAcceptingResponses(false);
  try {
    old.setCustomClosedFormMessage(C_CLOSED);
  } catch (e) {
    Logger.log('[기존 통합 폼] 안내 문구는 설정하지 못했습니다: ' + e.message);
  }
  Logger.log('[기존 통합 폼] 응답 받기: ' + old.isAcceptingResponses());
}


// 입점사 설문을 같은 링크에서 한 페이지로 바꾼다. 문항과 응답은 그대로 두고,
// 페이지 나눔을 섹션 제목으로 바꾸고 동의 문항을 필수 체크박스로 바꾼다.
function convertMerchantToOnePage() {
  var form = FormApp.openById(MERCHANT_FORM_ID);

  // 다시 실행해도 안전하도록 제목으로 동의 문항을 찾는다.
  // 객관식 동의 문항은 보기가 페이지 나눔으로 이동하므로 먼저 지운다.
  form.getItems(FormApp.ItemType.MULTIPLE_CHOICE).forEach(function (item) {
    if (item.getTitle() === PRIVACY_TITLE) form.deleteItem(item);
  });
  var consent = form.getItems(FormApp.ItemType.CHECKBOX).filter(function (item) {
    return item.getTitle() === PRIVACY_TITLE;
  })[0];
  if (!consent) consent = addConsentCheckbox_(form, PRIVACY_TITLE, M_PRIVACY_HELP, '동의합니다');
  form.moveItem(consent.getIndex(), 0);

  var items = form.getItems();
  for (var i = items.length - 1; i >= 0; i--) {
    if (items[i].getType() !== FormApp.ItemType.PAGE_BREAK) continue;
    var pb = items[i].asPageBreakItem();
    var title = pb.getTitle(), help = pb.getHelpText(), idx = pb.getIndex();
    form.deleteItem(idx);
    var header = form.addSectionHeaderItem().setTitle(title).setHelpText(help);
    form.moveItem(header.getIndex(), idx);
  }
  form.setProgressBar(false);
  Logger.log('[입점사] 페이지 나눔 수: ' + form.getItems(FormApp.ItemType.PAGE_BREAK).length + ', 문항 수: ' + form.getItems().length);
}

// 입점사 설문의 안내문을 M_INTRO 내용으로 바꾼다.
function updateMerchantIntro() {
  var form = FormApp.openById(MERCHANT_FORM_ID);
  form.setDescription(M_INTRO);
  Logger.log('[입점사 설문] 안내문: ' + form.getDescription());
}
