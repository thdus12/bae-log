import { CONFIG } from "site.config"
import { useCallback, useEffect, useState } from "react"
import styled from "@emotion/styled"
import useScheme from "src/hooks/useScheme"

type Props = {
  id: string
  slug: string
  title: string
}

interface Comment {
  id: string
  content: string
  by_nickname: string
  created_at: string
}

const Cusdis: React.FC<Props> = ({ id, slug, title }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [scheme] = useScheme()
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");

  // 댓글 목록 가져오기
  const fetchComments = async () => {
    try {
      const response = await fetch(`${CONFIG.cusdis.config.host}/api/open/comments?appId=${CONFIG.cusdis.config.appid}&pageId=${slug}`);
      const data = await response.json();
      setComments(data.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // 댓글 작성하기
  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${CONFIG.cusdis.config.host}/api/open/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: CONFIG.cusdis.config.appid,
          pageId: slug,
          content,
          nickname,
          email: '', // 선택사항
        }),
      });

      // 댓글 작성 후 목록 새로고침
      fetchComments();
      setContent("");
      setNickname("");
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [slug]);

  return (
    <StyledWrapper>
      <h3>Comments</h3>

      {/* 댓글 목록 */}
      <CommentsList>
        {comments.map((comment) => (
          <CommentItem key={comment.id}>
            <CommentHeader>
              <CommentAuthor>{comment.by_nickname}</CommentAuthor>
              <CommentDate>{new Date(comment.created_at).toLocaleDateString()}</CommentDate>
            </CommentHeader>
            <CommentContent>{comment.content}</CommentContent>
          </CommentItem>
        ))}
      </CommentsList>

      {/* 댓글 작성 폼 */}
      <CommentForm onSubmit={submitComment}>
        <input
          type="text"
          placeholder="Your name"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </CommentForm>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  margin-top: 2.5rem;

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 2rem;
  }
`

const CommentsList = styled.div`
  margin-bottom: 2rem;
`

const CommentItem = styled.div`
  padding: 1.5rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray6};

  &:last-child {
    border-bottom: none;
  }
`

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 1rem;
`

const CommentAuthor = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray12};
`

const CommentDate = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.gray11};
`

const CommentContent = styled.div`
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.gray12};
`

const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  input, textarea {
    padding: 0.75rem;
    border: 1px solid ${({ theme }) => theme.colors.gray6};
    border-radius: 0.5rem;
    background: ${({ theme }) => theme.scheme === "light" ? "white" : "rgb(63 63 70)"};
    color: ${({ theme }) => theme.colors.gray12};
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }

  button {
    padding: 0.75rem;
    background: ${({ theme }) => theme.colors.gray12};
    color: ${({ theme }) => theme.scheme === "light" ? "white" : "black"};
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;

    &:hover {
      opacity: 0.9;
    }
  }
`

export default Cusdis