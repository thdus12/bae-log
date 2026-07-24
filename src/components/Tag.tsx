import styled from "@emotion/styled"
import { useRouter } from "next/router"
import React from "react"
import { plumOf } from "src/styles/plum"

type Props = {
  children: string
}

const Tag: React.FC<Props> = ({ children }) => {
  const router = useRouter()

  const handleClick = (value: string) => {
    router.push(`/?tag=${value}`)
  }

  return <StyledTag onClick={() => handleClick(children)}>{children}</StyledTag>
}

export default Tag

const StyledTag = styled.div`
  background-color: ${({ theme }) => plumOf(theme.scheme).tint};
  color: ${({ theme }) => plumOf(theme.scheme).accentDeep};
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 400;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  :hover {
    background-color: ${({ theme }) => plumOf(theme.scheme).tagOnBg};
    color: ${({ theme }) => plumOf(theme.scheme).tagOnInk};
  }
`
