//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;
import {DiamondStorage as dsto} from "./DiamondStorage.sol";

library getValueLib {

    function _getValue() internal view returns(string memory value){
        dsto.DStorage storage ds = dsto.getStorage();
        value = ds.value;
    }
}