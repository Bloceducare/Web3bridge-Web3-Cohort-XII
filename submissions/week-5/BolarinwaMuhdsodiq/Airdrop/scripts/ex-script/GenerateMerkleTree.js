const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Merkle tree input file generator script
async function main() {
  const AMOUNT = ethers.parseEther("25"); // 25 * 1e18
  const types = ["address", "uint"];
  const whitelist = [
    //"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x2ea3970Ed82D5b30be821FAAD4a731D35964F7dd",
    "0xf6dBa02C01AF48Cf926579F77C9f874Ca640D91D",
  ];
  const count = whitelist.length;
  const input = createJSON(types, whitelist, count);

  // Define the output path
  const INPUT_PATH = path.join(__dirname, "target/input.json");

  // Write to the output file the stringified output JSON tree dump
  fs.writeFileSync(INPUT_PATH, input);

  console.log("DONE: The output is found at %s", INPUT_PATH);
}

function createJSON(types, whitelist, count) {
  const AMOUNT = ethers.parseEther("25");
  const countString = count.toString(); // convert count to string
  const amountString = AMOUNT.toString(); // convert amount to string
  let json = JSON.stringify({
    types: types,
    count: countString,
    values: {},
  });

  const values = {};
  for (let i = 0; i < whitelist.length; i++) {
    values[i] = {
      0: whitelist[i],
      1: amountString,
    };
  }
  json = JSON.parse(json);
  json.values = values;

  return JSON.stringify(json);
}

// Execute the main function
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
