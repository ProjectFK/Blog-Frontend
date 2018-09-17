let path = require('path');
let fs = require('fs');

let a = class NoGluePlugin {

    constructor() {
    }

    apply(compiler) {

        compiler.hooks.compilation.tap('no-glue-plugin', (compilation) => {

            if (!compilation.hooks.htmlWebpackPluginAlterAssetTags) return;
            compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
                'no-glue-plugin',
                (data, cb) => {
                    let currentChunkJsName = data.plugin.options.chunks[0];
                    let entryElement = compilation.options.entry[currentChunkJsName];
                    //Hack for dev server
                    if (typeof entryElement === 'object') entryElement = entryElement[1];
                    let entryJs = path.resolve(compilation.options.context, entryElement);
                    let content;
                    try {
                        //Might be better if I just read the file and check if there's something like
                        // "// glue" in the first line......
                        content = fs.readFileSync(entryJs, 'utf-8');
                    } catch (e) {
                    }
                    //If the app.js is there just to be a "glue"
                    if (NoGluePlugin.isGlue(content)) {
                        console.log(`glue detected from chunk ${currentChunkJsName}`);
                        let body = data.body;
                        let fileNames = [];
                        for (let i = 0; i< data.chunks.length; i++) {
                            let cf = data.chunks[i].files;
                            for (let i1 = 0; i1< cf.length; i1++) {
                                if (cf[i1].endsWith('js')) {
                                    fileNames = fileNames.concat(cf);
                                }
                            }
                        }

                        let hitedNames = [];

                        for (let i = 0; i < body.length; i++) {
                            let attributes = body[i].attributes;
                            for (let i1 = 0; i1<fileNames.length; i1++) {
                                if (attributes.type.includes('javascript') && attributes.src.endsWith(fileNames[i1])) {
                                    delete body[i];
                                    i = i--;
                                    hitedNames = hitedNames.concat(fileNames[i1]);
                                }
                            }
                        }

                        for (let i = 0; i< hitedNames.length; i++) {
                            if (compilation.assets.hasOwnProperty(hitedNames[i])) {
                                console.log(`glue: removed ${hitedNames[i]} from webpack assets which was in chunk ${currentChunkJsName}`);
                                delete compilation.assets[hitedNames[i]];
                            }
                        }

                    }
                    cb(null, data)
                }
            )
        })

    };

    static isGlue(content) {
        let lineSpliter = content.indexOf('\n');
        let firstLine;
        if (lineSpliter !== -1)
            firstLine = content.substring(0, lineSpliter);
        else
            firstLine = content;
        let b = firstLine.includes('\"glue\"');
        return b || firstLine.includes('\'glue\'')
    }

};

module.exports = a;