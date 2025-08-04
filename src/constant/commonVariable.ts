/** api 통신 주소 */
export const url =
  process.env.NEXT_PUBLIC_APP_ENV === "dev"
    ? "http://localhost:9988"
    : process.env.NEXT_PUBLIC_API_URL || "https://api.mond.io.kr";
export const isDev = process.env.NEXT_PUBLIC_APP_ENV === "dev" ? true : false;

export const s3ImageUrl = "https://amond-image.s3.ap-northeast-2.amazonaws.com";

/** 정규식 */
export const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\W_]{8,16}$/;
export const phoneRegex = /^[0-9-]*$/;

/** 아이템 수 */
export const itemNumber = {
  adminUser: 20,
  adminPrompt: 20,
  adminContent: 20,
};

/** 이미지 비율 */
export const imageRatio = { example: "1/1" };

/** SNS 운영 목적 */
export const reasonList = [
  "매출 증진",
  "신규 고객 확보",
  "신제품 홍보",
  "브랜드 홍보",
  "팔로워 증가",
  "기타",
];

/** 사업 카테고리 */
export const categoryList = [
  "뷰티/미용",
  "미식/푸드",
  "일상/트렌드",
  "패션",
  "자기개발",
  "지식 콘텐츠",
  "건강/헬스",
  "기타",
];

/** Content generation constants */
export const IMAGES_PER_FEEDSET = 4; // Change to 9 when needed

/** Direction options for content */
export const directionList = ["정보형", "감성전달형", "홍보중심형"];

/** Content types by category */
export const CONTENT_TYPES = {
  '뷰티/미용': [
    '효능 강조', '사용 후기', '신제품 소개', '이벤트', '성분 스토리',
    '사용법 공유', '브랜드 무드', '뷰티 꿀팁', '챌린지', '인플루언서'
  ],
  '미식/푸드': [
    '메뉴 소개', '후기 리그램', '시즌 메뉴', '할인 이벤트', '공간 무드',
    '레시피 공유', '운영 안내', '고객 인증샷', '음식 철학', '비하인드'
  ],
  '일상/트렌드': [
    '일상 공유', '감성 무드', '트렌드 밈', '팔로워 소통', 'Q&A',
    '챌린지', '루틴 공개', '투표 유도', '공감 한줄', '소소한 팁'
  ],
  '패션': [
    '착장 소개', '신상 오픈', '스타일링팁', '할인 공지', '후기 공유',
    '룩북 공개', '브랜드 무드', '소재 강조', '착용샷', '촬영 비하인드'
  ],
  '자기개발': [
    '인사이트', '동기부여', '후기 인증', '강의 소개', '꿀팁 요약',
    '브랜딩 강조', '체크리스트', '컨설팅 홍보', '일상 회고', '성장 스토리'
  ],
  '지식 콘텐츠': [
    '트렌드 요약', '뉴스 큐레이션', '카드뉴스', '인포그래픽', '데이터 요약',
    '개념 정리', '퀴즈', '세미나 홍보', '용어 해설', '브리핑'
  ],
  '건강/헬스': [
    '운동 루틴', '후기 사례', '클래스 안내', '식단 공유', '헬스 꿀팁',
    '자기관리', '감성 인용', '무료 체험', '공간 소개', '전문가 소개'
  ],
  '기타': [
    '서비스/상품 소개', '창업 스토리', '기능 강조', '팔로우 이벤트', '후기 공유',
    '가치 전달', '협업 공개', 'Q&A', '무드컷', '제품 안내'
  ]
} as const;
