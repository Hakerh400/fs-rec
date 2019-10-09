'use strict';

const fs = require('fs');
const path = require('path');
const O = require('omikron');

const allowUnsupported = 0;

const types = O.enum([
  'FILE',
  'DIRECTORY',
  'UNKNOWN',
]);

const getType = pth => {
  const stat = fs.statSync(type);

  if(stat.isFile()) return types.FILE;
  if(stat.isDirectory()) return types.DIRECTORY;

  if(!allowUnsupported)
    throw new TypeError('Unsupported file system entry type');

  return types.UNKNOWN;
};

const isFile = pth => getType(pth) === types.FILE;
const isDir = pth => getType(pth) === types.DIRECTORY;

const iter = (pth, func) => {
  
};

module.exports = {
  iter,
  del,
};