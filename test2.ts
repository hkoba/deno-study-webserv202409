async function test() {
  const mod = await import(`data:text/javascript,
// test1.ts
function foobar(s) {
  return s + s;
}

export {
  foobar
};
`)

  console.log(mod)
  console.log(mod.foobar("baz"))
}

await test()
