async function test() {
  const mod = await import(`data:text/javascript,
// test1.ts
function foobar(s) {
  return s + s;
}

// main.ts
function add(a, b) {
  return a + b;
}
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));
  console.log("foobar: ", foobar("foo"));
}

// dynamic-content.ts
function foobar2(s) {
  console.log("foobar<br>\n");
  console.log("add: ", add(2, 3));
  return s;
}
export {
  foobar2 as foobar
};
`)

  console.log(mod)
  console.log(mod.foobar("baz"))
}

await test()
