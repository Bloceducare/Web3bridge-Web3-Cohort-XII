import { ethers } from "hardhat";
import MerkleTree from "merkletreejs";
import path from "path";
import csvParser from "csv-parser";
import fs from "fs";
import keccak256 from "keccak256";

async function main() {
  // Define the path to the CSV file
  const filePath = path.join(__dirname, "../files/list.csv")
  
  let results: Buffer[] = [];

  // reading from the file into the array
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (row: { address: string; amount: number }) => {
      const address = row.address;
      const amount = row.amount;
      const leaf = keccak256(
        ethers.solidityPacked(["address", "uint256"], [address, amount])
      );
      results.push(leaf);
    })
    .on("end", function () {
      console.log("CSV file successfully processed");

      // create new merkle tree
      const tree = new MerkleTree(results, keccak256, {
        sortPairs: true,
      });

      // get merkle root
      const roothash = tree.getHexRoot();

      console.log("merkle root: " + roothash);
      const targetData = {
        address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
        amount: "200000000000000000000",
      };
      console.log("User claim: " + targetData.address, targetData.amount);
      const targetLeaf = keccak256(
        ethers.solidityPacked(
          ["address", "uint256"],
          [targetData.address, targetData.amount]
        )
      );
      const leafProof = tree.getHexProof(targetLeaf);

      console.log(leafProof);
      // Verify the proof
      const isValid = tree.verify(leafProof, targetLeaf, roothash);
      console.log("Is Proof is valid? :", isValid);

      const targetData2 = {
        address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
        amount: "130000000000000000000",
      };
      console.log("User claim: " + targetData2.address, targetData2.amount);

      const targetLeaf2 = keccak256(
        ethers.solidityPacked(
          ["address", "uint256"],
          [targetData2.address, targetData2.amount]
        )
      );

      const leafProof2 = tree.getHexProof(targetLeaf2);
      console.log(leafProof2);

      const isValid2 = tree.verify(leafProof2, targetLeaf2, roothash);

      console.log("Is Proof is valid? :", isValid2);

      const targetData3 = {
        address: "0xa6B1feB40D1c8eeAD5AFD6f7372E02B637F142FA",
        amount: "1800000000000000000000",
      };
      const targetLeaf3 = keccak256(
        ethers.solidityPacked(
          ["address", "uint256"],
          [targetData3.address, targetData3.amount]
        )
      );
      console.log("User claim: " + targetData3.address, targetData3.amount);
      const leafProof3 = tree.getHexProof(targetLeaf3);
      console.log(leafProof3);

      const isValid3 = tree.verify(leafProof3, targetLeaf3, roothash);

      console.log("Is Proof is valid? :", isValid3);
    });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});