// const web3 = require("web3");
//const web3 = require("@nomiclabs/hardhat-web3");

async function main() {
  const SIDE = {
    BUY: 0,
    SELL: 1,
  };

  const [DAI, AVAX, BAT, KLO, ZRX] = [
    "0x4441490000000000000000000000000000000000000000000000000000000000",
    "0x4156415800000000000000000000000000000000000000000000000000000000",
    "0x4241540000000000000000000000000000000000000000000000000000000000",
    "0x4b4c4f0000000000000000000000000000000000000000000000000000000000",
    "0x5a52580000000000000000000000000000000000000000000000000000000000",
  ];

  const [deployer, trader1, trader2, trader3, trader4] =
    await ethers.getSigners();
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

  //Faire propre comme ca:
  //await Promise.all(
  //  [Dai, Avax, Bat, Klo, Dex].map((contract) => deployer.deploy(contract))
  //);
  //const [dai, avax, bat, klo, dex] = await Promise.all(
  //  [Dai, Avax, Bat, Klo, Dex].map((contract) => contract.deployed())
  //);

  await Promise.all([
    dex.addToken(DAI, dai.address),
    dex.addToken(AVAX, avax.address),
    dex.addToken(BAT, bat.address),
    dex.addToken(KLO, klo.address),
  ]);

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
  await Promise.all(
    [dai, avax, bat, klo].map((token) => seedTokenBalance(token, trader1))
  );
  await Promise.all(
    [dai, avax, bat, klo].map((token) => seedTokenBalance(token, trader2))
  );
  await Promise.all(
    [dai, avax, bat, klo].map((token) => seedTokenBalance(token, trader3))
  );
  await Promise.all(
    [dai, avax, bat, klo].map((token) => seedTokenBalance(token, trader4))
  );

  const increaseTime = async (seconds) => {
    await web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [seconds],
        id: 0,
      },
      () => {}
    );
    await web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_mine",
        params: [],
        id: 0,
      },
      () => {}
    );
  };

  //create trades
  await dex.connect(trader1).createLimitOrder(AVAX, 1000, 10, SIDE.BUY);
  await dex.connect(trader2).createMarketOrder(AVAX, 1000, SIDE.SELL);
  await increaseTime(1);
  await dex.connect(trader1).createLimitOrder(AVAX, 1200, 11, SIDE.BUY);
  await dex.connect(trader2).createMarketOrder(AVAX, 1200, SIDE.SELL);
  await increaseTime(1);
  await dex.connect(trader1).createLimitOrder(AVAX, 1200, 15, SIDE.BUY);
  await dex.connect(trader2).createMarketOrder(AVAX, 1200, SIDE.SELL);
  await increaseTime(1);
  await dex.connect(trader1).createLimitOrder(AVAX, 1500, 14, SIDE.BUY);
  await dex.connect(trader2).createMarketOrder(AVAX, 1500, SIDE.SELL);
  await increaseTime(1);
  await dex.connect(trader1).createLimitOrder(AVAX, 2000, 12, SIDE.BUY);
  await dex.connect(trader2).createMarketOrder(AVAX, 2000, SIDE.SELL);

  await dex.connect(trader1).createLimitOrder(BAT, 1000, 2, SIDE.BUY);
  await dex.connect(trader2).createMarketOrder(BAT, 1000, SIDE.SELL);
  await increaseTime(1);
  await dex.connect(trader1).createLimitOrder(BAT, 500, 4, SIDE.BUY);
  await dex.connect(trader2).createMarketOrder(BAT, 500, SIDE.SELL);
  await increaseTime(1);
  await dex.connect(trader1).createLimitOrder(BAT, 800, 2, SIDE.BUY);
  await dex.connect(trader2).createMarketOrder(BAT, 800, SIDE.SELL);
  await increaseTime(1);
  await dex.connect(trader1).createLimitOrder(BAT, 1200, 6, SIDE.BUY);
  await dex.connect(trader2).createMarketOrder(BAT, 1200, SIDE.SELL);

  //create orders
  await Promise.all([
    dex.connect(trader1).createLimitOrder(AVAX, 1400, 10, SIDE.BUY),
    dex.connect(trader2).createLimitOrder(AVAX, 1200, 11, SIDE.BUY),
    dex.connect(trader2).createLimitOrder(AVAX, 1000, 12, SIDE.BUY),

    dex.connect(trader1).createLimitOrder(BAT, 2000, 5, SIDE.BUY),
    dex.connect(trader1).createLimitOrder(BAT, 3000, 4, SIDE.BUY),
    dex.connect(trader2).createLimitOrder(BAT, 500, 6, SIDE.BUY),

    dex.connect(trader1).createLimitOrder(KLO, 4000, 12, SIDE.BUY),
    dex.connect(trader1).createLimitOrder(KLO, 3000, 13, SIDE.BUY),
    dex.connect(trader2).createLimitOrder(KLO, 500, 14, SIDE.BUY),

    dex.connect(trader3).createLimitOrder(AVAX, 2000, 16, SIDE.SELL),
    dex.connect(trader4).createLimitOrder(AVAX, 3000, 15, SIDE.SELL),
    dex.connect(trader4).createLimitOrder(AVAX, 500, 14, SIDE.SELL),

    dex.connect(trader3).createLimitOrder(BAT, 4000, 10, SIDE.SELL),
    dex.connect(trader3).createLimitOrder(BAT, 2000, 9, SIDE.SELL),
    dex.connect(trader4).createLimitOrder(BAT, 800, 8, SIDE.SELL),

    dex.connect(trader3).createLimitOrder(KLO, 1500, 23, SIDE.SELL),
    dex.connect(trader3).createLimitOrder(KLO, 1200, 22, SIDE.SELL),
    dex.connect(trader4).createLimitOrder(KLO, 900, 21, SIDE.SELL),
  ]);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
