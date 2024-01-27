/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  $schema: "http://json.schemastore.org/prettierrc",
  printWidth: 120,
  singleQuote: true,
  semi: true,
  bracketSameLine: false,
  useTabs: true,
  tabWidth: 2,
  trailingComma: "none",
  endOfLine: "auto",
};

export default config;
