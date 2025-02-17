// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChainManagement {
    // Data Types & State Variables
    address public owner;
    uint256 public productCount;
    bool public contractPaused;

    // Structs
    struct Product {
        uint256 id;
        string name;
        uint256 price;
        address manufacturer;
        Status status;
        uint256 timestamp;
    }

    // Enums
    enum Status { Created, InTransit, Delivered }

    // Mappings
    mapping(uint256 => Product) public products;
    mapping(address => bool) public manufacturers;
    mapping(address => mapping(uint256 => bool)) public productOwnership;

    // Events
    event ProductCreated(uint256 indexed id, string name, address manufacturer);
    event ProductStatusUpdated(uint256 indexed id, Status status);
    event ManufacturerAdded(address indexed manufacturer);
    event ManufacturerRemoved(address indexed manufacturer);

    // Custom Errors
    error UnauthorizedAccess();
    error InvalidProduct();
    error ContractPaused();
    error InvalidManufacturer();

    // Constructor
    constructor() {
        owner = msg.sender;
        productCount = 0;
        contractPaused = false;
    }

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert UnauthorizedAccess();
        }
        _;
    }

    modifier onlyManufacturer() {
        if (!manufacturers[msg.sender]) {
            revert InvalidManufacturer();
        }
        _;
    }

    modifier whenNotPaused() {
        if (contractPaused) {
            revert ContractPaused();
        }
        _;
    }

    modifier validProductId(uint256 _productId) {
        if (_productId == 0 || _productId > productCount) {
            revert InvalidProduct();
        }
        _;
    }

    // Functions
    function addManufacturer(address _manufacturer) external onlyOwner {
        require(_manufacturer != address(0), "Invalid manufacturer address");
        require(!manufacturers[_manufacturer], "Manufacturer already exists");
        
        manufacturers[_manufacturer] = true;
        emit ManufacturerAdded(_manufacturer);
    }

    function removeManufacturer(address _manufacturer) external onlyOwner {
        require(manufacturers[_manufacturer], "Manufacturer doesn't exist");
        
        manufacturers[_manufacturer] = false;
        emit ManufacturerRemoved(_manufacturer);
    }

    function createProduct(string memory _name, uint256 _price) 
        external 
        onlyManufacturer 
        whenNotPaused 
    {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_price > 0, "Price must be greater than zero");

        productCount++;
        products[productCount] = Product({
            id: productCount,
            name: _name,
            price: _price,
            manufacturer: msg.sender,
            status: Status.Created,
            timestamp: block.timestamp
        });

        productOwnership[msg.sender][productCount] = true;
        emit ProductCreated(productCount, _name, msg.sender);
    }

    function updateProductStatus(uint256 _productId, Status _status) 
        external 
        onlyManufacturer 
        validProductId(_productId) 
        whenNotPaused 
    {
        require(productOwnership[msg.sender][_productId], "Not product owner");
        require(_status != Status.Created, "Cannot revert to Created status");
        
        Product storage product = products[_productId];
        require(product.status != _status, "Status already set");

        product.status = _status;
        product.timestamp = block.timestamp;
        
        emit ProductStatusUpdated(_productId, _status);
    }

    function toggleContractPause() external onlyOwner {
        contractPaused = !contractPaused;
    }

    // View Functions
    function getProduct(uint256 _productId) 
        external 
        view 
        validProductId(_productId) 
        returns (Product memory) 
    {
        return products[_productId];
    }

    function isManufacturer(address _address) external view returns (bool) {
        return manufacturers[_address];
    }
}