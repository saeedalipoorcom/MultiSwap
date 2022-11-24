// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface KingInterface {
    function mintKING(address _to, uint256 _amount) external;

    function burnKING(address _to, uint256 _amount) external;
}
