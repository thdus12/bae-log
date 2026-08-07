import { NotionAPI } from "notion-client"

/**
 * 노션 비공식 API 클라이언트 생성기
 *
 * 서버(Vercel)에서 보내는 요청은 브라우저처럼 보이지 않아 노션이 403으로 막는다.
 * (공개 페이지인데도 loadPageChunk가 403 Forbidden으로 떨어진다)
 * 그래서 브라우저와 같은 헤더를 붙여서 요청한다.
 *
 * 그래도 막힌다면 NOTION_TOKEN_V2 환경변수에 노션 로그인 쿠키(token_v2)를 넣어
 * 인증된 요청으로 보낼 수 있다. 값이 없으면 익명 요청 그대로 동작한다.
 */
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  Accept: "*/*",
  Origin: "https://www.notion.so",
  Referer: "https://www.notion.so/",
}

export const createNotionAPI = () =>
  new NotionAPI({
    authToken: process.env.NOTION_TOKEN_V2 || undefined,
    activeUser: process.env.NOTION_ACTIVE_USER || undefined,
    ofetchOptions: {
      headers: BROWSER_HEADERS,
      retry: 2,
      retryDelay: 500,
      timeout: 20000,
    },
  })
