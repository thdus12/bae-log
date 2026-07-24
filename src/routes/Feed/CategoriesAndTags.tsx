import styled from "@emotion/styled"
import TagList from "./TagList"
import CategoryList from "./CategoryList"

// 탭으로 숨기지 않고 Categories → Tags 순서로 한 번에 노출
const CategoriesAndTags = () => {
  return (
    <div>
      <CategoryList />
      <StyledDivider />
      <TagList />
    </div>
  )
}

export default CategoriesAndTags

const StyledDivider = styled.hr`
  display: none;

  @media (min-width: 1024px) {
    display: block;
    width: 100%;
    border: none;
    border-top: 1px solid ${({ theme }) => theme.colors.gray4};
    margin: 0.25rem 0 1rem;
  }
`
