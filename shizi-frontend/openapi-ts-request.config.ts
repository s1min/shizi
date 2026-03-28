import { defineConfig } from 'openapi-ts-request'

export default defineConfig([
  {
    describe: 'unibest-openapi-test',
    schemaPath: 'http://localhost:8000/api/unibest-opapi-test.json',
    serversPath: './src/service',
    requestLibPath: `import request from '@/http/vue-query';\n import { CustomRequestOptions_ } from '@/http/types';`,
    requestOptionsType: 'CustomRequestOptions_',
    isGenReactQuery: false,
    reactQueryMode: 'vue',
    isGenJavaScript: false,
  },
])
