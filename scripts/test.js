const path = require('path');
const express = require('express');
const serveStatic = require('serve-static');
const app = express();

app.use(serveStatic('test', { 'index': ['index.html', 'index.htm'] }));
app.use('/test', express.static(path.join(__dirname, '..', 'test')));
app.use('/dist', express.static(path.join(__dirname, '..', 'dist')));
app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules')));
app.listen(8000);
