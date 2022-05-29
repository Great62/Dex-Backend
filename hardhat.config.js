require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";
const PRIVATE_KEY = process.env.PRIVATE_FUJI_KEY;
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    localhost: {
      gas: 30000000,
    },
    fuji: {
      url: FUJI_RPC,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
};
