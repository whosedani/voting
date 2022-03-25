const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-ethers");


task("returnVoters", "Get array of voters")
    .addParam("contract", "Contract address")
    .setAction(async (taskArgs, hre) => {
        const voting = await hre.ethers.getContractAt("voting", (taskArgs.contract));
        const voters = await voting.returnVoters();
        console.log(voters);
    });

module.exports = {};

// npx hardhat returnVoters --contract 0x0A0b262d944e193c2495767e25a6052C91CB4D76 --network rinkeby