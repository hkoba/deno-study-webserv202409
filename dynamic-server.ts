const scriptFn = "./dynamic-content.ts"

type CacheEntry = {
  mtime: Date
  handler: {foobar: (s: string) => string}
}

let mod: CacheEntry | null = null

async function testFileMtime(str: string): Promise<Date | null> {
  try {
    const fi = await Deno.stat(str)
    return fi.mtime
  } catch (e: any) {
    if (e.code && e.code !== "ENOENT") {
      throw e
    }
    return null
  }
}

async function testCacheValidity(cache: CacheEntry, fn: string): Promise<boolean> {
  const fsMtime = await testFileMtime(fn)
  return fsMtime && fsMtime <= cache.mtime ? true : false
}

async function readFile(file: Deno.FsFile): Promise<string> {
  let result = ""
  let readBytes
  do {
    const buf = new Uint8Array(100)
    readBytes = await file.read(buf)
    console.log("readBytes: ", readBytes)
    result += new TextDecoder().decode(buf)
  } while (readBytes)
  return result
}

async function loadContent(fn: string): Promise<CacheEntry> {
  const fh = await Deno.open(fn)
  const content = await readFile(fh)
  console.log("pure content:", content)
  const fi = await fh.stat()
  if (!fi || !fi.mtime) {
    throw new Error(`file changed during read`)
  }
  const mtime = fi.mtime
  // ここで typescript 変換を掛けないと！
  const handler = await import(`data:,${content}`)
  console.log("loaded: ", handler)
  return {handler, mtime}
}

async function handle(req: Request): Promise<Response> {
  
  try {

    if (! mod) {
      console.log("load new")
      mod = await loadContent(scriptFn)
    } else if (! await testCacheValidity(mod, scriptFn)) {
      console.log("reload updated")
      mod = await loadContent(scriptFn)
    } else {
      console.log("cache is valid")
    }
    
    if (mod) {
      console.log("handler: ", mod.handler)
      const res = mod.handler.foobar("yes??")
      console.log(res)
      return new Response(res)
    } else {
      return new Response("No such file", {status: 404})
    }
  } catch (e) {
    console.log("ng:", e)
    return new Response("Internal error", {status: 500})
  }
}

Deno.serve(handle)
