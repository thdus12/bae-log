// pages/_app.tsx
import { AppPropsWithLayout } from "../types"
import { Hydrate, QueryClientProvider } from "@tanstack/react-query"
import CursorFx from "src/components/CursorFx"
import { RootLayout } from "src/layouts"
import { queryClient } from "src/libs/react-query"
import { useRouter } from 'next/router'

import "/src/styles/themes/prism.css"

function App({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter()
  const isPrintPage = router.pathname.startsWith('/print')
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        {isPrintPage ? (
          getLayout(<Component {...pageProps} />)
        ) : (
          <RootLayout>{getLayout(<Component {...pageProps} />)}</RootLayout>
        )}
      </Hydrate>
      {!isPrintPage && <CursorFx />}
    </QueryClientProvider>
  )
}

export default App