//SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import {setValueLib as svl} from "../libraries/setValueLib.sol";

contract setValueFacet{
    function setValue(string calldata _value) external {
        svl._setValue(_value);
    }
}