const path = require('path');
const express = require('express');
const serveStatic = require('serve-static');
const app = express();

app.use(serveStatic('examples', { 'index': ['index.html', 'index.htm'] }));
app.use('/examples', express.static(path.join(__dirname, '..', 'examples')));
app.use('/dist', express.static(path.join(__dirname, '..', 'dist')));
app.use('/release', express.static(path.join(__dirname, '..', 'release')));
app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules')));
app.listen(8000);
