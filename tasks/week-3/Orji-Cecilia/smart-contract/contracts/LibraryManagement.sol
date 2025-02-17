// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

/**
 * @title LibraryManagement
 * @notice A simple contract to manage borrowing and returning books
 * in a decentralized library system.
 */
contract LibraryManagement {
    // ---------------------------- //
    //        DATA STRUCTURES      //
    // ---------------------------- //

    // Struct representing a Book with essential metadata
    struct Book {
        string title;
        string author;
        bool isAvailable;
        address borrowedBy; // Address of the current borrower (0x0 if not borrowed)
    }

    // ---------------------------- //
    //        STATE VARIABLES      //
    // ---------------------------- //

    address public owner; // Contract owner (library admin)
    string public libraryName;

    // Mapping from a unique book ID to the Book struct
    mapping(uint => Book) private books;

    // Keep track of how many books each user has borrowed
    mapping(address => uint) public borrowedCount;

    // Tracks the total number of books in the library
    uint public totalBooks;

    // ---------------------------- //
    //           MODIFIERS         //
    // ---------------------------- //

    // Restrict certain functions to only the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action.");
        _;
    }

    // ---------------------------- //
    //         CONSTRUCTOR         //
    // ---------------------------- //

    /**
     * @dev The constructor sets the contract owner and the library name
     * @param _libraryName The name of the library
     */
    constructor(string memory _libraryName) {
        owner = msg.sender;
        libraryName = _libraryName;
    }

    // ---------------------------- //
    //         OWNER ACTIONS       //
    // ---------------------------- //

    /**
     * @notice Adds a new book to the library.
     * @dev Only callable by the owner.
     * @param _bookId The unique ID for the book.
     * @param _title The title of the book.
     * @param _author The author of the book.
     */
    function addBook(
        uint _bookId,
        string memory _title,
        string memory _author
    ) external onlyOwner {
        require(bytes(_title).length > 0, "Book title cannot be empty.");
        require(bytes(_author).length > 0, "Author name cannot be empty.");
        require(!bookExists(_bookId), "A book with this ID already exists.");

        books[_bookId] = Book({
            title: _title,
            author: _author,
            isAvailable: true,
            borrowedBy: address(0)
        });

        totalBooks++;
    }

    /**
     * @notice Removes a book from the library by its ID.
     * @dev Only callable by the owner.
     * @param _bookId The unique ID of the book to remove.
     */
    function removeBook(uint _bookId) external onlyOwner {
        require(bookExists(_bookId), "Book does not exist.");

        // If the book is currently borrowed, revert
        require(
            books[_bookId].borrowedBy == address(0),
            "Cannot remove a book that is currently borrowed."
        );

        delete books[_bookId];
        totalBooks--;
    }

    // ---------------------------- //
    //         USER ACTIONS        //
    // ---------------------------- //

    /**
     * @notice Borrow a book from the library.
     * @param _bookId The ID of the book to borrow.
     */
    function borrowBook(uint _bookId) external {
        require(bookExists(_bookId), "Book does not exist.");
        require(books[_bookId].isAvailable, "Book is not available for borrowing.");
        require(borrowedCount[msg.sender] < 5, "You cannot borrow more than 5 books.");

        books[_bookId].isAvailable = false;
        books[_bookId].borrowedBy = msg.sender;
        borrowedCount[msg.sender]++;
    }

    /**
     * @notice Return a borrowed book.
     * @param _bookId The ID of the book to return.
     */
    function returnBook(uint _bookId) external {
        require(bookExists(_bookId), "Book does not exist.");
        require(books[_bookId].borrowedBy == msg.sender, "You are not the current borrower of this book.");

        books[_bookId].isAvailable = true;
        books[_bookId].borrowedBy = address(0);
        borrowedCount[msg.sender]--;
    }

    // ---------------------------- //
    //       HELPER FUNCTIONS      //
    // ---------------------------- //

    /**
     * @notice Checks if a book with the given ID exists.
     * @param _bookId The ID of the book.
     * @return True if the book exists, false otherwise.
     */
    function bookExists(uint _bookId) public view returns (bool) {
        return bytes(books[_bookId].title).length > 0;
    }

    /**
     * @notice Gets the details of a book by ID.
     * @param _bookId The ID of the book.
     * @return title The book's title.
     * @return author The book's author.
     * @return isAvailable Whether the book is available.
     * @return borrowedBy The address that borrowed the book (if any).
     */
    function getBook(uint _bookId)
        external
        view
        returns (
            string memory title,
            string memory author,
            bool isAvailable,
            address borrowedBy
        )
    {
        require(bookExists(_bookId), "Book does not exist.");
        Book memory b = books[_bookId];
        return (b.title, b.author, b.isAvailable, b.borrowedBy);
    }
}
