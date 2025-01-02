import { getCodeBlockColor } from 'src/libs/utils/notion/getPageProperties'
import { CodeBlockContent } from 'src/libs/utils/notion/types'

interface CodeBlockProps {
  block: CodeBlockContent
}

const CodeBlock: React.FC<CodeBlockProps> = ({ block }) => {
  const { code, language, colorFormat } = block
  const colorClass = getCodeBlockColor(colorFormat)

  return (
    <div className="my-4">
      <pre className={`language-${language} p-4 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-x-auto`}>
        <code className={`${colorClass} language-${language} font-mono text-sm`}>
          {code}
        </code>
      </pre>
    </div>
  )
}

export default CodeBlock