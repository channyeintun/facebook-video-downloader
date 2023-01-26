const http = require('http')
const next = require('next')
const { parse } = require('url')
const app = next({
      dir: './',
      dev: true
})

const handle = app.getRequestHandler()

app
      .prepare()
      .then(() => {
            const port = 3000
            const server = http.createServer((req, res) => {

                  const parsedUrl = parse(req.url, true)
                  const { pathname } = parsedUrl

                  if ('/' === pathname) {
                        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
                        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
                        res.setHeader('Access-Control-Expose-Headers','Content-Length')
                  }
                  handle(req, res)
            })

            server.listen(port)
      })
      .catch(err => {
            console.trace(err)
      })