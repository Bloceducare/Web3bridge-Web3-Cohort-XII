// import { ethers } from "hardhat";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { expect } from "chai";
// import { LibraryManagement } from "../typechain"; 

// describe("LibraryManagement", function () {
//   let owner: SignerWithAddress;
//   let addr1: SignerWithAddress;
//   let addr2: SignerWithAddress;
//   let library: LibraryManagement;

//   beforeEach(async () => {
//     [owner, addr1, addr2] = await ethers.getSigners();

//     // Get the contract factory and deploy
//     const LibraryManagementFactory = await ethers.getContractFactory("LibraryManagement");
//     library = (await LibraryManagementFactory.deploy("My Decentralized Library")) as LibraryManagement;

//     // Wait until the contract is deployed
//     await library.deployed();
//   });

//   it("should set the correct owner and library name upon deployment", async () => {
//     // Check owner
//     const contractOwner = await library.owner();
//     expect(contractOwner).to.equal(owner.address);

//     // Check library name
//     const libName = await library.libraryName();
//     expect(libName).to.equal("My Decentralized Library");
//   });

//   describe("Owner actions", () => {
//     it("should allow the owner to add a new book", async () => {
//       await library.addBook(1, "1984", "George Orwell");
//       const book = await library.getBook(1);

//       expect(book.title).to.equal("1984");
//       expect(book.author).to.equal("George Orwell");
//       expect(book.isAvailable).to.equal(true);
//       expect(book.borrowedBy).to.equal(ethers.constants.AddressZero);

//       const totalBooks = await library.totalBooks();
//       expect(totalBooks).to.equal(1);
//     });

//     it("should fail if a non-owner tries to add a book", async () => {
//       await expect(
//         library.connect(addr1).addBook(1, "BookTitle", "BookAuthor")
//       ).to.be.revertedWith("Only the contract owner can perform this action.");
//     });

//     it("should allow the owner to remove a book that is not borrowed", async () => {
//       // Add a book
//       await library.addBook(2, "Animal Farm", "George Orwell");
//       expect(await library.totalBooks()).to.equal(1);

//       // Remove the book
//       await library.removeBook(2);
//       expect(await library.totalBooks()).to.equal(0);
//     });

//     it("should fail to remove a non-existing book", async () => {
//       await expect(library.removeBook(999)).to.be.revertedWith("Book does not exist.");
//     });
//   });

//   describe("Borrowing and returning", () => {
//     beforeEach(async () => {
//       // Add some books
//       await library.addBook(10, "The Great Gatsby", "F. Scott Fitzgerald");
//       await library.addBook(11, "Lord of the Rings", "J.R.R. Tolkien");
//     });

//     it("should allow a user to borrow an available book", async () => {
//       await library.connect(addr1).borrowBook(10);
//       const book = await library.getBook(10);
//       expect(book.isAvailable).to.equal(false);
//       expect(book.borrowedBy).to.equal(addr1.address);

//       // Check borrowedCount increment
//       const count = await library.borrowedCount(addr1.address);
//       expect(count).to.equal(1);
//     });

//     it("should prevent borrowing a non-existent book", async () => {
//       await expect(library.connect(addr1).borrowBook(99)).to.be.revertedWith("Book does not exist.");
//     });

//     it("should prevent borrowing a book that is already borrowed", async () => {
//       // Borrow as addr1
//       await library.connect(addr1).borrowBook(10);

//       // Try to borrow again as addr2
//       await expect(library.connect(addr2).borrowBook(10)).to.be.revertedWith("Book is not available for borrowing.");
//     });

//     it("should enforce a max of 5 borrowed books per user", async () => {
//       // Add more books
//       for (let i = 0; i < 5; i++) {
//         await library.addBook(100 + i, `Book${i}`, `Author${i}`);
//       }

//       // Borrow 5 books as addr1
//       for (let i = 0; i < 5; i++) {
//         await library.connect(addr1).borrowBook(100 + i);
//       }

//       // Attempt to borrow a sixth book
//       await expect(library.connect(addr1).borrowBook(11)).to.be.revertedWith(
//         "You cannot borrow more than 5 books."
//       );
//     });

//     it("should allow the user to return a borrowed book", async () => {
//       await library.connect(addr1).borrowBook(10);

//       // Return the book
//       await library.connect(addr1).returnBook(10);
//       const book = await library.getBook(10);
//       expect(book.isAvailable).to.equal(true);
//       expect(book.borrowedBy).to.equal(ethers.constants.AddressZero);

//       // Check borrowedCount decrement
//       const count = await library.borrowedCount(addr1.address);
//       expect(count).to.equal(0);
//     });

//     it("should fail if a user tries to return a book they haven't borrowed", async () => {
//       // Borrow as addr1
//       await library.connect(addr1).borrowBook(10);

//       // Attempt to return the book as addr2
//       await expect(library.connect(addr2).returnBook(10)).to.be.revertedWith(
//         "You are not the current borrower of this book."
//       );
//     });
//   });
// });