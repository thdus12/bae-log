import { TPost } from "src/types"
import { CONFIG } from "site.config"
import dynamic from "next/dynamic"

const UtterancesComponent = dynamic(
  () => import("./Utterances").then((mod) => mod.default),
  { ssr: false }
)
const CusdisComponent = dynamic(
  () => import("./Cusdis").then((mod) => mod.default),
  { ssr: false }
)

type Props = {
  data: TPost
}

const CommentBox: React.FC<Props> = ({ data }) => {
  return (
    <div>
      {CONFIG.utterances.enable && <UtterancesComponent issueTerm={data.id} />}
      {CONFIG.cusdis.enable && (
        <CusdisComponent id={data.id} slug={data.slug} title={data.title} />
      )}
    </div>
  )
}

export default CommentBox