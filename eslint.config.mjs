// eslint.config.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  // 무시 패턴 (플랫에선 .eslintignore 대신 여기서)
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/*.min.*",
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",
    ],
  },

  // 기본 JS 권장
  js.configs.recommended,

  // TS 권장(비타입) + 타입체크 규칙(원하면 킴)
  ...tseslint.configs.recommended,
  // 타입 인지 규칙까지 쓰고 싶으면 이 줄도 함께 사용
  // ...tseslint.configs.recommendedTypeChecked,

  // 우리 프로젝트 룰
  {
    files: ["**/*.{ts,tsx,js,jsx}"],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },

        // ⛳️ 여기서 '문자열'로 넣어줘야 함 (에러 원인 해결)
        tsconfigRootDir: __dirname,

        // 타입 인지 규칙까지 쓸 때만 필요(위에서 recommendedTypeChecked를 켰다면 아래 둘 중 하나 선택)
        // 1) 단일 프로젝트 파일
        project: ["./tsconfig.json"],
        // 2) 혹은 자동 탐지
        // projectService: true,
      },
    },

    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react,
      "react-hooks": reactHooks,
      prettier: eslintPluginPrettier,
    },

    settings: { react: { version: "detect" } },

    rules: {
      // 너가 쓰던 커스텀
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // React
      "react/self-closing-comp": "warn",
      "react/jsx-boolean-value": ["warn", "never"],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Prettier를 ESLint 에러로
      "prettier/prettier": "error",
    },
  },

  // 마지막에 Prettier로 충돌 룰 꺼주기
  prettier,
];
