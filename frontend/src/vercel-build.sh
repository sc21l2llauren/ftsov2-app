#!/bin/sh

# Install Foundry (for Forge)
curl -L https://foundry.paradigm.xyz | bash
export PATH=$HOME/.foundry/bin:$PATH
foundryup

# Install Python
apt-get update && apt-get install -y python3 python3-pip

# Install Python dependencies
pip3 install web3 flask numpy pandas

# Run Next.js build
npm run build
