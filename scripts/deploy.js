// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat');

async function main() {
  // deployment USDTContract;
  const USDT = await ethers.getContractFactory('StableCoin');
  const USDTContract = await USDT.deploy('USDT', 'USDT');
  await USDTContract.deployed();

  console.log('USDTContract deployed to:', USDTContract.address);

  // deployment USDCContract;
  const USDC = await ethers.getContractFactory('StableCoin');
  const USDCContract = await USDC.deploy('USDC', 'USDC');
  await USDCContract.deployed();

  console.log('USDCContract deployed to:', USDCContract.address);

  // deployment KingTokenContract;
  const KING = await ethers.getContractFactory('KING');
  const KingTokenContract = await KING.deploy('KING', 'KING');
  await KingTokenContract.deployed();

  console.log(
    'KingTokenContract deployed to:',
    KingTokenContract.address
  );

  // deployment SwapContract;
  const Swap = await ethers.getContractFactory('Swap');
  const SwapContract = await Swap.deploy(KingTokenContract.address);
  await SwapContract.deployed();

  console.log('SwapContract deployed to:', SwapContract.address);

  // now set price of king token to 2;
  TX = await SwapContract.setKingTokenPrice(2);
  await TX.wait(1);

  // now transfer ownership of KING to swapContract;
  TX = await KingTokenContract.transferOwnership(
    SwapContract.address
  );
  await TX.wait(1);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
