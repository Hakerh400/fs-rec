'use strict';

const fs = require('fs');
const path = require('path');
const O = require('omikron');

const flags = {
  cacheFileContent: 0,
};

const types = O.enum([
  'DIR',
  'FILE',
  'OTHER',
]);

class FSEntry extends O.Stringifiable{
  constructor(pth){
    super();

    this.pth = norm(pth);

    const info = path.parse(this.pth);
    this.root = info.root;
    this.dir = info.dir;
    this.base = info.base;
    this.name = info.name;
    this.ext = info.ext.startsWith('.') ? info.ext.slice(1) : info.ext;
  }

  get exists(){
    return fs.existsSync(this.pth);
  }

  get type(){ O.virtual('type'); }
  get isDir(){ return this.type === types.DIR; }
  get isFile(){ return this.type === types.FILE; }
  get isOther(){ return this.type === types.OTHER; }

  move(){ O.virtual('move'); }
  moveRec(pth){ this.move(pth); }

  copy(){ O.virtual('copy'); }
  copyRec(pth){ this.copy(pth); }

  delete(){ O.virtual('delete'); }
  deleteRec(){ this.delete(); }
}

class Directory extends FSEntry{
  #content = null;

  get type(){ return types.FILE; }

  get content(){
    if(this.#content !== null)
      return this.#content;

    return this.#content = fs.readdirSync(this.pth).map(fileName => {
      const pthNew = this.join(fileName);
      const stat = fs.statSync(pthNew);

      if(stat.isDirectory()) return new Directory(pthNew);
      if(stat.isFile()) return new File(pthNew);
      return new Other(pthNew);
    });
  }

  join(pth){
    return path.join(this.pth, pth);
  }

  rel(pth){
    return path.relative(this.pth, pth);
  }

  move(pth){
    fs.renameSync(this.pth, norm(pth));
  }

  copy(pth){
    fs.mkdirSync(norm(pth));
  }

  copyRec(pth){
    const pthOld = this.pth;
    const pthNew = norm(pth);

    this.topDown(entry  => {
      const dest = path.join(pthNew, path.relative(pthOld, entry.pth));
      entry.copy(dest);
    });
  }

  delete(){
    fs.rmdirSync(this.pth);
  }

  deleteRec(){
    this.bottomUp(entry => {
      entry.delete();
    });
  }

  get chNum(){ return this.content.length; }
  getCh(i){ return this.content[i]; }

  toStr(){
    const {content} = this;
    if(content.length === 0) return this.name;

    const arr = [this.name, this.inc, '\n'];
    super.join(arr, content, '\n');
    arr.push(this.dec);

    return arr;
  }
}

class File extends FSEntry{
  static #buf = Buffer.alloc(1 << 16);
  #content = null;

  get type(){ return types.FILE; }

  get content(){
    if(this.#content !== null)
      return this.#content;

    const content = O.rfs(this.pth);

    if(flags.cacheFileContent)
      this.#content = content;

    return content;
  }

  set content(content){
    if(flags.cacheFileContent)
      this.#content = content;

    O.wfs(this.pth, content);
  }

  move(pth){
    fs.renameSync(this.pth, norm(pth));
  }

  copy(pth){
    const a = fs.openSync(this.pth, 'r');
    const b = fs.openSync(norm(pth), 'w');

    const buf = File.#buf;
    const bufSize = buf.length;

    while(1){
      const len = fs.readSync(a, buf);
      if(len === 0) break;

      fs.writeSync(b, buf, 0, len);
      if(len !== bufSize) break;
    }

    fs.closeSync(a);
    fs.closeSync(b);
  }

  delete(){
    fs.unlinkSync(this.pth);
  }

  get chNum(){ return 0; }

  toStr(){
    return this.base;
  }
}

class Other extends FSEntry{
  get type(){ return types.OTHER; }
  get chNum(){ return 0; }

  toStr(){
    return this.base;
  }
}

const norm = pth => {
  if(!path.isAbsolute(pth))
    pth = path.join(process.cwd(), pth);

  pth = path.normalize(pth);

  return pth;
};

module.exports = {
  flags,
  types,

  FSEntry,
  Directory,
  File,

  norm,

  get cwd(){
    return new Directory(process.cwd());
  },
};