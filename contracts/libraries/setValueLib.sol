//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;
import {DiamondStorage as dsto} from "./DiamondStorage.sol";

library setValueLib{

    function _setValue(string calldata _value) internal {
        dsto.DStorage storage ds = dsto.getStorage();
        ds.value = _value;
    }
}