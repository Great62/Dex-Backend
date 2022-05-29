const { expectRevert } = require("@openzeppelin/test-helpers");
const { ethers } = require("hardhat");
const web3 = require("web3");
const { expect } = require("chai");
// const Dai = artifacts.require("../ERC20s/Dai.sol");
// const Avax = artifacts.require("../ERC20s/Avax.sol");
// const Bat = artifacts.require("../ERC20s/Bat.sol");
// const Klo = artifacts.require("../ERC20s/Klo.sol");
// const Dex = artifacts.require("../contracts/Dex.sol");

describe("Dex", (accounts) => {
  // let dai, avax, bat, klo, dex;
  //  const [trader1, trader2] = [accounts[1], accounts[2]];
  let [owner, trader1, trader2] = [0, 0, 0];

  // const [DAI, AVAX, BAT, KLO, ZRX] = ["DAI", "AVAX", "BAT", "KLO", "ZRX"].map(
  //   (ticker) => web3.utils.fromAscii(ticker)
  // );

  let Dai, Dex, Avax, Bat, Klo;
  let dai, dex, avax, bat, klo;

  const [DAI, AVAX, BAT, KLO, ZRX] = [
    "0x4441490000000000000000000000000000000000000000000000000000000000",
    "0x4156415800000000000000000000000000000000000000000000000000000000",
    "0x4241540000000000000000000000000000000000000000000000000000000000",
    "0x4b4c4f0000000000000000000000000000000000000000000000000000000000",
    "0x5a52580000000000000000000000000000000000000000000000000000000000",
  ];

  beforeEach(async () => {
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

    // [dai, avax, bat, klo] = await Promise.all([
    //   Dai.new(),
    //   Avax.new(),
    //   Bat.new(),
    //   Klo.new(),
    // ]);

    await Promise.all([
      dex.addToken(DAI, dai.address),
      dex.addToken(AVAX, avax.address),
      dex.addToken(BAT, bat.address),
      dex.addToken(KLO, klo.address),
    ]);

    [owner, trader1, trader2] = await ethers.getSigners();
    console.log(trader1.address);
    console.log(dex.address);

    const amount = web3.utils.toWei("1000");
    const seedTokenBalance = async (token, trader) => {
      await token.faucet(trader.address, amount);
      await token.connect(trader).approve(dex.address, amount);
    };
    await Promise.all(
      [dai, avax, bat, klo].map((token) => seedTokenBalance(token, trader1))
    );
    await Promise.all(
      [dai, avax, bat, klo].map((token) => seedTokenBalance(token, trader2))
    );
  });

  it("should deposit tokens to the contract", async () => {
    const amount = web3.utils.toWei("300");
    await dex.connect(trader2).deposit(amount, DAI);

    const balance = await dex.traderBalances(trader2.address, DAI);
    expect(balance.toString()).to.equal(amount);
  });

  it("should not be able to deposit to contract because token does not exist", async () => {
    expect(
      dex.connect(trader2).deposit(web3.utils.toWei("300"), ZRX)
    ).to.be.revertedWith("token does not exist");
  });

  //Withdraw function
  it("should withdraw the tokens from the sc and transfer it to the user", async () => {
    const amount = web3.utils.toWei("300");

    await dex.connect(trader2).deposit(amount, DAI);
    await dex.connect(trader2).withdraw(amount, DAI);

    [balance, balanceToken] = await Promise.all([
      dex.traderBalances(trader2.address, DAI),
      dai.balanceOf(trader2.address),
    ]);

    expect(balance).to.equal(0);
    expect(balanceToken.toString()).to.equal(web3.utils.toWei("1000"));
  });

  //UnHappy Withdraws
  it("should fail to withdraw because token no existo", async () => {
    const amount = web3.utils.toWei("300");

    await dex.connect(trader2).deposit(amount, DAI);

    expectRevert(
      dex.withdraw(amount, web3.utils.fromAscii("ZRX"), {
        from: trader2.address,
      }),
      "token does not exist"
    );
  });

  it("should not withdraw because not enough balance on dex", async () => {
    const amount = web3.utils.toWei("300");

    await dex.connect(trader2).deposit(amount, DAI);

    expectRevert(
      dex.withdraw(web3.utils.toWei("400"), DAI, {
        from: trader2.address,
      }),
      "balance to low"
    );
  });
});
