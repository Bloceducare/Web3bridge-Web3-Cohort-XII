// script/generateInput.js

const fs = require("fs");
const { ethers } = require("hardhat");

// Merkle tree input file generator script
async function main() {
    const AMOUNT = ethers.utils.parseEther("25"); // 25 * 1e18
    const types = ["address", "uint"];
    const whitelist = [
        "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0x2ea3970Ed82D5b30be821FAAD4a731D35964F7dd",
        "0xf6dBa02C01AF48Cf926579F77C9f874Ca640D91D"
    ];
    const count = whitelist.length;
    const input = createJSON(types, count, whitelist, AMOUNT);
    const INPUT_PATH = "./script/target/input.json";

    // Write to the output file the stringified output JSON tree dump
    fs.writeFileSync(INPUT_PATH, input);

    console.log("DONE: The output is found at %s", INPUT_PATH);
}

function createJSON(types, count, whitelist, amount) {
    const countString = count.toString(); // convert count to string
    const amountString = amount.toString(); // convert amount to string
    let json = `{
        "types": ${JSON.stringify(types)},
        "count": ${countString},
        "values": {`;

    whitelist.forEach((address, i) => {
        json += `"${i}": { "0": "${address}", "1": "${amountString}" }${i === whitelist.length - 1 ? '' : ','}`;
    });

    json += " } }";
    return json;
}

// Execute the main function
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});