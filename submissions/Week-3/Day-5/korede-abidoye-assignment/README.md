# MobileRegistry Smart Contract

## Overview
The `MobileRegistry` smart contract is designed to manage a decentralized registry of mobile phones. It allows an authorized owner to register and deregister mobile phones securely. The contract ensures that only the owner can manage the registry and that each mobile phone entry is uniquely identified.

## Implementation Details

### Contract Ownership
The contract has an `owner` variable that is set during deployment. The `onlyOwner` modifier ensures that only the owner can register or deregister mobile phones.

### Structs
The `MobilePhone` struct defines the attributes of each mobile phone:
- **`id`** (`uint`): A unique identifier for each phone.
- **`model`** (`string`): The model of the mobile phone.
- **`serialNumber`** (`string`): The serial number of the mobile phone.
- **`isRegistered`** (`bool`): A status flag to track if the phone is registered.

### Mappings
A mapping `mobilePhones` stores each registered mobile phone, using an `id` as the key.

### Events
- **`MobilePhoneRegistered`**: Emitted when a new mobile phone is added.
- **`MobilePhoneDeregistered`**: Emitted when a mobile phone is removed from the registry.

### Modifiers
- **`onlyOwner`**: Ensures that only the contract owner can perform certain actions.
- **`mobilePhoneExists`**: Validates if a mobile phone exists before allowing deregistration.

### Functions
- **`registerMobilePhone(string memory _model, string memory _serialNumber)`**: Allows the owner to register a new mobile phone.
- **`deregisterMobilePhone(uint _id)`**: Allows the owner to mark a mobile phone as unregistered.

## Smart Contract Concepts Used

### Data Types
- `uint`: Used for unique phone IDs.
- `string`: Stores model and serial number information.
- `bool`: Tracks registration status.
- `address`: Stores the contract owner’s address.

### Constructor
- The constructor sets the contract deployer as the owner.

### Modifiers
- Used for access control and input validation to enhance security.

### Mappings
- Used to efficiently store and retrieve mobile phone records.

### Structs
- Organizes mobile phone attributes in a structured format.

### Error Handling
- `require` statements ensure valid function execution.


## AUTHOR

KOREDE ABIDOYE

Email: korexcoded@gmail.com