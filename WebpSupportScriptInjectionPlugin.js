const UglifyJS = require("uglify-js");

const payload =
    '/**webp image loader for STUPID EDGE and SAFARI*/' + UglifyJS.minify(
    '(function () {\n' +
    '    var WebP = new Image();\n' +
    '    WebP.onload = WebP.onerror = function () {\n' +
    '        if (WebP.height != 2) {\n' +
    '            var sc = document.createElement(\'script\');\n' +
    '            sc.type = \'text/javascript\';\n' +
    '            sc.async = true;\n' +
    '            var s = document.getElementsByTagName(\'script\')[0];\n' +
    '            sc.src = \'https://cdn.jsdelivr.net/npm/webpjs@0.0.2/webpjs.min.js\';\n' +
    '            s.parentNode.insertBefore(sc, s);\n' +
    '        }\n' +
    '    };\n' +
    '    WebP.src = \'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA\';\n' +
    '})();').code;

let a = class WebpSupportScriptInjectionPlugin {

    constructor() {
    }

    apply(compiler) {


        compiler.hooks.compilation.tap('Webp-Support-Script-Injection-Plugin', (compilation) => {

            compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
                'Webp-Support-Script-Injection-Plugin',
                (data, cb) => {
                    data.head.unshift({
                        tagName: 'script',
                        closeTag: true,
                        attributes: {
                            type: 'text/javascript'
                        },
                        innerHTML: payload
                    });
                    cb(null, data)
                }
            )
        })

    };

};
module.exports = a;