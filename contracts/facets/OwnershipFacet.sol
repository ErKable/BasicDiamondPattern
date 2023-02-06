//SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import {DiamondStorage as dsto} from "../libraries/DiamondStorage.sol";
import {LibDiamond as lib} from "../libraries/LibDiamond.sol";

contract OwnershipFacet{

    function transferOwnership(address newOwner) external {
        lib.checkOwnership();
        lib.setContractOwner(newOwner);
    }

    function owner() external view returns(address owner){
        owner = lib.getOwner();
    }
}