import styled from "@emotion/styled"
import { useRouter } from "next/router"
import React from "react"
import { FiFolder } from "react-icons/fi"
import { SectionIcon } from "src/components/SectionIcon"
import { useCategoriesQuery } from "src/hooks/useCategoriesQuery"
import { plumOf } from "src/styles/plum"

type Props = {}

const CategoryList: React.FC<Props> = () => {
  const router = useRouter()
  const currentCategory = router.query.category || undefined
  const data = useCategoriesQuery()

  const handleClickCategory = (value: any) => {
    // delete
    if (currentCategory === value) {
      router.push({
        query: {
          ...router.query,
          category: undefined,
        },
      })
    }
    // add
    else {
      router.push({
        query: {
          ...router.query,
          category: value,
        },
      })
    }
  }

  return (
    <StyledWrapper>
      <div className="top">
        <SectionIcon><FiFolder /></SectionIcon> Categories
      </div>
      <div className="list">
        {Object.keys(data).map((key) => (
          <a
            key={key}
            data-active={key === currentCategory}
            onClick={() => handleClickCategory(key)}
          >
            <span className="name">{key}</span>
            <span className="count">{data[key]}</span>
          </a>
        ))}
      </div>
    </StyledWrapper>
  )
}

export default CategoryList

const StyledWrapper = styled.div`
  .top {
    display: none;
    padding: 0.25rem;
    margin-bottom: 0.75rem;

    @media (min-width: 1024px) {
      display: block;
    }
  }

  .list {
    display: flex;
    margin-bottom: 1.5rem;
    gap: 0.25rem;
    overflow: scroll;

    scrollbar-width: none;
    -ms-overflow-style: none;
    ::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    @media (min-width: 1024px) {
      display: block;
      margin-bottom: 0.5rem;
    }

    a {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.625rem;
      padding: 0.25rem 0.75rem;
      margin-top: 0.25rem;
      margin-bottom: 0.25rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: ${({ theme }) => theme.colors.gray10};
      flex-shrink: 0;
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.2, 0.7, 0.2, 1),
        background-color 0.15s ease, color 0.15s ease;

      .count {
        font-size: 0.6875rem;
        font-variant-numeric: tabular-nums;
        color: ${({ theme }) => theme.colors.gray9};
        background-color: ${({ theme }) => plumOf(theme.scheme).tint};
        border-radius: 9999px;
        padding: 0.0625rem 0.4375rem;
        transition: background-color 0.15s ease, color 0.15s ease;
      }

      :hover {
        transform: translateX(3px);
        color: ${({ theme }) => plumOf(theme.scheme).accentDeep};
        background-color: ${({ theme }) => plumOf(theme.scheme).tint};

        .count {
          background-color: ${({ theme }) => plumOf(theme.scheme).card};
          color: ${({ theme }) => plumOf(theme.scheme).accent};
        }
      }
      &[data-active="true"] {
        color: ${({ theme }) => plumOf(theme.scheme).accentDeep};
        background-color: ${({ theme }) => plumOf(theme.scheme).tint};
        font-weight: 600;

        .count {
          background-color: ${({ theme }) => plumOf(theme.scheme).tagOnBg};
          color: ${({ theme }) => plumOf(theme.scheme).tagOnInk};
        }
      }

      @media (prefers-reduced-motion: reduce) {
        transition: none;
      }
    }
  }
`
