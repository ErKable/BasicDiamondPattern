//SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

library DiamondStorage{

    bytes32 constant STORAGE_POSITION = keccak256("My.Storage.Position");

    struct FacetAddressAndSelectorPosition{
        address facetAddress;
        uint16 selectorPosition;
    }

    struct DStorage{
        
        mapping(bytes4 => FacetAddressAndSelectorPosition) facetAddressAndSelectorPosition;
        bytes4[] selectors;
        address contractOwner;
        string value;
    }

    function getStorage() internal pure returns(DStorage storage DStorageStruct){
        bytes32 position = STORAGE_POSITION;
        assembly {
            DStorageStruct.slot := position
        }
    }   

    

}
