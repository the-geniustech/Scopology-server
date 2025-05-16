// copy-assets.js
const fs = require("fs-extra");
const path = require("path");

const src = path.join(
  __dirname,
  "src",
  "services",
  "mail",
  "templates",
  "views"
);
const dest = path.join(
  __dirname,
  "dist",
  "services",
  "mail",
  "templates",
  "views"
);

fs.copy(src, dest)
  .then(() => console.log("✔ Email templates copied to dist"))
  .catch((err) => {
    console.error("❌ Failed to copy templates:", err);
    process.exit(1);
  });
