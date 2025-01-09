import { TPost } from "src/types"
import { CONFIG } from "site.config"
import dynamic from "next/dynamic"
import styled from "@emotion/styled"


const UtterancesComponent = dynamic(
  () => import("./Utterances").then((mod) => {
    return {
      default: mod.default || mod,
    };
  }),
  { ssr: false }
)

const CusdisComponent = dynamic(
  () => import("./Cusdis").then((mod) => {
    return {
      default: mod.default || mod,
    };
  }),
  { ssr: false }
)

type Props = {
  data: TPost
}

const CommentBox: React.FC<Props> = ({ data }) => {
  return (
    <StyledWrapper>
      <Title>Comments</Title>
      {CONFIG.utterances.enable && <UtterancesComponent issueTerm={data.id} />}
      {CONFIG.cusdis.enable && (
        <CusdisComponent id={data.id} slug={data.slug} title={data.title} />
      )}
    </StyledWrapper>
  )
}

export default CommentBox

const StyledWrapper = styled.div`
  margin-top: 3rem;
`

const Title = styled.h3`
  margin-bottom: 2rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray12};
`
