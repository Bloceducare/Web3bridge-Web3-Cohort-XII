// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TableBooking {
    address public owner;

    enum TableStatus { Available, Booked }

    struct Table {
        uint id;
        string tableName;
        TableStatus status;
        address bookedBy;
        bool exists;
    }

    mapping(uint => Table) public tables;
    uint public tableCount;

    event TableAdded(uint tableId, string tableName);
    event TableBooked(uint tableId, address bookedBy);
    event BookingCancelled(uint tableId);
    event TableRemoved(uint tableId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the restaurant owner can perform this action.");
        _;
    }

    modifier tableExists(uint tableId) {
        require(tables[tableId].exists, "Table does not exist.");
        _;
    }

    modifier onlyIfAvailable(uint tableId) {
        require(tables[tableId].status == TableStatus.Available, "Table is already booked.");
        _;
    }

    modifier onlyIfBookedByUser(uint tableId) {
        require(tables[tableId].bookedBy == msg.sender, "You are not the one who booked this table.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addTable(string memory _tableName) external onlyOwner {
        require(bytes(_tableName).length > 0, "Table name cannot be empty.");

        tableCount++;
        tables[tableCount] = Table(tableCount, _tableName, TableStatus.Available, address(0), true);

        emit TableAdded(tableCount, _tableName);
    }

    function bookTable(uint _tableId) external tableExists(_tableId) onlyIfAvailable(_tableId) {
        tables[_tableId].status = TableStatus.Booked;
        tables[_tableId].bookedBy = msg.sender;

        emit TableBooked(_tableId, msg.sender);
    }

    function cancelBooking(uint _tableId) external tableExists(_tableId) onlyIfBookedByUser(_tableId) {
        tables[_tableId].status = TableStatus.Available;
        tables[_tableId].bookedBy = address(0);

        emit BookingCancelled(_tableId);
    }

    function removeTable(uint _tableId) external onlyOwner tableExists(_tableId) {
        delete tables[_tableId];
        emit TableRemoved(_tableId);
    }

    function getTable(uint _tableId) external view tableExists(_tableId) returns (Table memory) {
        return tables[_tableId];
    }
}
