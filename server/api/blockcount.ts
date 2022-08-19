import axios from "axios";
let block_count = -1;

const update_blockcount = async () => {
    const block_count_response = await axios.get("https://explorer.pacglobal.io/api/getblockcount");
    if (block_count > Number(block_count_response.data)) return;
    block_count = Number(block_count_response.data);
}

update_blockcount()
setInterval(() => {
    update_blockcount();
}, 1000 * 60 * 5)

export default async (req, res) => {
    if (block_count == -1) {
        res.statusCode = 102;
        return res.end("Processing");
    }
    res.setHeader("Content-Type", "text/plain");
    res.statusCode = 200;
    return res.end(block_count.toString());
}