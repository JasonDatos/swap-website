
import axios from "axios";
import { useBody, useCookies, useQuery } from 'h3'
import { isIP, isIPv4 } from 'is-ip';
import LZString from "lz-string";
import base64url from "base64url";

import { promises as fs } from "fs";
import path from "path";

const __dirname = path.resolve();
const cache_path = path.resolve(__dirname, ".cache");

fs.mkdir(cache_path, {recursive: true});

let masternode_cache = null;
let masternode_cache_all = "";
let mn_list_ip: string[] = [];
let last_updated = -1;

const update_masternode_list = async () => {
    const last_update = await axios.get("http://135.181.183.103:3000/last-updated");
    if (last_update.data === "Initializing...") return;
    if (last_updated > Number(last_update.data)) return;
    last_updated = Number(last_update.data);

    const mn_check = await axios.get("http://135.181.183.103:3000/masternode-checked.json");

    if (mn_check.status === 200) {
        const mn_object = {};
        for (let i = 0; i < mn_check.data.length; i++) {
            delete mn_check.data[i].msg;
            mn_object[mn_check.data[i].host] = mn_check.data[i];
        }
        masternode_cache = mn_check.data;
        masternode_cache_all = JSON.stringify(mn_object);
        mn_list_ip = masternode_cache.map((mn) => mn.ip).map((address) => address.trim().split(":")[0]);;
    }
}

update_masternode_list()
setInterval(() => {
    update_masternode_list();
}, 1000 * 60 * 5)

export default async (req, res) => {
    if (!masternode_cache) {
        res.statusCode = 102;
        return res.end("Processing");
    }

    let unprocessed_addresses = [];

    const body = await useBody(req) // only for POST request

    if (body.all) {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        return res.end(masternode_cache_all);
    }else if (body.listid) {
        try {
            await fs.stat(path.resolve(cache_path, `${body.listid}.json`));
        } catch (e) {
            res.statusCode = 400;
            return res.end("Invalid listid");
        }
        const val = await fs.readFile(path.resolve(cache_path, `${body.listid}.json`), "utf8");
        unprocessed_addresses = JSON.parse(val);
    }else if (body.addresses){
        unprocessed_addresses = body.addresses;
        if (!Array.isArray(unprocessed_addresses)) {
            res.statusCode = 400;
            return res.end("addresses is not in array format.");
        };
        if (unprocessed_addresses.length > 1000) {
            res.statusCode = 400;
            return res.end("Too many addresses, only max 1000 addresses allowed.");
        }
    }

    //Remove duplicated.
    let addresses =
            unprocessed_addresses
                .flat()
                .filter((value, index, array) => array.indexOf(value) === index)
                .map((address) => address.trim().split(":")[0]);

    const mn = {};

    for (let j = 0; j < addresses.length; j++) {
        if (!isIP(addresses[j])) {
            mn[addresses[j]] = {
                error: true,
                error_type: "invalid_ip_address",
                message: "Invalid IP Address."
            }
            break;
        }
        console.log(addresses[j]);
        for (let i = 0; i < masternode_cache.length; i++) {
            if (masternode_cache[i].host === addresses[j]) {
                mn[addresses[j]] = masternode_cache[i];
                break;
            }
        }
        if (!mn[addresses[j]]) {
            mn[addresses[j]] = {
                error: true,
                error_type: "not_in_masternode_list",
                message: "Not in Masternode List."
            }
        }
    }
    console.log(mn);
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    return res.end(JSON.stringify(mn));
}