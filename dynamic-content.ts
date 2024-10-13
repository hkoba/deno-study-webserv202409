import {add} from "./main.ts"

export function foobar(s: string): string {
  console.log("foobar<br>\n")
  console.log("add: ", add(2,3))
  return s
}
