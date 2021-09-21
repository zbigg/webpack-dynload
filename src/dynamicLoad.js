const path = require("path-browserify");

const globalWebpackRequire = __webpack_require__;

console.debug("dynamicLoadMeta", window.dynamicLoadMeta);
const chunkPromises = {};

// Detect all already loaded script names, this may be little unreliable.
// TODO: more robust version
Array.from(document.querySelectorAll("script"))
    .filter((script) => script.src)
    .map((script) => {
        console.log("AA", script);
        return String(script.src);
    })
    .forEach((uri) => {
        chunkPromises[uri] = Promise.resolve();
    });

async function loadJavaScriptChunk(uri) {
    return new Promise((resolve, reject) => {
        // console.log("loading", uri);
        const element = document.createElement("script");
        element.src = uri;
        element.type = "text/javascript";
        element.async = true;
        element.onload = () => {
            // console.log("loaded", uri);
            element.onload = null;
            element.onerror = null;
            resolve();
        };
        element.onerror = (error) => {
            // console.log("error", uri, error);
            element.onload = null;
            element.onerror = null;
            reject(new Error(`dynamicLoad '${uri}': failed to load chunk: ${error}`));
        };
        document.body.appendChild(element);
    });
}

async function ensureJavascriptLoaded(uri) {
    let promise = chunkPromises[uri];

    if (!promise) {
        chunkPromises[uri] = promise = loadJavaScriptChunk(uri);
    }
    return promise;
}

/**
 * Dynamically load module.
 *
 * Usage - like
 *
 * Requires `window.dynamicLoadMeta` created by `DynamicLoadMetaPlugin`.
 *
 * @param {string} baseUri should be DYNAMIC_LOAD_DIRNAME
 * @param {string} module src-dir relative module name (like in CommonJS), no support for `node_modules` yet
 * @returns Promise<unknown> resolving to `module.exports` of requested module, when loaded
 */
export async function dynamicLoad(baseUri, module) {
    const jsName = module.endsWith(".js") ? module : module + ".js";
    const fulljsName = "./" + path.join(baseUri, jsName);
    const moduleMeta = window.dynamicLoadMeta[fulljsName];

    // console.log("dynamicLoad", module, fulljsName, moduleMeta);
    if (!moduleMeta) {
        throw new Error(`dynamicLoad '${fulljsName}': no meta for this module`);
    }
    const [moduleId, ...deps] = moduleMeta;
    const moduleDeps = deps.map((dep) => new URL(dep, window.location.href).href);

    const loadInOrder = moduleDeps.slice().reverse();

    // console.log("dynamicLoad", module, moduleId, fulljsName, loadInOrder);

    // TODO: this is very trivial chunk loading
    // TODO: parallel loading
    // TODO: check two level dependencies
    for (const uri of loadInOrder) {
        await ensureJavascriptLoaded(uri);
    }

    return globalWebpackRequire(moduleId);
}
