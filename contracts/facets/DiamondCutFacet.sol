//SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import {DiamondCutLib as dcl} from "../libraries/OwnershipLib.sol";

contract DiamondCutFacet {

    function diamondCut(dcl.FacetCut calldata diamondCut) external {
        dcl.diamondCut(diamondCut);
    }   
}