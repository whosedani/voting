const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [owner] = await ethers.getSigners();

  const voting = await (await ethers.getContractFactory("voting", owner)).deploy();
  await voting.deployed();
  console.log(voting.address);
}

main() // npx hardhat run scripts/deploy.js --network rinkeby
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
