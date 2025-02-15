# Task: Understanding Merkle Trees

## Objective

The goal of this task is to help you understand the basic concept of a Merkle Tree, its structure, and its importance in blockchain.

## Background

A Merkle Tree is a fundamental data structure used in blockchain systems to efficiently and securely verify the contents of large datasets. In a Merkle Tree, each leaf node represents a hash of a data block, and each non-leaf node represents a hash of its child nodes.

## Task Instructions

### Part 1: Understanding the Basics

1. **Research**:

   - Look up the definition of a Merkle Tree.
   - Understand the terms: leaf nodes, non-leaf nodes, root hash, and hash function.
   - Find out why Merkle Trees are important in blockchain.

2. **Summarize**:
   - Write a short paragraph (100-150 words) explaining what a Merkle Tree is and why it is used in blockchain.

### Part 2: Building a Simple Merkle Tree

1. **Data Preparation**:

   - Create a list of 4 data blocks (e.g., strings like "Block1", "Block2", "Block3", "Block4").

2. **Hashing**:

   - Use a simple hash function (e.g., SHA-256) to hash each data block. These hashes will be your leaf nodes.

3. **Construct the Tree**:

   - Combine the hashes of the first two blocks and hash the result to create the first non-leaf node.
   - Repeat the process for the next two blocks.
   - Finally, combine the two non-leaf node hashes and hash the result to create the root hash.

4. **Visual Representation**:
   - Draw a simple diagram of your Merkle Tree, labeling all nodes (leaf and non-leaf) with their corresponding hashes.

### Part 3: Verification

1. **Verify Integrity**:

   - Assume one of the data blocks (e.g., "Block3") has been tampered with. Show how the root hash changes and explain why this is important for data integrity in blockchain.

2. **Write-Up**:
   - Write a short explanation (100-150 words) on how Merkle Trees help in verifying data integrity in blockchain systems.

## Deadline

- Submit your completed task by 12PM Tomorrow.

## Resources

- [Merkle Tree Wikipedia](https://en.wikipedia.org/wiki/Merkle_tree)
- [Blockchain Basics: Merkle Trees](https://www.investopedia.com/terms/m/merkle-tree.asp)

---

Good luck!
