import { CONFIG } from "site.config"
import { ReactCusdis } from "react-cusdis"
import { useCallback, useEffect, useState } from "react"
import styled from "@emotion/styled"
import useScheme from "src/hooks/useScheme"

declare global {
  interface Window {
    CUSDIS?: {
      on: (event: string, callback: () => void) => void
    }
  }
}

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

  useEffect(() => {
    const adjustIframeHeight = () => {
      const iframe = document.querySelector('#cusdis_thread iframe') as HTMLIFrameElement
      if (iframe && iframe.contentWindow) {
        try {
          iframe.style.height = 'auto'
          const height = iframe.contentWindow.document.body.scrollHeight
          iframe.style.height = `${height + 20}px`
        } catch (e) {
          console.log('iframe height adjustment failed')
        }
      }
    }

    window.CUSDIS?.on('onRendered', adjustIframeHeight)

    const observer = new MutationObserver(adjustIframeHeight)
    const thread = document.querySelector('#cusdis_thread')
    if (thread) {
      observer.observe(thread, {
        childList: true,
        subtree: true
      })
    }

    return () => {
      observer.disconnect()
    }
  }, [value])

  return (
    <>
      <StyledWrapper id="comments">
        <ReactCusdis
          key={value}
          attrs={{
            host: CONFIG.cusdis.config.host,
            appId: CONFIG.cusdis.config.appid,
            pageId: id,
            pageTitle: title,
            pageUrl: `${CONFIG.link}/${slug}`,
            theme: scheme,
          }}
          style={{
            width: '100%',
            height: 'auto',
            overflow: 'visible'
          }}
        />
      </StyledWrapper>
    </>
  )
}

export default Cusdis

const StyledWrapper = styled.div`
  margin-top: 2.5rem;

  #cusdis_thread {
    width: 100%;
  }

  #cusdis_thread iframe {
    height: auto !important;
    min-height: 312px !important;
    max-height: none !important;
    width: 100% !important;
  }
`