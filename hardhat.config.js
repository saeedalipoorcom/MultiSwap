require('@nomicfoundation/hardhat-toolbox');
// eslint-disable-next-line import/no-extraneous-dependencies
require('@nomiclabs/hardhat-etherscan');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    mumbai: {
      url: '',
      accounts: [''],
    },
  },
  gasReporter: {
    enabled: false,
    currency: 'USD',
  },
  etherscan: {
    apiKey: {
      polygonMumbai: '',
    },
  },
};
