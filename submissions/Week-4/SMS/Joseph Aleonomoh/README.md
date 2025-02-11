# School Management Smart Contract

A Solidity smart contract for managing school operations including student enrollment, teacher registration, fee payments, and administrative functions.

## Features

- Student management (enrollment, removal)
- Teacher management (registration, removal)
- Fee management and payments
- Role-based access control (Principal, Teachers, Students)
- Automated fee collection and distribution

## Smart Contract Details

### Roles

- **Principal**: The administrator with highest privileges
- **Teachers**: Can register and remove students
- **Students**: Can pay fees and access student-specific functions

### Core Functionalities

#### Student Management
- Register new students
- Remove existing students
- Track fee payment status
- Maintain student records (name, age, class, gender)

#### Teacher Management
- Register new teachers
- Remove existing teachers
- Process teacher payments
- Maintain teacher records (name, age, class, gender)

#### Fee Management
- Set and update fee amounts
- Process student fee payments
- Withdraw collected fees
- Check payment status


## Development and Testing

### Prerequisites
- Node.js
- Hardhat
- Ethereum development environment

### Test Coverage

The contract includes comprehensive tests covering:
- Contract deployment
- Student enrollment
- Access control
- Fee management
- Event emissions

### Running Tests

```bash
npx hardhat test
```

## Events

The contract emits the following events:
- `TeacherRegistered`: When a new teacher is registered
- `StudentRegistered`: When a new student is enrolled
- `TeacherRemoved`: When a teacher is removed
- `StudentRemoved`: When a student is removed
- `FeesPaid`: When fees are paid by a student
- `PrincipalChanged`: When the principal address is updated

## Security Features

- Role-based access control
- Input validation
- Balance checks
- Address validation
- State validation