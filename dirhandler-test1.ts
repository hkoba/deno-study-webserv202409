
import { walk, type WalkEntry } from "jsr:@std/fs/walk"

import { normalize } from "jsr:@std/path"

if (! Deno.args.length) {
  throw new Error(`Usage: ${Deno.mainModule} DIRECTORY`)
}

const [arg, ...restSearch] = Deno.args

const dhmap = await createDirHandlerMap(arg)

console.log(dhmap)

for (const path of restSearch) {
  const match = dhmap.pattern.exec(path)
  if (match !== null) {
    const [location] = match
    const dh = dhmap.map.get(location)
    console.log(`found for ${path}: `, dh)
  } else {
    console.log(`Not found for ${path}: `)
    // dhmap.map.get("/") === root を使うケース
  }
}

// URL.pathname で match させたい. named を使いたい
// entry を作りたい
// 親が名前で引けると嬉しい、かも？

async function createDirHandlerMap(path: string) {
  const fi = await Deno.stat(path)
  if (! fi.isDirectory)
    throw new Error(`path should be a directory!`)

  const rootDir = normalize(path).replace(/[/\\]+$/, "")

  const [_, ...subDirs] = await Array.fromAsync(
    walk(rootDir, {
      followSymlinks: true,
      canonicalize: false,
      includeFiles: false,
      skip: [/^\.git$/]
    }))

  // console.log(subDirs)
  // console.log(list_subdirs(rootDir, subDirs))

  const dirHandlerMap = new Map
  dirHandlerMap.set("/", {
    path: rootDir,
    subdirs: {}
  })

  for (const item of list_subdirs(rootDir, subDirs)) {
    console.log(item)
    const [path, location, parent, tail] = item
    const entry = {
      path, location, parent, tail, subdirs: {}
    }
    // subdirs は、refresh する時に役に立つんじゃないか？↓
    const parentEntry = dirHandlerMap.get(parent)
    if (parentEntry) {
      parentEntry.subdirs[tail] = entry
    }
    dirHandlerMap.set(location, entry)
  }

  // パターンには subdir だけを入れる(root / は必ずマッチするので無意味)
  const pathItems = []
  for (const path of Array.from(dirHandlerMap.keys())
    .filter((k) => k !== "/")
    .reverse()) {
    pathItems.push(`(${path})`)
  }
  const pattern = new RegExp(`^(?:${pathItems.join("|")})`)

  console.log(pattern)

  return {map: dirHandlerMap, pattern}
}

function list_subdirs(rootDir: string, subDirs: WalkEntry[]) {
  return subDirs.map((walk) => [
    walk.path,
    "/" + walk.path.substring(rootDir.length + 1) + "/",
    walk.path.substring(
      rootDir.length,
      walk.path.length - walk.name.length
    ),
    walk.name
  ])
}

// 先頭は、 arg になるね。あと、渡す時の末尾の / 有無で path の中身がばらつく

//  public   => path: public
//  public/  => path: public/
// ./public/ => path: public/

// path から name を引けば、prefix になる（先頭を除く）

// そもそも… dirhandler を取り出すための path matching が必要になるのは、
// subdirectory だけよね。
// subdirectory に関してだけパターンを作って、マッチしたらそれを使う、
// マッチしなければ public(document_root) を使う
// それで良いのではないか？

// あとは、watch については？
//  Deno.watchFs は [] をもらえるらしい。
