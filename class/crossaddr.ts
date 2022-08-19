// crossaddr.js
// (c) barrystyle 17082022

import base58 from 'b58';
import { Buffer } from "buffer";

async function sha256(buff, encoding = null): Promise<Buffer | string> {
    return new Promise((resolve) => {
        crypto.subtle.digest("SHA-256", buff).then(hashBuffer => {
            const b = Buffer.from(hashBuffer);
            if (encoding) {
                return resolve(b.toString(encoding));
            }
            return resolve(b);
        })
    })
}

export default async (inaddr: string, version="37") => {
    if (inaddr.length != 34) {
        return;
    }

    let part0 = inaddr.slice(0, 17);
    let part1 = inaddr.slice(17, 34);

    let part0hex = '';
    for (let i = 0; i < part0.length; i++) {
        part0hex = part0hex + Buffer.from(part0[i], 'ascii').toString('binary');
    }

    let part1hex = '';
    for (let i = 0; i < part1.length; i++) {
        part1hex = part1hex + Buffer.from(part1[i], 'ascii').toString('binary');
    }

    // encode each half
    const part0hash = await sha256(Buffer.from(part0hex, 'hex'));
    const part1hash = await sha256(Buffer.from(part1hex, 'hex'));
    part0hex = part0hex + part0hash[18].toString(16) + part0hash[19].toString(16) + '01';
    part1hex = part1hex + part1hash[18].toString(16) + part1hash[19].toString(16) + '02';

    // hash160 to wif
    part0hex = version + part0hex;
    part1hex = version + part1hex;

    let part0dblhash = await sha256(Buffer.from(part0hex, "hex"), 'hex') as string;
    part0dblhash = await sha256(Buffer.from(part0dblhash, "hex"), 'hex') as string;

    let part1dblhash = await sha256(Buffer.from(part1hex, "hex"), 'hex') as string;
    part1dblhash = await sha256(Buffer.from(part1dblhash, "hex"), 'hex') as string;

    part0hex = part0hex + part0dblhash.slice(0, 8);
    part1hex = part1hex + part1dblhash.slice(0, 8);
    let part0mid = Buffer.from(part0hex, 'hex');
    let part1mid = Buffer.from(part1hex, 'hex');
    let addr1 = base58.encode(part0mid);
    let addr2 = base58.encode(part1mid);
    return [addr1, addr2];
}