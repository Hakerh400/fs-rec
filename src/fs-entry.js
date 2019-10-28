'use strict';

const fs = require('fs');
const path = require('path');
const O = require('omikron');
const types = require('./types');

class FSEntry{
  constructor(base, pth, type){
    this.base = base;
    this.path = pth;
    this.type = type;
    this.seen = 0;

    this.rel = path.relative(base, pth);
  }

  nav(dir){
    return path.join(dir, this.rel);
  }
}

module.expoirts = FSEntry;