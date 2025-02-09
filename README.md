# Introducing Opt-Chain

Opt-Chain records users' options trade details directly on-chain, ensuring transparency, immutability, and dispute-free settlement. By eliminating reliance on intermediaries, Opt-Chain allows anyone to verify trade terms trustlessly. This project leverages Foundry and the Flare blockchain to ensure that the pricing of options contracts is accurately reflected in real-time, based on trusted data provided by the FTSO (Flare Time Series Oracle).

## Key Functionalities:

- **Premium Calculation**: The option premium (price of the option) is calculated based on data from the FTSO oracle, reflecting real-time market prices.
  
- **Payment in FLR**: Users can pay the premium and execute trades in Flare's native coin (FLR), which ties the project closely to the Flare ecosystem and ensures seamless transactions within it.
  
- **Transparency and Immutability**: Trade details are recorded on-chain, meaning that anyone can verify the transaction and the terms of the trade, preventing disputes.

## Prerequisites

Ensure you have the following tools installed:

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Node.js](https://nodejs.org/en/download/)
- A Flare-compatible wallet (e.g., MetaMask) with testnet funds

## Deployed contracts:

**FTSOv2 Coston:** 0x3d893C53D9e8056135C26C8c638B76C8b60Df726

**Flare Testnet Coston2:** 0xf8Be4dcdB62F9546A370720939a2829B25DB1100


## Running the Application

1. Clone the repository:

   ```bash
   git clone https://github.com/sc21l2llauren/ftsov2-app
   ```

2. Install dependencies:

    ```bash
    forge soldeer install
    pip install web3, flask
    ```

3. In one terminal window, run the development server:

   ```bash
   npm run dev
   ```

   In another terminal window, run the Python script/app:

    ```bash
    python script/app.py
    ```
 

