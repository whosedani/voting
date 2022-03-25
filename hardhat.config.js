require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
require("@nomiclabs/hardhat-etherscan");
require('solidity-coverage');

require("./tasks/createVoting");
require("./tasks/vote");
require("./tasks/endVoting");
require("./tasks/addCandidate");
require("./tasks/withdrawCommission");
require("./tasks/returnCandidates");
require("./tasks/returnVoters");


module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`${process.env.RINKEBY_PRIVATE_KEY}`]
    },
    hardhat: {
      chainId: 1337
    }
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`
  }
};
