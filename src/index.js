'use strict';

const fs = require('fs');
const path = require('path');
const O = require('omikron');
const FSEntry = require('./fs-entry');
const types = require('./types');

const allowUnsupported = 0;

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

  if(type !== types.FILE){
    const fse = new FSEntry(path.join(pth, '..'));
    await func(fse);
    return;
  }
};

const del = async pth => {};

module.exports = {
  FSEntry,
  types,

  iter,
  del,
};