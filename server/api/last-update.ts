
import axios from "axios";
let last_updated = -1;

const update_checker = async () => {
    const last_update = await axios.get("http://135.181.183.103:3000/last-updated");
    if (last_update.data === "Initializing...") return;
    if (last_updated > Number(last_update.data)) return;
    last_updated = Number(last_update.data);
}

update_checker()
setInterval(() => {
    update_checker();
}, 1000 * 60 * 5)
export default async (req, res) => {
    if (last_updated == -1) {
        res.statusCode = 102;
        return res.end("Processing");
    }
    res.setHeader("Content-Type", "text/plain");
    res.statusCode = 200;
    return res.end(last_updated.toString());
}