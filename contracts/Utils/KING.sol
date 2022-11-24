// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract KING is ERC20, Ownable {
    constructor(string memory _name, string memory _symbol)
        ERC20(_name, _symbol)
    {}

    function mintKING(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }

    function burnKING(address _to, uint256 _amount) external onlyOwner {
        _burn(_to, _amount);
    }
}
