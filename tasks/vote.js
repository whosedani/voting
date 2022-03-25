const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-ethers");
const { parseEther } = require("ethers/lib/utils");

task("vote", "Vote for any candidate (it costs 0.01 ETH)")
    .addParam("contract", "Contract address")
    .addParam("address", "Address of candidate")
    .setAction(async (taskArgs, hre) => {
        const voting = await hre.ethers.getContractAt("voting", (taskArgs.contract));
        const value = { value: parseEther("0.01") };
        const vote = await voting.vote(taskArgs.address, value);
        await vote.wait();

        console.log(`Successfully voted for ${taskArgs.address}`);
    });

module.exports = {};

// npx hardhat vote --contract 0x0A0b262d944e193c2495767e25a6052C91CB4D76 --address 0xB79cA96C0F63924320C69e5907006dbE5ca7adE6 --network rinkeby