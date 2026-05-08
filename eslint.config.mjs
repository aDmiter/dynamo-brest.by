import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  prettierConfig,
  {
    rules: {
      // Разрешаем использовать <img> наравне с <Image>
      '@next/next/no-img-element': 'off',
    },
  },
]);

export default eslintConfig;
