const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-ethers");


task("returnCandidates", "Get array of candidates")
    .addParam("contract", "Contract address")
    .setAction(async (taskArgs, hre) => {
        const voting = await hre.ethers.getContractAt("voting", (taskArgs.contract));
        const candidates = await voting.returnCandidates();
        console.log(candidates);
    });

module.exports = {};

// npx hardhat returnCandidates --contract 0x0A0b262d944e193c2495767e25a6052C91CB4D76 --network rinkeby