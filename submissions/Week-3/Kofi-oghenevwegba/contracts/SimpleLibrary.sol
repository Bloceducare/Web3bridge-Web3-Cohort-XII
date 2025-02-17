// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleLibrary {

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    struct Book {
        uint256 id;
        string bookName;
        bool isAvailable;
    }

    // To track if a user has borrowed a book...
    mapping(address =>uint) public hasBorrowed; 
    // To track the borrower by the ID of the book...
    mapping(uint256 => address) public bookToBorrower;
    Book[] public books;

    
    

    // Only admin can add a book...
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function addBook(uint256 _id, string memory _bookName) public onlyAdmin {
        books.push(Book(_id, _bookName, true));
    }

    function borrowBook(uint256 _id) public {
    // Check if the user has already borrowed a book
    require(hasBorrowed[msg.sender] == 0, "You can only borrow one book at a time.");
    // check if the book exists and is available...
    require(_id < books.length, "Book does not exist");
    require(books[_id].isAvailable, "Book is not available for borrowing");

    books[_id].isAvailable = false;
    bookToBorrower[_id] = msg.sender;
    hasBorrowed[msg.sender] = _id; 
    
    }

    function returnBook(uint256 _id) public {
    // They can't return a book that already exist...
    require(_id < books.length, "Book does not exist");
    require(bookToBorrower[_id] == msg.sender, "You did not borrow this book");
    // Make the book available...
    books[_id].isAvailable = true;
    delete bookToBorrower[_id];
    hasBorrowed[msg.sender] --;
    }


    function getTotalBooks() external view returns (uint) {
        return books.length;
    }

    function bookStatus(uint256 _id) public view returns (bool) {
    // first check if the book exists in the array...
    require(_id < books.length, "Book does not exist");
    return books[_id].isAvailable;
    }
    
}