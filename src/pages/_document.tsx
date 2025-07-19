import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* 웹폰트 */}
        <link
          rel="preload"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard-dynamic-subset.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard-dynamic-subset.css"
          media="all"
        />

        {/* 오픈그래프 */}
        <meta property="og:title" content="아몬드" />
        <meta
          property="og:description"
          content="주제별 트렌드에 딱 맞는 터지는 콘텐츠 기획을 쉽고 간편하게 시작해보세요!"
        />
        <meta
          property="og:image"
          content="https://service.mond.io.kr/thumbnail.png"
        />
        <meta property="og:url" content="https://service.mond.io.kr" />
        <meta property="og:type" content="website" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
