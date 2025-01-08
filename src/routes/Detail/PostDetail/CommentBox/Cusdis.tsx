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
    // iframe 높이 조절 함수
    const adjustIframeHeight = () => {
      const iframe = document.querySelector('#cusdis_thread iframe') as HTMLIFrameElement;
      if (!iframe) return;

      // 초기 높이 설정
      iframe.style.height = '700px';

      // MutationObserver로 iframe 내부 변화 감지
      const observer = new MutationObserver(() => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            const height = iframeDoc.body.scrollHeight;
            iframe.style.height = `${height + 50}px`; // 여유 공간 추가
          }
        } catch (e) {
          console.log('Error adjusting iframe height');
        }
      });

      // iframe이 로드된 후 observer 설정
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

    // Cusdis가 렌더링된 후 높이 조절 시작
    if (window.CUSDIS) {
      window.CUSDIS.on('onRendered', adjustIframeHeight);
    }

    // 일정 간격으로 높이 체크 (fallback)
    const interval = setInterval(adjustIframeHeight, 1000);
    return () => clearInterval(interval);
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
  }
`