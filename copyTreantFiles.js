const fs = require('fs-extra');
const path = require('path');

fs.copySync(path.resolve(__dirname,'./node_modules/treant-js/Treant.js'), 'Treant.js');