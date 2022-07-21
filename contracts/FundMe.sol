// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__InsufficientFunds();
error FundMe__NotOwner();
error FundMe__WithdrawFailed();

contract FundMe {
    event Fund(
        address indexed funder,
        uint256 indexed amount,
        uint256 indexed timestamp
    );
    event Withdraw(uint256 indexed amount, uint256 indexed timestamp);

    using PriceConverter for uint256;

    AggregatorV3Interface private immutable priceFeed;
    address[] private funders;
    mapping(address => uint256) public getFundsOfFunder;
    uint256 private constant MIN_USD = 20 * 10**18;
    address private immutable owner;

    modifier OnlyOwner() {
        if (msg.sender != owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address priceFeedAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        if (msg.value.getConversionRate(priceFeed) < MIN_USD)
            revert FundMe__InsufficientFunds();
        funders.push(msg.sender);
        getFundsOfFunder[msg.sender] += msg.value;
        emit Fund(msg.sender, msg.value, block.timestamp);
    }

    function withdraw() public payable OnlyOwner {
        for (uint256 i = 0; i < funders.length; ) {
            address funder = funders[i];
            getFundsOfFunder[funder] = 0;
            unchecked {
                i++;
            }
        }
        funders = new address[](0);

        (bool isSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!isSuccess) revert FundMe__WithdrawFailed();
        emit Withdraw(address(this).balance, block.timestamp);
    }

    function totalBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getMinimumUSD() public pure returns (uint256) {
        return MIN_USD;
    }

    function getEthPrice() external view returns (uint256) {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        return uint256(answer * 1e10);
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getFunder(uint256 _index) public view returns (address) {
        return funders[_index];
    }

    function getFunders() public view returns (address[] memory) {
        return funders;
    }
}
