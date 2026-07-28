import { NextApiRequest, NextApiResponse } from "next"
import { getPosts } from "../../apis"

// 목록·통계만 갱신(기본): https://<your-site.com>/api/revalidate?secret=<token>
// 특정 경로만 갱신:        https://<your-site.com>/api/revalidate?secret=<token>&path=/some-post
// 모든 글까지 갱신:        https://<your-site.com>/api/revalidate?secret=<token>&all=1
//
// 새 글이 목록에 안 뜨는 걸 푸는 데는 기본 모드(목록·통계)면 충분하다.
// 글 상세는 [slug]가 fallback: "blocking"이라 새 slug도 요청 즉시 생성되고,
// 기존 글 수정분은 각 페이지의 ISR(revalidateTime)로 따라잡는다.
const LIST_PATHS = ["/", "/stats"]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { secret, path, all } = req.query
  if (!process.env.TOKEN_FOR_REVALIDATE) {
    return res.status(500).json({ message: "TOKEN_FOR_REVALIDATE is not set" })
  }
  if (secret !== process.env.TOKEN_FOR_REVALIDATE) {
    return res.status(401).json({ message: "Invalid token" })
  }

  const paths =
    path && typeof path === "string"
      ? [path]
      : all
      ? [
          ...LIST_PATHS,
          ...(await getPosts())
            .map((post) => post.slug)
            .filter(Boolean)
            .map((slug) => `/${slug}`),
        ]
      : LIST_PATHS

  // 한 번에 여러 개를 동시에 재생성하면 서버가 자기 자신에게 보내는 요청이
  // 몰려 실패하므로 순차적으로 처리한다.
  const failed: { path: string; reason: string }[] = []
  for (const p of Array.from(new Set(paths))) {
    try {
      await res.revalidate(p)
    } catch (err) {
      failed.push({
        path: p,
        reason: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const total = new Set(paths).size
  return res.status(failed.length === total && total > 0 ? 500 : 200).json({
    revalidated: total - failed.length,
    total,
    ...(failed.length ? { failed } : {}),
  })
}
