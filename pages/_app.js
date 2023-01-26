import React from 'react'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
      return (
            <>
                  <Head>
                        <title>HD Video Downloader For Facebook</title>
                        <meta name="title" content="HD Video Downloader For Facebook"></meta>
                        <meta name="description" content="Private videos in facebook can be downloaded in multiple resolutions of 144 to 1080 pixels."></meta>
                  </Head>
                  <Component {...pageProps} />
            </>
      )
}

export default MyApp