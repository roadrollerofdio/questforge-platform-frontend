/** @type {import('tailwindcss').Config} */
export default {
    // 指定需要 Tailwind 扫描并生成样式的全部文件路径
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}