// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./Utils/KingInterface.sol";

contract Swap {
    using SafeERC20 for IERC20;

    event SwapEvent(
        address indexed sender,
        address fromToken,
        address toToken,
        uint256 fromAmount,
        uint256 toAmount
    );

    //
    address private immutable KingToken;
    // public visibility will create getter function so we don't need to create new function to get price of KING token;
    uint256 public KingTokenPrice;

    constructor(address _KingToken) {
        KingToken = _KingToken;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // this is price that can get change to test our swap; we can get real price from oracle;
    //////////////////////////////////////////////////////////////////////////////////////////////
    function setKingTokenPrice(uint256 _newKingTokenPrice) external {
        KingTokenPrice = _newKingTokenPrice;
    }

    function swapMain(
        address _fromToken,
        address _toToken,
        uint256 _fromAmount
    ) external {
        require(
            _fromToken == KingToken || _toToken == KingToken,
            "KING token is not in swap"
        );
        require(_fromAmount != 0, "input amount is 0");
        require(_fromToken != _toToken, "same address for tokens");

        //////////////////////////////////////////////////////////////////////////////////////////////
        // first we get output amount for user; how much user can get back in return after swap;
        // for KING token we have unlimited balance but for other tokens we need to check balance;
        //////////////////////////////////////////////////////////////////////////////////////////////
        uint256 _outAmount = quoteFrom(_fromToken, _fromAmount);
        if (_toToken != KingToken) {
            require(
                IERC20(_toToken).balanceOf(address(this)) >= _outAmount,
                "no enough balance for ToToken"
            );
        }

        //////////////////////////////////////////////////////////////////////////////////////////////
        // sell KING token, we will burn it.
        //////////////////////////////////////////////////////////////////////////////////////////////
        if (_fromToken == KingToken) {
            KingInterface(KingToken).burnKING(msg.sender, _fromAmount);
        } else {
            SafeERC20.safeTransferFrom(
                IERC20(_fromToken),
                msg.sender,
                address(this),
                _fromAmount
            );
        }

        //////////////////////////////////////////////////////////////////////////////////////////////
        // buy KING token, we will mint it.
        //////////////////////////////////////////////////////////////////////////////////////////////

        if (_toToken == KingToken) {
            KingInterface(KingToken).mintKING(msg.sender, _outAmount);
        } else {
            SafeERC20.safeTransfer(IERC20(_toToken), msg.sender, _outAmount);
        }

        // finally emit event
        emit SwapEvent(
            msg.sender,
            _fromToken,
            _toToken,
            _fromAmount,
            _outAmount
        );
    }

    /**
     * @notice we use this function calculate output amount for swap;
     * if fromToken is KING => we send back stable coin;
     * if fromToken is stableCoin => output = valueOfToken / KingTokenPrice;
     * @param _fromToken The address of token
     * @param _fromAmount The address of token
     */
    function quoteFrom(address _fromToken, uint256 _fromAmount)
        public
        view
        returns (uint256 _shouldGetOut)
    {
        //////////////////////////////////////////////////////////////////////////////////////////////
        // we need _fromAmount greater than 1;
        //////////////////////////////////////////////////////////////////////////////////////////////
        require(_fromAmount >= 1, "input amount is < 1");

        //////////////////////////////////////////////////////////////////////////////////////////////
        // senario A sell KING ,senario B buy KING;
        //////////////////////////////////////////////////////////////////////////////////////////////
        _fromToken == KingToken
            ? _shouldGetOut = getValueOfTokens(_fromToken, _fromAmount)
            : _shouldGetOut =
            getValueOfTokens(_fromToken, _fromAmount) /
            getTokenPrice(KingToken);
    }

    /**
     * @notice we use this function to get value for amounts of token;
     * @param _inputToken The address of token
     * @param _inputAmount The address of token
     */
    function getValueOfTokens(address _inputToken, uint256 _inputAmount)
        internal
        view
        returns (uint256)
    {
        return _inputAmount * getTokenPrice(_inputToken);
    }

    /**
     * @notice we use this function to get price of token; stable coins price hardcoded to 1;
     * @param _tokenAddress The address of token
     */
    function getTokenPrice(address _tokenAddress)
        internal
        view
        returns (uint256)
    {
        uint256 price;
        _tokenAddress == KingToken ? price = KingTokenPrice : price = 1;
        return price;
    }
}
