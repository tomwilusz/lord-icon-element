const path = require('path');
const express = require('express');
const serveStatic = require('serve-static');
const app = express();
 
app.use(serveStatic('demo', {'index': ['index.html', 'index.htm']}));
app.use('/demo', express.static(path.join(__dirname, '..', 'demo')));
app.use('/build', express.static(path.join(__dirname, '..', 'build')));
app.use('/release', express.static(path.join(__dirname, '..', 'release')));
app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules')));
app.listen(8000);
