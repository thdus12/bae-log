import { CONFIG } from "site.config"
import { Emoji } from "src/components/Emoji"
import Image from "next/image"
import React from "react"
import styled from "@emotion/styled"
import useScheme from "src/hooks/useScheme"
import { plumOf } from "src/styles/plum"

type Props = {}

const ProfileCard: React.FC<Props> = () => {
  const [scheme] = useScheme()
  const palette = plumOf(scheme)

  return (
    <StyledWrapper>
      <div className="title">
        <Emoji>💻</Emoji> Profile
      </div>
      <div className="content">
        <div className="top">
          {/* 사진 뒤에서 아주 느리게 숨쉬는 소프트포커스 오라 */}
          <svg
            className="aura"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <filter id="profileAura">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.013"
                  numOctaves="2"
                  seed="8"
                  result="t"
                >
                  <animate
                    attributeName="baseFrequency"
                    dur="18s"
                    values="0.010;0.017;0.010"
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="t"
                  scale="28"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
                <feGaussianBlur stdDeviation="9" />
              </filter>
              <radialGradient id="profileAuraGrad" cx="38%" cy="34%">
                <stop offset="0%" stopColor={palette.violet} />
                <stop offset="100%" stopColor={palette.accent} />
              </radialGradient>
            </defs>
            <g filter="url(#profileAura)">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="url(#profileAuraGrad)"
                opacity={scheme === "dark" ? 0.3 : 0.38}
              />
            </g>
          </svg>
          <Image src={CONFIG.profile.image} fill alt="" />
        </div>
        <div className="mid">
          <div className=" name">{CONFIG.profile.name}</div>
          <div className="role">{CONFIG.profile.role}</div>
          <div className="text-sm mb-2">{CONFIG.profile.bio}</div>
        </div>
      </div>
    </StyledWrapper>
  )
}

export default ProfileCard

const StyledWrapper = styled.div`
  > .title {
    padding: 0.25rem;
    margin-bottom: 0.75rem;
  }
  > .content {
    margin-bottom: 2.25rem;
    border-radius: 1rem;
    width: 100%;
    background-color: ${({ theme }) =>
      theme.scheme === "light" ? "white" : "rgb(63 63 70)"};
    @media (min-width: 768px) {
      padding: 1rem;
    }
    @media (min-width: 1024px) {
      padding: 1rem;
    }
    .top {
      position: relative;
      width: 100%;
      &:after {
        content: "";
        display: block;
        padding-bottom: 100%;
      }
      .aura {
        position: absolute;
        inset: -12%;
        width: 124%;
        height: 124%;
        pointer-events: none;
      }
      img {
        border-radius: 0.9rem;
      }
      @media (prefers-reduced-motion: reduce) {
        .aura {
          display: none;
        }
      }
    }
    .mid {
      display: flex;
      padding: 0.5rem;
      flex-direction: column;
      align-items: center;
      .name {
        font-size: 1.25rem;
        line-height: 1.75rem;
        font-style: italic;
        font-weight: 700;
      }
      .role {
        margin-bottom: 1rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        color: ${({ theme }) => theme.colors.gray11};
      }
      .bio {
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
      }
    }
  }
`
