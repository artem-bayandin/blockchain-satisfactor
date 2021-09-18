// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// Standard ERC20 token
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Satisfaction is ERC20 {
    /* MINTER */
    /*  For now I allow a single minter. Initially it's a contract owner,
        but when TGMTC contract is deployed, minter roles goes to TGMTC.
        What leads to a situation, when TGMTC is the only to mint Satisfaction.
        Other way of managing minters
            - mapping(address => bool) _minters
            - function addMinter(address minter) public onlyOwner() {
                _minters[minter] = true;
            }
            - function removeMinter(address minter) public onlyOwner() {
                delete _minters[minter];
            }
        Additionally, some require(...) might be added instead of onlyOwner() notation,
        for example we may allow all the minters to add/remove a minter,
        but anyway, it'd be nice to restrict removing owner from the list.
    */
    // future address of a Grand Master
    address private _minter;
    // minter might be changed once when Grand Master is created
    bool private _minterChanged = false;

    constructor()
        ERC20("Your Satisfaction", "STSFCTN") {
        _minter = msg.sender;
    }

    event MinterChanged(address oldMinter, address newMinter);

    /* PUBLIC FUNCTIONS */
    
    // change minter once, assign it to Grand Master, when the latter is deployed
    function grantMinterAccess(address newMinterAddress) public returns (bool) {
        require(!_minterChanged, _errorMinterChanged);
        require(msg.sender == _minter, _errorAccessDenied);
        require(newMinterAddress != _minter, _errorMinterIsMinter);
        
        // do the job
        address oldMinter = _minter;
        _minter = newMinterAddress;
        _minterChanged = true;
        emit MinterChanged(oldMinter, newMinterAddress);
        return true;
        
        // the next is commented as otherwise it will allow Grand Master to call external func without public validation
        /*
        try this._grantMinterAccess(newMinterAddress) returns (bool result) {
            return result;
        } catch Panic(uint errorCode) {
            // This is executed in case of a panic,
            // i.e. a serious error like division by zero
            // or overflow. The error code can be used
            // to determine the kind of error.
            
            // okay man, an error is caought, and what?
            return false;
        } catch (bytes memory lowLevelData) {
            // This is executed in case revert() was used.
            return false;
        }
        */
    }
    
    // Grand Master will mint tokens when deposit ends
    function mint(address account, uint256 amount) external {
        require(msg.sender == _minter, _errorAccessDenied);
        _mint(account, amount);
    }

    /* OVERRIDES */

    /* GETTERS */

    function getMinter() public view returns (address) {
        return _minter;
    }

    function getMinterChanged() public view returns (bool) {
        return _minterChanged;
    }

    /* PRIVATE FUNCTIONS */

    /* ERROR MESSAGES */
    string private _errorAccessDenied = "Access denied.";
    string private _errorMinterChanged = "Minter has already been changed in the past.";
    string private _errorMinterIsMinter = "No need to do so: new minter is a minter already.";
}