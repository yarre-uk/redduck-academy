module.exports = {
  // Type check TypeScript files
  "**/*.(ts|tsx)": () => "yarn tsc --noEmit",

  // Lint then format TypeScript and JavaScript files
  // "**/*.(ts|tsx|js|sol)": (filenames) => [
  //   `yarn solhint --fix ${filenames.join(" ")}`,
  //   `yarn prettier --write ${filenames.join(" ")}`,
  // ],

  "**/*.(sol)": (filenames) => `yarn solhint -f stylish ${filenames.join(" ")}`,

  // Format MarkDown and JSON
  "**/*.(md|json)": (filenames) =>
    `yarn prettier --write ${filenames.join(" ")}`,
};
