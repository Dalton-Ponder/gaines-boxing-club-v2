// Preloader: patch @next/env to work with CJS interop in tsx
// This must run before payload's loadEnv.js attempts to destructure the default export
const nextEnv = require('@next/env');
// Payload's loadEnv.js does: import nextEnvImport from '@next/env'
// then: const { loadEnvConfig } = nextEnvImport;
// This fails when nextEnvImport is undefined (ESM→CJS interop issue).
// We monkeypatch the module cache to give it a valid default.
const Module = require('module');
const origLoad = Module._load;
Module._load = function(request, parent, isMain) {
  const result = origLoad(request, parent, isMain);
  if (request === '@next/env' && result && !result.default) {
    result.default = result;
  }
  return result;
};
