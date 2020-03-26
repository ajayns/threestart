import { series, src, dest, watch as w } from "gulp";
import { rollup } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import babel from "rollup-plugin-babel";
import common from "@rollup/plugin-commonjs";
import glslify from "rollup-plugin-glslify";
import { uglify } from "rollup-plugin-uglify";
import browserSync from "browser-sync";

const server = browserSync.create();

const copy = () => src(["src/**.html", "src/**.css"]).pipe(dest("public/"));

const scripts = (cb, build = false) => {
  const plugins = [
    resolve(),
    glslify(),
    babel({
      exclude: "node_modules/**"
    }),
    common({
      include: "node_modules/**"
    })
  ];

  if (build) {
    plugins.push(uglify());
  }

  return rollup({
    input: "src/scripts/index.js",
    plugins
  }).then(bundle =>
    bundle.write({
      file: "public/script.js",
      format: "cjs"
    })
  );
};

const buildScripts = cb => scripts(cb, true);

const reload = cb => {
  server.reload();
  cb();
};

const serve = cb => {
  server.init({
    server: {
      baseDir: "public/"
    }
  });
  cb();
};

function watch() {
  w(["src/**.html", "src/**.css"], series(copy, reload));
  w(["src/scripts"], series(scripts, reload));
}

const main = series(copy, scripts, serve, watch);
const build = series(copy, buildScripts);

export { build };
export default main;
