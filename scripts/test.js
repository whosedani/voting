const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");

async function main() {
    let voting = await (await ethers.getContractFactory("voting")).deploy();
    await voting.deployed();
    console.log(await voting.owner());
}

main() // npx hardhat run scripts\test.js --network localhost
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })