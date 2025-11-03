// ESLint Flat Config for Next.js + TypeScript
import next from 'eslint-config-next';
import eslintConfigPrettier from 'eslint-config-prettier';

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**'],
  },
  // Next.js + TypeScript recommended rules
  ...next,
  // Disable rules that conflict with Prettier formatting
  eslintConfigPrettier,
];

export default config;
