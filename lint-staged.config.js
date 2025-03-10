module.exports = {
  "frontend/**/*.{js,jsx,ts,tsx}": [
    "cd frontend && eslint --fix",
    "prettier --write"
  ],
  "backend/**/*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,css,md}": [
    "prettier --write"
  ]
};