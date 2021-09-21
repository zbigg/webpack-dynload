const path = require("path");
const { DefinePlugin} = require("webpack");


function moduleDependenciesDeep(chunk) {
  let resultModules = new Set();
  function visitModule(module) {
    if (resultModules.has(module)) {
      return;
    }
    resultModules.add(module);
    for (const dep of module.dependencies) {
      if (dep.module) {
        visitModule(dep.module);
      }
    }
  }

  if (chunk.entryModule) {
    visitModule(chunk.entryModule);
  }
  chunk._modules?.dependencies?.forEach(visitModule);
  const result = Array.from(resultModules);
  // console.log("CHUNK requires", chunk.id, result.map(m => m.id))
  return result;
}

class DynamicLoadMetaPlugin {
  constructor(options) {
    this.options = options || {};
    this.root = this.options.root ?? process.cwd();
  }
  apply(compiler) {
    const definePlugin = new DefinePlugin({
        DYNAMIC_LOAD_DIRNAME: DefinePlugin.runtimeValue(
            v => {
                // const res = path.relative(v.module.rawRequest, root);
                return `'${path.dirname(v.module.rawRequest)}'`
            }, []
        )
    })
    compiler.apply(definePlugin);
    compiler.plugin("compilation", (compilation) => {
      compilation.plugin("after-optimize-chunk-assets", (chunks) => {
        const moduleLocalPath = (module) => {
          // console.log("moduleLocalPath", module.id, this.root, module.userRequest);
          return module.userRequest
            ? [module.id, `./` + path.relative(this.root, module.userRequest)]
            : [null, null];
        };
        // for(const chunk of chunks) {
        //     if (chunk.id === 'x')
        //      console.log("X chunk", util.inspect(chunk._modules));
        // }

        const deps = chunks
          .map((chunk) => ({
            uri: `./${chunk.files[0]}`,
            // name: chunk.name,
            defines: Array.from(chunk._modules)
              .map(moduleLocalPath)
              .filter(
                ([_, moduleSrcPath]) =>
                  moduleSrcPath && moduleSrcPath.endsWith(".js")
              ),
            requires: moduleDependenciesDeep(chunk)
              .map(moduleLocalPath)
              .filter(([_, p]) => Boolean(p)),
          }))
          .filter((deps) => deps.defines.length > 0);

        if (deps.length === 0) {
          // skip non-JS compilations
          return;
        }

        // console.log("DEPS");
        // console.log(deps);
        const chunksByUri = deps.reduce((r, chunk) => {
          r[chunk.uri] = chunk;
          return r;
        }, {});
        const modulesToChunkMeta = deps.reduce((r, chunk) => {
          if (chunk.defines) {
            for (const [id, module] of chunk.defines) {
              if (!r[module]) r[module] = [id];
              r[module].push(chunk.uri);
            }
          }
          return r;
        }, {});
        // console.log("modulesToChunks");
        // console.log(modulesToChunkUris);
        Object.keys(modulesToChunkMeta).forEach((module) => {
          const firstChunk = modulesToChunkMeta[module][1];
          const chunk = chunksByUri[firstChunk];

          for (const [_otherId, otherModule] of chunk.requires || []) {
            const otherChunkMeta = modulesToChunkMeta[otherModule];
            //console.log("dep", module, otherModule, otherChunkUris);
            if (!otherChunkMeta) {
              console.log(
                `warning: ${chunk} don't know how to resolve ${otherModule}`
              );
            } else {
              modulesToChunkMeta[module].push(otherChunkMeta[1]);
            }
          }
        });
        for (const key of Object.keys(modulesToChunkMeta)) {
          modulesToChunkMeta[key] = Array.from(
            new Set(modulesToChunkMeta[key])
          );
        }

        if (this.options.placeHolder) {
          this.options.placeHolder.dynamicLoadMeta = modulesToChunkMeta;
        }
        if (this.options.callback) {
            this.options.callback(modulesToChunkMeta);
        }

        console.log("DynamicLoadMetaPlugin: dynamicLoadMeta");
        console.log(modulesToChunkMeta);
      });
    });
  }
}

module.exports.DynamicLoadMetaPlugin = DynamicLoadMetaPlugin;
