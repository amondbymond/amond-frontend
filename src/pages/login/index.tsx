import LoginPage from "@/component/pageComponent/login";
import Head from "next/head";
import { withBasePath } from "@/utils/paths";
export default function Login() {
  return (
    <>
      <Head>
        <title>로그인 | amond</title>
        <meta
          name="description"
          content="로그인 후 주제별 트렌드에 딱 맞는 터지는 콘텐츠 기획을 쉽고 간편하게 시작해보세요!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={withBasePath("/favicon.ico")} />
      </Head>
      <main>
        <LoginPage />
      </main>
    </>
  );
}
