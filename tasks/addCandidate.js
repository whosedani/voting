const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-ethers");


task("addCandidate", "Owner can add candidates")
    .addParam("contract", "Contract address")
    .addParam("address", "Address of candidate")
    .setAction(async (taskArgs, hre) => {
        const voting = await hre.ethers.getContractAt("voting", (taskArgs.contract));
        const addCandidate = await voting.addCandidate(taskArgs.address);
        await addCandidate.wait();

        console.log(`Successfully added candidate with address ${taskArgs.address}`);
    });

module.exports = {};

// npx hardhat addCandidate --contract 0x0A0b262d944e193c2495767e25a6052C91CB4D76 --address 0xC7571653674Cd0Ae2E94AEd477b7Edc08D57aD48 --network rinkeby