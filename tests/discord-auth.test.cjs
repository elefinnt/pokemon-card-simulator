const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const { createRequire } = require('node:module')
const ts = require('typescript')

test('Discord callback accepts the real issuer and rejects a different issuer or state', () => {
  let config
  const compiled = ts.transpileModule(fs.readFileSync('auth.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText
  vm.runInNewContext(compiled, {
    exports: {}, process,
    require(name) {
      // Capture the application's real provider configuration without starting
      // Next.js or connecting to its database. Provider implementations remain real.
      if (name === 'next-auth') return { __esModule: true, default(options) { config = options; return {} } }
      if (name === '@/db') return { db: null }
      if (name === '@auth/drizzle-adapter') return { DrizzleAdapter() { throw new Error('Database access is not expected') } }
      return require(name)
    },
  })
  const provider = config.providers.find(provider => provider.id === 'discord')
  const server = { issuer: provider.options.issuer }
  const client = { client_id: 'regression-test-client' }
  const authRequire = createRequire(require.resolve('next-auth'))
  const coreRequire = createRequire(authRequire.resolve('@auth/core'))
  const { validateAuthResponse } = coreRequire('oauth4webapi')
  const params = new URLSearchParams({ code: 'test-code', state: 'test-state', iss: 'https://discord.com' })
  assert.equal(validateAuthResponse(server, client, params, 'test-state').get('code'), 'test-code')
  assert.throws(() => validateAuthResponse(server, client, new URLSearchParams({ code: 'test-code', state: 'test-state', iss: 'https://other.example' }), 'test-state'))
  assert.throws(() => validateAuthResponse(server, client, params, 'wrong-state'))
})
