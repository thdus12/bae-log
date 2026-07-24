import { CONFIG } from "site.config"
import { FiMessageCircle } from "react-icons/fi"
import { SectionIcon } from "src/components/SectionIcon"
import React from "react"
import {
  AiOutlineInstagram,
  AiOutlineGithub,
  AiOutlineMail,
  AiFillLinkedin,
} from "react-icons/ai"
import styled from "@emotion/styled"
import { plumOf } from "src/styles/plum"

const ContactCard: React.FC = () => {
  return (
    <>
      <StyledTitle>
        <SectionIcon><FiMessageCircle /></SectionIcon> Contact
      </StyledTitle>
      <StyledWrapper>
        {CONFIG.profile.github && (
          <a
            href={`https://github.com/${CONFIG.profile.github}`}
            rel="noreferrer"
            target="_blank"
          >
            <AiOutlineGithub className="icon" />
            <div className="name">github</div>
            <span className="handle">{CONFIG.profile.github}</span>
          </a>
        )}
        {CONFIG.profile.email && (
          <a
            href={`mailto:${CONFIG.profile.email}`}
            rel="noreferrer"
            target="_blank"
            css={{ overflow: "hidden" }}
          >
            <AiOutlineMail className="icon" />
            <div className="name">email</div>
            <span className="handle">{CONFIG.profile.email}</span>
          </a>
        )}
        {CONFIG.profile.linkedin && (
          <a
            href={`https://www.linkedin.com/in/${CONFIG.profile.linkedin}`}
            rel="noreferrer"
            target="_blank"
          >
            <AiFillLinkedin className="icon" />
            <div className="name">linkedin</div>
            <span className="handle">{CONFIG.profile.linkedin}</span>
          </a>
        )}
      </StyledWrapper>
    </>
  )
}

export default ContactCard

const StyledTitle = styled.div`
  padding: 0.25rem;
  margin-bottom: 0.75rem;
`
const StyledWrapper = styled.div`
  display: flex;
  padding: 0.25rem;
  flex-direction: column;
  border-radius: 1rem;
  background-color: ${({ theme }) => plumOf(theme.scheme).card};
  border: 1px solid ${({ theme }) => plumOf(theme.scheme).line};
  a {
    position: relative;
    display: flex;
    padding: 0.75rem;
    gap: 0.75rem;
    align-items: center;
    border-radius: 1rem;
    color: ${({ theme }) => theme.colors.gray11};
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;

    /* hover 시 화살표 왼쪽에 실제 계정이 스르륵 (flex 흐름이라 라벨과 안 겹침) */
    .handle {
      margin-left: auto;
      padding-right: 1.4rem; /* 화살표 자리 */
      font-size: 0.75rem;
      color: ${({ theme }) => plumOf(theme.scheme).accent};
      opacity: 0;
      transform: translateX(6px);
      transition: opacity 0.2s ease,
        transform 0.25s cubic-bezier(0.2, 0.7, 0.2, 1);
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      pointer-events: none;
    }
    :hover .handle {
      opacity: 1;
      transform: translateX(0);
    }

    /* hover 시 우측에 스르륵 나타나는 외부 링크 화살표 */
    ::after {
      content: "↗";
      position: absolute;
      right: 0.9rem;
      font-size: 0.875rem;
      font-weight: 700;
      color: ${({ theme }) => plumOf(theme.scheme).accent};
      opacity: 0;
      transform: translate(-6px, 4px);
      transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.2, 0.7, 0.2, 1);
    }

    :hover {
      color: ${({ theme }) => plumOf(theme.scheme).accentDeep};
      background-color: ${({ theme }) => plumOf(theme.scheme).tint};

      ::after {
        opacity: 1;
        transform: translate(0, 0);
      }
      .icon {
        transform: translateY(-2px);
      }
    }
    .icon {
      font-size: 1.5rem;
      line-height: 2rem;
      transition: transform 0.3s cubic-bezier(0.3, 1.6, 0.4, 1);
    }
    .name {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    @media (prefers-reduced-motion: reduce) {
      ::after,
      .icon {
        transition: none;
      }
    }
  }
`
