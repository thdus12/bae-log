import styled from "@emotion/styled"
import React from "react"

type Props = {}

const Footer: React.FC<Props> = () => {
  return (
    <StyledWrapper>
      <a onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        ↑ Top
      </a>
    </StyledWrapper>
  )
}

export default Footer

const StyledWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray10};
  a {
    margin-top: 0.5rem;
    cursor: pointer;

    :hover {
      color: ${({ theme }) => theme.colors.gray12};
    }
  }
`
