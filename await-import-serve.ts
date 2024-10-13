async function handle(_req: Request): Promise<Response> {
  const mod = await import("./dynamic-content.ts")

  const res = mod.foobar("baz")

  return new Response(res)
}

Deno.serve(handle)
