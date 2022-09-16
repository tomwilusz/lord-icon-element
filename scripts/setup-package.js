/**
 * This file is used to build a clean, flat npm package.
 */
const fs = require("fs");
const path = require("path");

const DIST_DIR = 'dist';

function updateVersion(version) {
    for (const fileName of ['global.js', 'global.d.ts']) {
        let source = fs.readFileSync(path.join(process.cwd(), DIST_DIR, fileName)).toString('utf-8');
        source = source.replace('0.0.0', version);

        fs.writeFileSync(path.join(process.cwd(), DIST_DIR, fileName), source, "utf-8");
    }
}

function main() {
    const source = fs.readFileSync(path.join(process.cwd(), 'package.json')).toString('utf-8');

    const sourceObj = JSON.parse(source);
    sourceObj.scripts = {};
    sourceObj.devDependencies = {};
    sourceObj.private = false;

    fs.writeFileSync(path.join(process.cwd(), DIST_DIR, 'package.json'), JSON.stringify(sourceObj, null, 2), "utf-8");

    updateVersion(sourceObj.version);
}

main();