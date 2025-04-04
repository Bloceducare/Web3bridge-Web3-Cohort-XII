const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const { MerkleTree } = require("merkletreejs");
const { keccak256 } = require("ethers");

async function main() {
  const inputPath = path.join(__dirname, "target/input.json");
  const outputPath = path.join(__dirname, "target/output.json");

  const elements = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const types = elements.types;
  const count = elements.count;

  const leafs = new Array(count);
  const inputs = new Array(count);
  const outputs = new Array(count);

  for (let i = 0; i < count; i++) {
    const input = new Array(types.length);
    const data = new Array(types.length);

    for (let j = 0; j < types.length; j++) {
      if (types[j] === "address") {
        const value = elements.values[i][j];
        data[j] = ethers.getAddress(value);
        input[j] = value;
      } else if (types[j] === "uint") {
        const value = elements.values[i][j];
        data[j] = ethers.toBigInt(value);

        input[j] = value.toString();
      }
    }

    leafs[i] = keccak256(ethers.defaultAbiCoder.encode(data));
    inputs[i] = input.join(", ");
  }

  const tree = new MerkleTree(leafs, keccak256, { sort: true });

  for (let i = 0; i < count; i++) {
    const proof = tree.getProof(leafs[i]).map((p) => p.data);
    const root = tree.getRoot();
    const leaf = leafs[i];
    const input = inputs[i];

    outputs[i] = JSON.stringify({
      inputs: input,
      proof: proof,
      root: root,
      leaf: leaf,
    });
  }

  const output = outputs.join(", ");
  fs.writeFileSync(outputPath, output);

  console.log("DONE: The output is found at %s", outputPath);
}

// Execute the main function
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
