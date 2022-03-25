const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-ethers");

task("endVoting", "Anybody can end voting if three days passed (90% of funds will be sended to the winner)")
    .addParam("contract", "Contract address")
    .setAction(async (taskArgs, hre) => {
        const voting = await hre.ethers.getContractAt("voting", (taskArgs.contract));
        const endVoting = await voting.endVoting();
        await endVoting.wait();

        console.log(`Successfully ended voting`);
    });

module.exports = {};

// npx hardhat endVoting --contract 0x0A0b262d944e193c2495767e25a6052C91CB4D76 --network rinkeby