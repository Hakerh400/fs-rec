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
  const stat = fs.statSync(pth);

  if(stat.isFile()) return types.FILE;
  if(stat.isDirectory()) return types.DIRECTORY;
  if(allowUnsupported) return types.UNKNOWN;

  throw new TypeError('Unsupported file system entry type');
};

const isFile = pth => getType(pth) === types.FILE;
const isDir = pth => getType(pth) === types.DIRECTORY;

const iter = async (pth, func) => {
  if(!path.isAbsolute(pth))
    pth = path.join(process.cwd(), pth);
  pth = path.normalize(pth);

  const base = path.parse(pth).base;
  const all = base === '*';
  if(all) pth = path.join('..');

  if(!fs.existsSync(pth))
    throw new Error('Path does not exist');

  const type = getType(pth);

  return pth;
};

const del = async pth => {};

module.exports = {
  iter,
  del,
};