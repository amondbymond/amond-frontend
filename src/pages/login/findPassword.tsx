import FindPasswordPage from "@/component/pageComponent/login/findPassword";
import Head from "next/head";
import { withBasePath } from "@/utils/paths";
export default function FindPassword() {
  return (
    <>
      <Head>
        <title>비밀번호 찾기 | amond</title>
        <meta
          name="description"
          content="비밀번호를 잊으셨나요? 이메일을 입력하시면 비밀번호 찾기 이메일을 발송해드립니다."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={withBasePath("/favicon.ico")} />
      </Head>
      <main>
        <FindPasswordPage />
      </main>
    </>
  );
}
