## I used the following concepts for this task

### Data Types
- Used `uint` for IDs
- `string` for table names
- `address` for user tracking
- `enum` for statuses

### Constructor
- Initializes the restaurant owner.

### Modifiers
- `onlyOwner`
- `tableExists`
- `onlyIfAvailable`
- `onlyIfBookedByUser`
- These restrict access to ensure security and correctness.

### Functions
- **`addTable`**: The owner adds a new table.
- **`bookTable`**: Users can book an available table.
- **`cancelBooking`**: Users can cancel their bookings.
- **`removeTable`**: The owner can remove a table.
- **`getTable`**: Returns details of a specific table.

### Mappings
- Tables are stored using a `mapping(uint => Table)`.

### Structs
- The `Table` struct holds table details such as ID, name, status, and assigned user.

### Error Handling
- `require` statements prevent invalid actions, such as booking an already reserved table or canceling an unbooked table.
