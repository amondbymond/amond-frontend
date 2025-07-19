import moment from "moment";
import "moment/locale/ko";
import Hashids from "hashids";
import { ChangeEvent } from "react";

const hashids = new Hashids("amond0", 12); // 최소 길이 6자리

export type UnknownDateType = string | number | Date | undefined;

/* 3자리 수 마다 콤마를 붙이는 함수 **/
export const addComma = (input: string | number) => {
  let newInput = input;

  if (input) {
    newInput = input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return newInput;
};

/** 날짜 형 변환 YYYY.MM.DD */
export const changeDateDot = (date: UnknownDateType) => {
  if (date) {
    return moment(date).format("YYYY.MM.DD");
  }
};

/** 날짜 형 변환 YYYY-MM-DD */
export const changeDateDash = (date: UnknownDateType) => {
  if (date) {
    return moment(date).format("YYYY-MM-DD");
  }
};

/** 날짜 형 변환 M-DD */
export const changeDateMDDKo = (date: UnknownDateType) => {
  if (date) {
    return moment(date).format("M월 DD일");
  }
};

/** 날짜 형 변환 MM-DD */
export const changeDateDashWithoutYear = (date: UnknownDateType) => {
  if (date) {
    return moment(date).format("MM-DD");
  }
};

/** 날짜 형 변환 YYYY.MM.DD(요일) */
export const changeDateDotWithDay = (date: UnknownDateType) => {
  if (date) {
    return moment(date).format("YYYY년 MM월 DD일(dd)");
  } else {
    return date;
  }
};

/** 해쉬 아이디 생성 */
export const createHashId = (id: number) => {
  const hashId = hashids.encode(id);
  return hashId;
};

/** 해쉬 아이디 복호화 */
export const decodeHashId = (hashId: string) => {
  const decodedId = hashids.decode(hashId);
  return decodedId[0];
};

/** 텍스트필드 onChange 일반 */
export const onChangeTextField = (
  e: ChangeEvent<HTMLInputElement>,
  state: any,
  setState: Function,
  isNumber?: boolean
) => {
  const { name, value } = e.target;

  if (isNumber) {
    if (!/^[0-9.]*$/.test(value)) return;
  }

  setState({
    ...state,
    [name]: value,
  });
};
