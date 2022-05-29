// const web3 = require("web3");
//const web3 = require("@nomiclabs/hardhat-web3");

async function main() {
  const [DAI, AVAX, BAT, KLO] = [
    "0x4441490000000000000000000000000000000000000000000000000000000000",
    "0x4156415800000000000000000000000000000000000000000000000000000000",
    "0x4241540000000000000000000000000000000000000000000000000000000000",
    "0x4b4c4f0000000000000000000000000000000000000000000000000000000000",
  ];

  const [deployer] = await ethers.getSigners();
  console.log("deploying contracts with the address: " + deployer.address);

  const balance = await deployer.getBalance();
  console.log("balance of owner is: " + balance.toString());

  // deploying erc20s
  Dai = await ethers.getContractFactory("Dai");
  Avax = await ethers.getContractFactory("Avax");
  Bat = await ethers.getContractFactory("Bat");
  Klo = await ethers.getContractFactory("Klo");
  dai = await Dai.deploy();
  avax = await Avax.deploy();
  bat = await Bat.deploy();
  klo = await Klo.deploy();

  Dex = await ethers.getContractFactory("Dex");
  dex = await Dex.deploy();
  console.log("dex address is: " + dex.address);

  await dex.addToken(DAI, dai.address);
  console.log("finished adding tokens");
  await dex.addToken(AVAX, avax.address);
  await dex.addToken(BAT, bat.address);
  await dex.addToken(KLO, klo.address);

  const amount = web3.utils.toWei("1000");
  const seedTokenBalance = async (token, trader) => {
    await token.faucet(trader.address, amount);
    await token.connect(trader).approve(dex.address, amount);
    let ticker;
    if (token == dai) {
      ticker = DAI;
    } else if (token == avax) {
      ticker = AVAX;
    } else if (token == bat) {
      ticker = BAT;
    } else if (token == klo) {
      ticker = KLO;
    }
    await dex.connect(trader).deposit(amount, ticker);
  };
  console.log("Before seeding deployer");
  await [dai, avax, bat, klo].map((token) => seedTokenBalance(token, deployer));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
