#!/bin/bash

# Update and install Foundry
echo "Updating Foundry..."
foundryup

# Build the project
echo "Building the project..."
forge build

# Run the tests
echo "Running the tests..."
forge test -vv

# If tests fail, try with specific solc version
if [ $? -ne 0 ]; then
    echo "Retrying with specific solc version..."
    forge test -vv --use solc:0.8.10
fi 