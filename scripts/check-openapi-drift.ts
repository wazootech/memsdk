// Compares the live Supermemory v5 OpenAPI operation list against the checked-in
// snapshot. Run with `--write` to refresh the snapshot as part of a pin bump.
import { readFile, writeFile } from "node:fs/promises"
import { supermemoryCompatibility } from "../src/index.ts"

const snapshotPath = new URL(
  "../test/fixtures/openapi-v5.operations.txt",
  import.meta.url,
)
const methods = ["get", "post", "put", "patch", "delete"]

type OpenAPIDocument = {
  openapi: string
  paths: Record<string, Record<string, unknown>>
}

const response = await fetch(supermemoryCompatibility.openapiSource)
if (!response.ok) {
  throw new Error(`GET ${supermemoryCompatibility.openapiSource}: ${response.status}`)
}
const spec = (await response.json()) as OpenAPIDocument

const operations = Object.entries(spec.paths)
  .flatMap(([path, item]) =>
    methods
      .filter((method) => method in item)
      .map((method) => `${method.toUpperCase()} ${path}`),
  )
  .sort()
const live = [`openapi ${spec.openapi}`, ...operations].join("\n") + "\n"

if (process.argv.includes("--write")) {
  await writeFile(snapshotPath, live)
  console.log(`Wrote ${operations.length} operations to the snapshot.`)
  process.exit(0)
}

const pinned = await readFile(snapshotPath, "utf8")
if (pinned === live) {
  console.log(`No OpenAPI drift (${operations.length} operations).`)
  process.exit(0)
}

const pinnedLines = new Set(pinned.trim().split("\n"))
const liveLines = new Set(live.trim().split("\n"))
for (const line of liveLines) if (!pinnedLines.has(line)) console.error(`+ ${line}`)
for (const line of pinnedLines) if (!liveLines.has(line)) console.error(`- ${line}`)
console.error(
  "Supermemory OpenAPI drifted from the pinned snapshot. Review the change, update " +
    "COMPATIBILITY.md, then run `bun run drift:openapi --write`.",
)
process.exit(1)
