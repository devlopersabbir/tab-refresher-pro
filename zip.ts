import { zip } from "zip-a-folder";
import { readJsonFile } from "vite-plugin-web-extension";

(async () => {
  const pkg = readJsonFile("package.json");
  await zip("dist", `./release/v${pkg.version}.zip`);
})();
