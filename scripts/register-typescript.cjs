// Test-only loader: use the project's existing TypeScript compiler, with no
// additional runner dependency or generated build files.
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
const resolveFilename = Module._resolveFilename
Module._resolveFilename = function (request, parent, ...rest) {
  return resolveFilename.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, ...rest)
}
require.extensions['.ts'] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  })
  module._compile(result.outputText, filename)
}
