// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// Standard ERC20 token and its interface
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

// add 'onlyOwner()' to method definition to allow operation only for owner
import '@openzeppelin/contracts/access/Ownable.sol';

// lib to convert uint256 to string (1.toString())
import '@openzeppelin/contracts/utils/Strings.sol';

// kind of 'counter' type
import '@openzeppelin/contracts/utils/Counters.sol';

import './Satisfaction.sol';

contract TheGrandMasterTokenCustodian is ERC20, Ownable {
    // allow uint256.toString()
    using Strings for uint256;
    
    // ref to token to mint when deposit ends
    Satisfaction private _satisfaction;

    // constants
    uint constant private _secondsInYear = 31556952;
    // uint constant private _ethSatisfactionPerSecond = 1 * 10 ** 18; // wei
    uint constant private _minimumHoldSeconds = 1;// * 60; // * 60 * 24; // 1 day is a minimum duration
    
    /*  The next is moved to a mapping _allowedToBePatroned
    */
    /*
    // fee, set on deployment
    uint immutable _fee = 1; // in ether ? TODO set it from ctor arg
    // default satisfaction for eth
    uint immutable _ethSatisfactionPerSecond = 1 * 10 ** 18; // wei
    */
    
    // all deposited values
    // ownerAddress => tokenAddress => tokenAmount
    mapping(address => mapping(address => PatronageRecord)) private _patronage; // double iterable?
    // structs
    struct PatronageRecord {
        address token; // this is needed to return later
        uint amount;
        uint startDate;
        uint allowedToWithdrawFrom;
    }

    // coins possible to stake
    mapping(address => StakeConfig) private _allowedToBePatroned; // iterable?
    struct StakeConfig {
        address token; // this is needed to return later
        bool allowed;
        uint satisfactionPerSecond;
    }
    
    // events
    event PatronageStarted(address indexed owner, address indexed token, uint amount, uint totalAmount, uint startDate, uint allowedToWithdrawFrom);
    event PatronageEnded(address indexed owner, address indexed token, uint totalAmount, uint startDate, uint secondsPassed, uint satisfactionEarned);
    
    // fee is in wei, most likely
    constructor(Satisfaction satisfaction/*, uint fee, uint ethSatisfactionPerSec*/) // TODO set fee on deployment - Q: convert from input to coin (wei to eth, if on eth; but what about matic?)
        ERC20("The Grand Master Token Custodian", "TGMTC") {
        // assign a token to grant later
        _satisfaction = satisfaction;
        // how to grant a minter access here? if possible, as TGMTC is not yet deployed
        
        /* obsolete */
        // set immutable
        // _fee = fee;
        
        // satisfaction for staking eth
        // _ethSatisfactionPerSecond = ethSatisfactionPerSec;
    }
    
    /* PUBLIC FUNCTIONS */

    function getEthAllowance(address owner, address spender) public returns (uint) {
        require(false, _errorNotImplemented);
        return 0;
        // return getAllowance(address(this), owner, spender);
    }
    
    function getAllowance(address token, address owner, address spender) public view returns (uint) {
        return IERC20(token).allowance(owner, spender);
    }

    function stakeEth(uint amount) public payable {
        require(false, _errorNotImplemented);
        // stake(address(this), amount);
    }
    
    function stake(address token, uint amount) public payable {
        // require(msg.value >= _fee, "Donation to perform this operation is required.");
        
        // transfer
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        // save to _patronage TODO check
        uint startDate = block.timestamp;
        mapping(address => PatronageRecord) storage patronageMap = _patronage[msg.sender]; // token => PatronageRecord
        // doing so is not a good idea, as we'll mix all the previous stakes
        patronageMap[token].amount += amount;
        patronageMap[token].startDate = startDate;
        patronageMap[token].allowedToWithdrawFrom = startDate + _minimumHoldSeconds;
        
        emit PatronageStarted(msg.sender, token, amount, patronageMap[token].amount, startDate, patronageMap[token].allowedToWithdrawFrom);
    }

    function unstakeEth() public payable {
        unstake(address(this));
    }
    
    function unstake(address token) public payable {

        /*
        The next code is vulnerable for reEntrancy.
        To fix it, there're two ways:
        - update all variables that are engaged in 'require' statements BEFORE token is transferred;
        - use noReentrant modifier (it should be implemented somewhere):
            bool internal locked;
            modifier noReentrant() {
                require(!locked, "No re-entrancy");
                locked = true;
                _; // this executes function under modifier
                locked = false;
            }

        */

        mapping(address => PatronageRecord) storage patronageMap = _patronage[msg.sender];
        require(patronageMap[token].amount > 0, "You have not deposited a penny of this token.");
        require(patronageMap[token].allowedToWithdrawFrom <= block.timestamp, "It's a bit early to withraw this token.");
        
        // temp var to use later
        uint totalAmount = patronageMap[token].amount;
        uint startDate = patronageMap[token].startDate;
        uint secondsPassed = block.timestamp - startDate;
        
        // transfer
        IERC20(token).transfer(msg.sender, totalAmount);
        
        // clear PatronageRecord
        delete patronageMap[token];

        /*
        // transfer satisfaction
        uint satisfactionEarned = secondsPassed * _satisfactionPerSecond;
        _satisfaction.mint(msg.sender, satisfactionEarned);
        
        emit PatronageEnded(msg.sender, token, totalAmount, startDate, secondsPassed, satisfactionEarned);
        */
    }

    /* GETTERS */

    function getSatisfactionAddress() public view returns (address) {
        return address(_satisfaction);
    }
    
    /* PRIVATE FUNCTIONS */

    function _allowMore(uint amount) private pure returns (string memory) {
        return string(abi.encodePacked("You do not trust me. Please, allow to transfer ", amount.toString()));
    }

    /* ERROR MESSAGES */
    string private _errorNotImplemented = "Not implemented.";
}