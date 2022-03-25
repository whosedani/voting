const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-ethers");


task("withdraw", "Owner can withdraw commission to any address")
    .addParam("contract", "Contract address")
    .addParam("address", "Address for sending commission")
    .setAction(async (taskArgs, hre) => {
        const voting = await hre.ethers.getContractAt("voting", (taskArgs.contract));
        const withdraw = await voting.withdrawCommission(taskArgs.address);
        await withdraw.wait();

        console.log(`Successfully withdrawed to ${taskArgs.address}`);
    });

module.exports = {};

// npx hardhat withdraw --contract 0x0A0b262d944e193c2495767e25a6052C91CB4D76 --address 0xC7571653674Cd0Ae2E94AEd477b7Edc08D57aD48 --network rinkeby