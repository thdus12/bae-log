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
  const [mounted, setMounted] = useState(false)

  // 컴포넌트가 마운트된 후에만 window 객체에 접근
  useEffect(() => {
    setMounted(true)
  }, [])

  const onDocumentElementChange = useCallback(() => {
    setValue((value) => value + 1)
  }, [])

  useEffect(() => {
    if (!mounted) return;  // 마운트 되기 전에는 실행하지 않음

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
  }, [onDocumentElementChange, mounted])

  useEffect(() => {
    if (!mounted) return;  // 마운트 되기 전에는 실행하지 않음

    const adjustIframeHeight = () => {
      const iframe = document.querySelector('#cusdis_thread iframe') as HTMLIFrameElement;
      if (!iframe) return;

      iframe.style.height = '400px';

      const observer = new MutationObserver(() => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            const height = iframeDoc.body.scrollHeight;
            iframe.style.height = `${height + 50}px`;
          }
        } catch (e) {
          console.log('Error adjusting iframe height');
        }
      });

      iframe.addEventListener('load', () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            observer.observe(iframeDoc.body, {
              childList: true,
              subtree: true
            });
          }
        } catch (e) {
          console.log('Error setting up observer');
        }
      });

      return () => observer.disconnect();
    };

    if (typeof window !== 'undefined' && window.CUSDIS) {
      window.CUSDIS.on('onRendered', adjustIframeHeight);
    }

    const interval = setInterval(adjustIframeHeight, 1000);
    return () => clearInterval(interval);
  }, [value, mounted]);

  if (!mounted) return null;  // 마운트되기 전에는 아무것도 렌더링하지 않음

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

export default Cusdis

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
  }

  #cusdis_thread iframe {
    width: 100% !important;
    border: none !important;
    min-height: 700px !important;
    transition: height 0.3s ease;
    padding: 1rem 0;  // 여백 추가
  }
  
  // 댓글 사이 구분선 추가
  .cusdis-comment:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray6};
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
  }
`