import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "@lapidix/eslint-plugin-boundaries";
import tsParser from "@typescript-eslint/parser";
import boundariesPlugin from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// createConfig으로 프로젝트에 맞게 커스텀
const customBoundariesConfig = boundaries.createConfig({
  allowOneDepth: true, // 한 뎁스 서브엔트리 전체 허용 (가장 간단!)
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 플러그인 등록
  {
    plugins: {
      "@lapidix/boundaries": boundaries,
      boundaries: boundariesPlugin,
      import: importPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },

  // 커스텀 boundaries 설정 적용
  ...customBoundariesConfig,
];

export default eslintConfig;
