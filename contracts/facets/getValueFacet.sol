//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;
import {getValueLib as gvl} from "../libraries/getValueLib.sol";

contract getValueFacet {

    function getValue() external view returns(string memory value){
        value = gvl._getValue();
    }
}