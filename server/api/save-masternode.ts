
import { useBody } from 'h3'
import { isIP } from 'is-ip';
import greg from "greg";
import {promises as fs} from "fs";
import path from "path";

const __dirname = path.resolve();
const cache_path = path.resolve(__dirname, ".cache");

fs.mkdir(cache_path, {recursive: true});



export default async (req, res) => {
    const body = await useBody(req) // only for POST request
    if (!Array.isArray(body.addresses)) {
        res.statusCode = 400;
        return res.end("addresses is not in array format.");
    };

    if (body.addresses.length > 1000) {
        res.statusCode = 400;
        return res.end("Too many addresses, only max 1000 addresses allowed.");
    };

    const addresses =
        body.addresses
            .flat()
            .filter((value, index, array) => array.indexOf(value) === index)
            .map((address) => address.trim().split(":")[0])
            .filter((value) => isIP(value))
            .sort();

    let id = greg.sentence().replace(/ /g, "-");
    while (true) {
        try {
            await fs.stat(path.resolve(cache_path, id))
            id = greg.sentence().replace(/ /g, "-");
        } catch (e) {
            break;
        }
    }
    
    await fs.writeFile(path.resolve(cache_path, `${id}.json`), JSON.stringify(addresses));

    res.setHeader("Content-Type", "text/plain");
    res.statusCode = 200;
    return res.end(id);
}