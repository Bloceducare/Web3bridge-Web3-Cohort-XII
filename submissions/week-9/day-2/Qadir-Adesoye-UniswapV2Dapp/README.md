# HolaPow Uniswap V2 Pair Viewer Dapp

![HolaPow Uniswap V2 Pair Viewer](https://uniswap-v2-pair-data-retrieval.vercel.app/) <!-- Replace with your project banner if available -->

Welcome to **HolaPow Uniswap V2 Pair Viewer Dapp**, a sleek and powerful decentralized application (Dapp) designed to explore Uniswap V2 pair data on the Ethereum mainnet. Built with modern web technologies like **Vite, TypeScript, Tailwind CSS, and Ethers.js**, this project offers a user-friendly interface to fetch pair details efficiently using **multicall techniques**. Additionally, it provides a curated list of Uniswap V2 pair addresses sourced from an external token list, making it easy to test and explore various pairs without leaving the app.

This README provides everything you need to understand, install, and run the project, complete with code examples and detailed explanations.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Contact](#contact)
- [License](#license)

## Project Overview

The **HolaPow Uniswap V2 Pair Viewer Dapp** is designed to simplify the process of inspecting Uniswap V2 liquidity pools. Whether you're a developer, trader, or blockchain enthusiast, this tool allows you to input a **Uniswap V2 pair contract address** and retrieve detailed information such as **token details, reserves, and total supply**—all in a visually appealing, responsive interface.

Beyond pair data retrieval, the app includes a unique feature: a **paginated list** of Uniswap V2 pair addresses sourced from `jab416171/uniswap-pairtokens`, complete with a **"Copy" button** for each address and a **"Load More" option** to explore further.

The UI is crafted with a modern **dark theme**, gradients, animations, and Tailwind CSS, ensuring a seamless experience across desktops and mobile devices. **No wallet connection is required**, as the app uses a standalone `JsonRpcProvider` via an Ethereum RPC endpoint (e.g., Infura or Alchemy).

## Features

### Pair Data Retrieval:
- Fetch token addresses (**token0** and **token1**).
- Retrieve reserves (`getReserves`).
- Display total supply of LP tokens.
- Show token details (**name, symbol, decimals**).

### Pair Address Explorer:
- View a paginated list of Uniswap V2 pair addresses.
- **Copy addresses** to clipboard with a single click.
- **Load additional addresses** dynamically with a "Load More" button.

### Modern UI Design:
- **Dark theme** with gradient backgrounds and smooth animations.
- Custom scrollbar and hover effects for interactivity.
- Fully **responsive layout** for all screen sizes.

### Efficiency:
- Uses **multicall techniques** to batch Ethereum contract calls, reducing network requests.

### No Wallet Dependency:
- Operates independently using a **JSON-RPC provider**.

## Tech Stack

- **Build Tool:** [Vite](https://vitejs.dev/) - Fast, modern build tool.
- **Language:** TypeScript - Type-safe JavaScript.
- **Blockchain Interaction:** [Ethers.js v6](https://docs.ethers.org/) - Ethereum library for contract calls.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework.
- **Routing:** [React Router DOM](https://reactrouter.com/) - Page navigation.
- **HTTP Requests:** [Axios](https://axios-http.com/) - Fetching pair list data.
- **Smart Contract ABIs:** [Uniswap V2 Core & Periphery](https://docs.uniswap.org/) - Interface definitions.


## Contact

For questions, suggestions, or collaboration, reach out to:

- **Qadir Adesoye**
- **Twitter:** [@HolaPow1](https://twitter.com/@HolaPow1)
- **Email:** [qadiradesoye@gmail.com](mailto:qadiradesoye@gmail.com)




## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
