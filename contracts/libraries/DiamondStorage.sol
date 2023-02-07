//SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

library DiamondStorage{

    bytes32 constant STORAGE_POSITION = keccak256("My.Storage.Position");
     
    struct DStorage{
        mapping(bytes4 => address) selectorToAddress; //Selector to facet address
        mapping(address => bytes4[]) addressToSelectors;
        mapping(address => mapping(bytes4 => uint)) addressToSelectorToPosition;
        address contractOwner;
    }

    function getStorage() internal pure returns(DStorage storage DStorageStruct){
        bytes32 position = STORAGE_POSITION;
        assembly {
            DStorageStruct.slot := position
        }
    }   

    

}
