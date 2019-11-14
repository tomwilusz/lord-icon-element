const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');
const open = require('open');

const app = express();
 
app.use(serveStatic('examples', {'index': ['index.html', 'index.htm']}));
app.use('/build', express.static(path.join(__dirname, 'build')));
app.use('/bin', express.static(path.join(__dirname, 'bin')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.listen(3000);

open('http://localhost:3000/');