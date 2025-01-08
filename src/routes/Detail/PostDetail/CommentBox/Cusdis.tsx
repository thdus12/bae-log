import { CONFIG } from "site.config"
import { ReactCusdis } from "react-cusdis"
import { useCallback, useEffect, useState } from "react"
import styled from "@emotion/styled"
import useScheme from "src/hooks/useScheme"

type Props = {
  id: string
  slug: string
  title: string
}

const Cusdis: React.FC<Props> = ({ id, slug, title }) => {
  const [value, setValue] = useState(0)
  const [scheme] = useScheme()

  const onDocumentElementChange = useCallback(() => {
    setValue((value) => value + 1)
  }, [])

  useEffect(() => {
    const changesObserver = new MutationObserver(
      (mutations: MutationRecord[]) => {
        mutations.forEach((mutation: MutationRecord) => {
          onDocumentElementChange()
        })
      }
    )

    changesObserver.observe(document.documentElement, {
      attributeFilter: ["class"],
    })

    return () => {
      changesObserver.disconnect()
    }
  }, [onDocumentElementChange])

  // 댓글 높이 동적 조절을 위한 useEffect 추가
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      const iframe = document.querySelector('#cusdis_thread iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        try {
          const height = iframe.contentWindow.document.body.scrollHeight;
          iframe.style.height = `${height}px`;
        } catch (e) {
          // cross-origin 이슈 처리
        }
      }
    });

    const thread = document.querySelector('#cusdis_thread');
    if (thread) {
      resizeObserver.observe(thread);
    }

    // Cusdis 로드 완료 이벤트 처리
    if (window.CUSDIS) {
      window.CUSDIS.on('onRendered', () => {
        const iframe = document.querySelector('#cusdis_thread iframe');
        if (iframe) {
          resizeObserver.observe(iframe);
        }
      });
    }

    return () => resizeObserver.disconnect();
  }, [value]);

  return (
    <StyledWrapper id="comments">
      <ReactCusdis
        key={value}
        attrs={{
          host: CONFIG.cusdis.config.host,
          appId: CONFIG.cusdis.config.appid,
          pageId: slug,
          pageTitle: title,
          pageUrl: `${CONFIG.link}/${slug}`,
          theme: scheme,
        }}
      />
    </StyledWrapper>
  )
}

// window 타입 확장
declare global {
  interface Window {
    CUSDIS?: {
      on: (event: string, callback: () => void) => void
    }
  }
}

const StyledWrapper = styled.div`
  margin-top: 2.5rem;

  #cusdis_thread {
    width: 100%;
    min-height: 150px;
  }

  #cusdis_thread iframe {
    width: 100% !important;
    border: none !important;
    transition: height 0.2s ease;
  }
`