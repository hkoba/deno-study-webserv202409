function handler(req: Request): Response {
  console.log(req)
  const url = new URL(req.url)
  console.log(url)
  console.log(url.searchParams)
  // http://0.0.0.0:8000/?foo=x&foo=y&bar=z に対して、
  // keys が foo, foo, bar を返すやんか…
  console.log("url.searchParams.keys:", Array.from(url.searchParams.keys()))
  console.log("url.searchParams.get(foo):", url.searchParams.get('foo'))
  console.log("url.searchParams.getAll(foo):", url.searchParams.getAll('foo'))
  console.log("url.searchParams.getAll(bar):", url.searchParams.getAll('bar'))
 return new Response("Hello, World!\n<br>")
}

Deno.serve(handler)
