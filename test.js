// crossaddr.js
// (c) barrystyle 17082022

var crypto = require('crypto');
var base58 = require('b58');

const inaddr = 'PTLz7PaUiSx4AHbk5F1UaiBZg5FmFctWDP';

if (inaddr.length != 34) {
    return;
}

let part0 = inaddr.slice(0,17);
let part1 = inaddr.slice(17,34);

let part0hex = '';
for (let i = 0; i < part0.length; i++) {
  part0hex = part0hex + Buffer.from(part0[i], 'ascii').toString('hex');
}

let part1hex = '';
for (let i = 0; i < part1.length; i++) {
  part1hex = part1hex + Buffer.from(part1[i], 'ascii').toString('hex');
}

// encode each half
const part0buff = Buffer.from(part0hex, 'hex');
const part1buff = Buffer.from(part1hex, 'hex');
const part0hash = crypto.createHash('sha256').update(part0buff).digest();
const part1hash = crypto.createHash('sha256').update(part1buff).digest();
part0hex = part0hex + part0hash[19].toString(16) + part0hash[18].toString(16) + '01';
part1hex = part1hex + part1hash[19].toString(16) + part1hash[18].toString(16) + '02';


// hash160 to wif
part0hex = '37' + part0hex;
part1hex = '37' + part1hex;

let part0dblhash = crypto.createHash('sha256').update(Buffer.from(part0hex, 'hex')).digest();
part0dblhash = crypto.createHash('sha256').update(Buffer.from(part0dblhash, 'hex')).digest();
let part1dblhash = crypto.createHash('sha256').update(Buffer.from(part1hex, 'hex')).digest();
part1dblhash = crypto.createHash('sha256').update(Buffer.from(part1dblhash, 'hex')).digest();

part0hex = part0hex + part0dblhash.toString("hex").substring(0,8);
part1hex = part1hex + part1dblhash.toString("hex").substring(0,8);
let part0mid = Buffer.from(part0hex, 'hex');
let part1mid = Buffer.from(part1hex, 'hex');
let addr1 = base58.encode(part0mid);
let addr2 = base58.encode(part1mid);

console.log(addr1);
console.log(addr2);