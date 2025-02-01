// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract ProductManager {
    // Define a struct for a Product
    struct Product {
        uint256 id;           // Unique identifier for the product
        string name;          // Name of the product
        string description;   // Detailed description of the product
        uint256 price;        // Price in wei
        bool isActive;        // Status indicating if the product is active (not archived)
    }

    // State variables
    address public manager;
    uint256 public productCount; // Counter for product IDs

    // Mappings to store products by their unique IDs
    mapping(uint256 => Product) public products;

    // Events for logging actions
    event ProductAdded(uint256 indexed id, string name, uint256 price);
    event ProductUpdated(uint256 indexed id, string name, uint256 price);
    event ProductArchived(uint256 indexed id);

    // Modifier to restrict access to only the product manager
    modifier onlyManager() {
        require(msg.sender == manager, "Access denied: Only manager allowed");
        _;
    }

    // Modifier to check if a product exists
    modifier productExists(uint256 _id) {
        require(_id > 0 && _id <= productCount, "Product does not exist");
        _;
    }

    // Constructor sets the deployer as the product manager
    constructor() {
        manager = msg.sender;
        productCount = 0;
    }

    /// @notice Adds a new product to the management system
    /// @param _name The name of the product
    /// @param _description A short description of the product
    /// @param _price The price of the product in wei
    function addProduct(
        string memory _name,
        string memory _description,
        uint256 _price
    ) public onlyManager {
        // Validate inputs: Name must not be empty and price must be positive
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(_price > 0, "Price must be greater than zero");

        productCount++;
        products[productCount] = Product({
            id: productCount,
            name: _name,
            description: _description,
            price: _price,
            isActive: true
        });

        emit ProductAdded(productCount, _name, _price);
    }

    /// @notice Updates an existing product's details if it is active
    /// @param _id The product id to update
    /// @param _name The new name of the product
    /// @param _description The new description of the product
    /// @param _price The new price of the product in wei
    function updateProduct(
        uint256 _id,
        string memory _name,
        string memory _description,
        uint256 _price
    ) public onlyManager productExists(_id) {
        Product storage product = products[_id];
        require(product.isActive, "Cannot update an archived product");
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(_price > 0, "Price must be greater than zero");

        product.name = _name;
        product.description = _description;
        product.price = _price;

        emit ProductUpdated(_id, _name, _price);
    }

    /// @notice Archives (soft-deletes) a product so that it is no longer active
    /// @param _id The product id to archive
    function archiveProduct(uint256 _id) public onlyManager productExists(_id) {
        Product storage product = products[_id];
        require(product.isActive, "Product is already archived");

        product.isActive = false;

        emit ProductArchived(_id);
    }
}
