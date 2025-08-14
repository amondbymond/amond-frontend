import LoginSuccessPage from "@/component/pageComponent/login/success";
import Head from "next/head";
import { withBasePath } from "@/utils/paths";
export default function LoginSuccess() {
  return (
    <>
      <Head>
        <title>로그인 성공 | amond</title>
        <meta name="description" content="로그인 성공" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={withBasePath("/favicon.ico")} />
      </Head>
      <main>
        <LoginSuccessPage />
      </main>
    </>
  );
}
