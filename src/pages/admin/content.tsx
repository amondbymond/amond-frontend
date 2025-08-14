import AdminContentPage from "@/component/pageComponent/admin/content";
import Head from "next/head";
import { withBasePath } from "@/utils/paths";
export default function AdminContent() {
  return (
    <>
      <Head>
        <title>아몬드</title>
        <meta
          name="description"
          content="주제별 트렌드에 딱 맞는 터지는 콘텐츠 기획을 쉽고 간편하게 시작해보세요!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={withBasePath("/favicon.ico")} />
      </Head>
      <main>
        <AdminContentPage />
      </main>
    </>
  );
}
