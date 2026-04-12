// Preloader: patch @next/env to work with CJS interop in tsx
// This must run before payload's loadEnv.js attempts to destructure the default export
const nextEnv = require('@next/env');
// Payload's loadEnv.js does: import nextEnvImport from '@next/env'
// then: const { loadEnvConfig } = nextEnvImport;
// This fails when nextEnvImport is undefined (ESM→CJS interop issue).
// We monkeypatch the module cache to give it a valid default.

/**
 * ESM→CJS Interop Workaround for Payload's loadEnv.js
 *
 * Payload CMS's internal `loadEnv.js` imports the CommonJS module `@next/env` using ESM syntax.
 * When running under tsx or other ESM-to-CJS transpilers, the imported module may not have a
 * `.default` property, causing destructuring to fail.
 *
 * This monkeypatch intercepts Node's internal Module._load function and ensures that when
 * `@next/env` is loaded and lacks a `.default` export, we inject one (pointing to the module itself).
 *
 * References:
 *  - Module._load: Node internal API for loading modules
 *  - origLoad: Original Module._load function (preserved for delegation)
 *  - Conditional check: request === '@next/env' && result && !result.default
 *  - Injection: result.default = result
 *
 * WARNING: This uses Node.js internal APIs and is fragile. It should be removed or revisited
 * when Payload CMS and/or Next.js provide an upstream fix for this interop issue.
 *
 * TODO: Monitor Payload CMS and Next.js releases for a permanent solution to remove this workaround.
 */
const Module = require('module');
const origLoad = Module._load;
Module._load = function(request, parent, isMain) {
  const result = origLoad(request, parent, isMain);
  if (request === '@next/env' && result && !result.default) {
    result.default = result;
  }
  return result;
};