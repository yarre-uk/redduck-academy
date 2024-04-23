module.exports = {
  // Type check TypeScript files
  "**/*.(ts|tsx)": () => "yarn tsc --noEmit",

  "**/*.(sol)": (filenames) => `yarn solhint -f stylish ${filenames.join(" ")}`,

  // Format MarkDown and JSON
  "**/*.(md|json)": (filenames) =>
    `yarn prettier --write ${filenames.join(" ")}`,
};
