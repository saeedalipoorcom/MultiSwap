/* eslint-disable prettier/prettier */
const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test Deploy', async function () {
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;

  let USDTContract;
  let USDCContract;
  let KingTokenContract;
  let SwapContract;

  let TX;
  let answer;

  let amountIn;
  let StableBeforeBalanceUser;
  let StableBeforeBalanceSwap;

  let KINGBeforeBalanceUser;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    //////////////////////////////////////////////////////////////////////////////////////////////
    // DEPLOYMENT
    //////////////////////////////////////////////////////////////////////////////////////////////
    // deployment USDTContract;
    const USDT = await ethers.getContractFactory('StableCoin');
    USDTContract = await USDT.deploy('USDT', 'USDT');
    await USDTContract.deployed();

    // deployment USDCContract;
    const USDC = await ethers.getContractFactory('StableCoin');
    USDCContract = await USDC.deploy('USDC', 'USDC');
    await USDCContract.deployed();

    // deployment KingTokenContract;
    const KING = await ethers.getContractFactory('KING');
    KingTokenContract = await KING.deploy('KING', 'KING');
    await KingTokenContract.deployed();

    // deployment SwapContract;
    const Swap = await ethers.getContractFactory('Swap');
    SwapContract = await Swap.deploy(KingTokenContract.address);
    await SwapContract.deployed();

    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET TOKEN PRICE FOR KING; 2
    //////////////////////////////////////////////////////////////////////////////////////////////
    // now set price of king token to 2;
    TX = await SwapContract.setKingTokenPrice(2);
    await TX.wait(1);

    //////////////////////////////////////////////////////////////////////////////////////////////
    // TRANSFER OWNERSHIP OF KING TO THE SWAPCONTRACT
    //////////////////////////////////////////////////////////////////////////////////////////////
    // now transfer ownership of KING to swapContract;
    TX = await KingTokenContract.transferOwnership(
      SwapContract.address
    );
    await TX.wait(1);

    //////////////////////////////////////////////////////////////////////////////////////////////
    // MINT TOKENS
    //////////////////////////////////////////////////////////////////////////////////////////////
    // usdt , addr1 , 1000;
    TX = await USDTContract.connect(addr1).mint1000TestToken();
    await TX.wait(1);

    // usdc , addr2 , 1000;
    TX = await USDCContract.connect(addr2).mint1000TestToken();
    await TX.wait(1);
  });

  describe('', () => {
    beforeEach(async () => {
      // set Amount To Swap;
      amountIn = ethers.utils.parseEther('50');
      //
      StableBeforeBalanceUser = await USDTContract.balanceOf(
        addr1.address
      );

      KINGBeforeBalanceUser = await KingTokenContract.balanceOf(
        addr1.address
      );
    });
    it('Swap amount USDT for King token, King token price @ 2 ; USER1', async () => {
      ///////////////////////////////////////////////
      // first we check how much KING token we will get for supply 100 USDT;
      ///////////////////////////////////////////////
      answer = await SwapContract.quoteFrom(
        USDTContract.address,
        amountIn
      );

      ///////////////////////////////////////////////
      // approve before swap;
      ///////////////////////////////////////////////
      TX = await USDTContract.connect(addr1).approve(
        SwapContract.address,
        amountIn
      );
      await TX.wait();

      ///////////////////////////////////////////////
      // we will ger revert for swap USDT => USDC ;
      ///////////////////////////////////////////////
      await expect(
        SwapContract.connect(addr1).swapMain(
          USDTContract.address,
          USDCContract.address,
          amountIn
        )
      ).to.be.revertedWith('KING token is not in swap');

      ///////////////////////////////////////////////
      // make swap;
      ///////////////////////////////////////////////
      await expect(
        SwapContract.connect(addr1).swapMain(
          USDTContract.address,
          KingTokenContract.address,
          amountIn
        )
      )
        .to.emit(SwapContract, 'SwapEvent')
        .withArgs(
          addr1.address,
          USDTContract.address,
          KingTokenContract.address,
          amountIn,
          answer
        );

      ///////////////////////////////////////////////
      // now check user balance for usdt and king token;
      ///////////////////////////////////////////////
      const expectedUSDTAfterBalance =
        Number(StableBeforeBalanceUser) - Number(amountIn);
      const expectedKINGAfterBalance =
        Number(KINGBeforeBalanceUser) + Number(answer);
      //
      expect(await USDTContract.balanceOf(addr1.address)).to.equal(
        expectedUSDTAfterBalance.toString()
      );
      //
      expect(
        await KingTokenContract.balanceOf(addr1.address)
      ).to.equal(expectedKINGAfterBalance.toString());

      console.log(
        `User swapped ${Number(
          amountIn / 10 ** 18
        ).toString()} USDT and in return received ${Number(
          answer / 10 ** 18
        ).toString()} KING token , rate 1:2`
      );

      ///////////////////////////////////////////////
      // now check swap contract balance USDT;
      ///////////////////////////////////////////////
      expect(
        await USDTContract.balanceOf(SwapContract.address)
      ).to.equal(amountIn.toString());
    });
  });

  describe('', () => {
    beforeEach(async () => {
      // set Amount To Swap;
      amountIn = ethers.utils.parseEther('100');
      //
      StableBeforeBalanceUser = await USDCContract.balanceOf(
        addr2.address
      );

      KINGBeforeBalanceUser = await KingTokenContract.balanceOf(
        addr2.address
      );
    });
    it('Swap amount USDC for King token, King token price @ 2 ; USER2', async () => {
      ///////////////////////////////////////////////
      // first we check how much KING token we will get for supply 100 USDT;
      ///////////////////////////////////////////////
      answer = await SwapContract.quoteFrom(
        USDCContract.address,
        amountIn
      );

      ///////////////////////////////////////////////
      // approve before swap;
      ///////////////////////////////////////////////
      TX = await USDCContract.connect(addr2).approve(
        SwapContract.address,
        amountIn
      );
      await TX.wait();

      ///////////////////////////////////////////////
      // we will ger revert for swap USDC => USDT ;
      ///////////////////////////////////////////////
      await expect(
        SwapContract.connect(addr2).swapMain(
          USDCContract.address,
          USDTContract.address,
          amountIn
        )
      ).to.be.revertedWith('KING token is not in swap');

      ///////////////////////////////////////////////
      // make swap;
      ///////////////////////////////////////////////
      await expect(
        SwapContract.connect(addr2).swapMain(
          USDCContract.address,
          KingTokenContract.address,
          amountIn
        )
      )
        .to.emit(SwapContract, 'SwapEvent')
        .withArgs(
          addr2.address,
          USDCContract.address,
          KingTokenContract.address,
          amountIn,
          answer
        );

      ///////////////////////////////////////////////
      // now check user balance for usdt and king token;
      ///////////////////////////////////////////////
      const expectedUSDCAfterBalance =
        Number(StableBeforeBalanceUser) - Number(amountIn);
      const expectedKINGAfterBalance =
        Number(KINGBeforeBalanceUser) + Number(answer);
      //
      expect(await USDCContract.balanceOf(addr2.address)).to.equal(
        expectedUSDCAfterBalance.toString()
      );
      //
      expect(
        await KingTokenContract.balanceOf(addr2.address)
      ).to.equal(expectedKINGAfterBalance.toString());

      console.log(
        `User swapped ${Number(
          amountIn / 10 ** 18
        ).toString()} USDC and in return received ${Number(
          answer / 10 ** 18
        ).toString()} KING token , rate 1:2`
      );

      ///////////////////////////////////////////////
      // now check swap contract balance USDC;
      ///////////////////////////////////////////////
      expect(
        await USDCContract.balanceOf(SwapContract.address)
      ).to.equal(amountIn.toString());
    });
  });

  describe('', () => {
    beforeEach(async () => {
      TX = await SwapContract.setKingTokenPrice(1);
      await TX.wait(1);

      // set Amount To Swap;
      amountIn = ethers.utils.parseEther('100');
      //
      StableBeforeBalanceUser = await USDCContract.balanceOf(
        addr2.address
      );

      KINGBeforeBalanceUser = await KingTokenContract.balanceOf(
        addr2.address
      );
    });
    it('Swap amount USDC for King token, NEW RATE, King token price @ 1 ; USER2', async () => {
      ///////////////////////////////////////////////
      // first we check how much KING token we will get for supply 100 USDT;
      ///////////////////////////////////////////////
      answer = await SwapContract.quoteFrom(
        USDCContract.address,
        amountIn
      );

      ///////////////////////////////////////////////
      // approve before swap;
      ///////////////////////////////////////////////
      TX = await USDCContract.connect(addr2).approve(
        SwapContract.address,
        amountIn
      );
      await TX.wait();

      ///////////////////////////////////////////////
      // we will ger revert for swap USDC => USDT ;
      ///////////////////////////////////////////////
      await expect(
        SwapContract.connect(addr2).swapMain(
          USDCContract.address,
          USDTContract.address,
          amountIn
        )
      ).to.be.revertedWith('KING token is not in swap');

      ///////////////////////////////////////////////
      // make swap;
      ///////////////////////////////////////////////
      await expect(
        SwapContract.connect(addr2).swapMain(
          USDCContract.address,
          KingTokenContract.address,
          amountIn
        )
      )
        .to.emit(SwapContract, 'SwapEvent')
        .withArgs(
          addr2.address,
          USDCContract.address,
          KingTokenContract.address,
          amountIn,
          answer
        );

      ///////////////////////////////////////////////
      // now check user balance for usdt and king token;
      ///////////////////////////////////////////////
      const expectedUSDCAfterBalance =
        Number(StableBeforeBalanceUser) - Number(amountIn);
      const expectedKINGAfterBalance =
        Number(KINGBeforeBalanceUser) + Number(answer);
      //
      expect(await USDCContract.balanceOf(addr2.address)).to.equal(
        expectedUSDCAfterBalance.toString()
      );
      //
      expect(
        await KingTokenContract.balanceOf(addr2.address)
      ).to.equal(expectedKINGAfterBalance.toString());

      console.log(
        `User swapped ${Number(
          amountIn / 10 ** 18
        ).toString()} USDC and in return received ${Number(
          answer / 10 ** 18
        ).toString()} KING token , rate 1:1`
      );

      ///////////////////////////////////////////////
      // now check swap contract balance USDC;
      ///////////////////////////////////////////////
      expect(
        await USDCContract.balanceOf(SwapContract.address)
      ).to.equal(amountIn.toString());
    });
  });

  describe('', () => {
    beforeEach(async () => {
      // set Amount To Swap;
      amountIn = ethers.utils.parseEther('100');

      //quote
      answer = await SwapContract.quoteFrom(
        USDCContract.address,
        amountIn
      );

      //approve
      TX = await USDCContract.connect(addr2).approve(
        SwapContract.address,
        amountIn
      );
      await TX.wait();

      //swap
      await expect(
        SwapContract.connect(addr2).swapMain(
          USDCContract.address,
          KingTokenContract.address,
          amountIn
        )
      )
        .to.emit(SwapContract, 'SwapEvent')
        .withArgs(
          addr2.address,
          USDCContract.address,
          KingTokenContract.address,
          amountIn,
          answer
        );

      //;
      expect(
        await KingTokenContract.balanceOf(addr2.address)
      ).to.equal(ethers.utils.parseEther('50'));

      //
      StableBeforeBalanceUser = await USDCContract.balanceOf(
        addr2.address
      );

      //
      KINGBeforeBalanceUser = await KingTokenContract.balanceOf(
        addr2.address
      );

      // set Amount To Swap 50 KING;
      amountIn = ethers.utils.parseEther('50');
    });
    it('Swap amount USDC for King token, NEW RATE, King token price @ 1 ; USER2', async () => {
      ///////////////////////////////////////////////
      // first we check how much USDC token we will get for supply 50 KING;
      ///////////////////////////////////////////////
      answer = await SwapContract.quoteFrom(
        KingTokenContract.address,
        amountIn
      );

      ///////////////////////////////////////////////
      // approve before swap;
      ///////////////////////////////////////////////
      TX = await KingTokenContract.connect(addr2).approve(
        SwapContract.address,
        amountIn
      );
      await TX.wait();

      ///////////////////////////////////////////////
      // make swap;
      ///////////////////////////////////////////////
      await expect(
        SwapContract.connect(addr2).swapMain(
          KingTokenContract.address,
          USDCContract.address,
          amountIn
        )
      )
        .to.emit(SwapContract, 'SwapEvent')
        .withArgs(
          addr2.address,
          KingTokenContract.address,
          USDCContract.address,
          amountIn,
          answer
        );
      ///////////////////////////////////////////////
      // now check user balance for usdt and king token;
      ///////////////////////////////////////////////
      //
      expect(await USDCContract.balanceOf(addr2.address)).to.equal(
        ethers.utils.parseEther('1000')
      );
      //
      expect(
        await KingTokenContract.balanceOf(addr2.address)
      ).to.equal(ethers.utils.parseEther('0'));
      //
      console.log(
        `User swapped ${Number(
          amountIn / 10 ** 18
        ).toString()} KING and in return received ${Number(
          answer / 10 ** 18
        ).toString()} USDC token , rate 1:2`
      );
      ///////////////////////////////////////////////
      // now check swap contract balance USDC;
      ///////////////////////////////////////////////
      expect(
        await USDCContract.balanceOf(SwapContract.address)
      ).to.equal(ethers.utils.parseEther('0'));
    });
  });
});
