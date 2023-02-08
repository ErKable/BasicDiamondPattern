//SPDX-License-Identifier: MIT

pragma solidity 0.8.13;
import {DiamondStorage as dsto} from "./DiamondStorage.sol";

library DiamondLoupeLib{

    struct Facet{
        address facetAddress;
        bytes4[] selectors;
    }

    function _getFacets() internal view returns(Facet[] memory){
        dsto.DStorage storage ds = dsto.getStorage();
        uint length = ds.facetAddresses.length;
        Facet[] memory facets = new Facet[](length);
        for(uint i = 0; i < length; ++i){
            facets[i].facetAddress = ds.indexToFacet[i];
            facets[i].selectors = ds.addressToSelectors[ds.indexToFacet[i]];
        }
        return facets;
    }

    function _getFacetsAddresses() internal view returns(address[] memory){
        dsto.DStorage storage ds = dsto.getStorage();
        uint length = ds.facetAddresses.length;
        address[] memory facets = new address[](length);
        for(uint i = 0; i < length; ++i){
            facets[i] = ds.indexToFacet[i];
        }
        return facets;
    }

    function _getFacetAddress(bytes4 functionSelector) internal view returns(address facetAddress){
        dsto.DStorage storage ds = dsto.getStorage();
        facetAddress = ds.selectorToAddress[functionSelector];
    }

    function _getFunctionSelectors(address facet) internal view returns(bytes4[] memory functionSelectors){
        dsto.DStorage storage ds = dsto.getStorage();
        functionSelectors = ds.addressToSelectors[facet];
    }



}