/** api 통신 주소 */
export const url =
  process.env.NEXT_PUBLIC_APP_ENV === "dev"
    ? "http://localhost:9988"
    : "https://api.mond.io.kr";
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
