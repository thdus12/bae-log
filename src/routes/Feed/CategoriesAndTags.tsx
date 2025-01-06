import { useState } from "react"
import styled from "@emotion/styled"
import TagList from "./TagList"
import CategoryList from "./CategoryList"

const CategoriesAndTags = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories')

  return (
    <div>
      <StyledTabWrapper>
        <StyledTabButton
          active={activeTab === 'categories'}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </StyledTabButton>
        <StyledTabButton
          active={activeTab === 'tags'}
          onClick={() => setActiveTab('tags')}
        >
          Tags
        </StyledTabButton>
      </StyledTabWrapper>
      {activeTab === 'categories' ? <CategoryList /> : <TagList />}
    </div>
  )
}

export default CategoriesAndTags

const StyledTabWrapper = styled.div`
  display: flex;
  gap: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray4};
  margin-bottom: 0.75rem;
`

const StyledTabButton = styled.button<{ active: boolean }>`
  color: ${props => props.active ? props.theme.colors.gray12 : props.theme.colors.gray10};
  font-size: 0.875rem;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.colors.gray12};
  }
`