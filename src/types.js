'use strict';

const fs = require('fs');
const path = require('path');
const O = require('omikron');

const types = O.enum([
  'FILE',
  'DIRECTORY',
  'UNKNOWN',
]);

module.exports = types;