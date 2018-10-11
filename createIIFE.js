//@ts-check
const jiife = require('jiife');
const xl = 'node_modules/xtal-latx/';
jiife.processFiles([xl + 'define.js', xl + 'qsa.js', xl + 'downloadJSFilesInParallelButLoadInSequence.js', xl + 'xtal-latx.js', 'xtal-treant.js'], 'xtal-treant.iife.js');



