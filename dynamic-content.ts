// import {add} from "./main.ts"

import {colorize} from "jsr:@hikyu/colors";



export function foobar(s: string): string {
  console.log("foobar<br>\n")
  
  console.log(colorize("blue", "blue"))

  // console.log("add: ", add(2,3))
  return s
}
