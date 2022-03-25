const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-ethers");


task("createVoting", "Owner can create voting for three days")
    .addParam("contract", "Contract address")
    .setAction(async (taskArgs, hre) => {
        const voting = await hre.ethers.getContractAt("voting", (taskArgs.contract));
        const createVoting = await voting.createVoting();
        await createVoting.wait();

        console.log(`Voting successfully created`);
    });

module.exports = {};

// npx hardhat createVoting --contract 0x0A0b262d944e193c2495767e25a6052C91CB4D76 --network rinkeby