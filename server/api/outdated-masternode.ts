
import axios from "axios";
import { useBody, useCookies, useQuery } from 'h3'
import { isIP, isIPv4 } from 'is-ip';
import LZString from "lz-string";
import base64url from "base64url";

let outdated_mn = null;
let last_updated = -1;

const update_masternode_list = async () => {
    const res = await axios({
      method: "GET",
      url: "https://utils.pacprotocol.com/yansafe/outdated-masternode.json",
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    outdated_mn = res.data;
}

update_masternode_list()
setInterval(() => {
    update_masternode_list();
}, 1000 * 60 * 5)

export default async (req, res) => {
    if (!outdated_mn) {
        res.statusCode = 102;
        return res.end("Processing");
    }
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    return res.end(JSON.stringify(outdated_mn));
}