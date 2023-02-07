//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;
import {DiamondStorage as dsto} from "./DiamondStorage.sol";

library DiamondCutLib {

    enum FacetCuAction{
        Add,
        Replace,
        Remove
    }

    struct FacetCut {
        address facetAddress; //facet contract address
        bytes4[] functionSelectors; //which function from this facet we want to add
        FacetCuAction action;
    }

    event DiamondCut(FacetCut diamondCut);

    error cannotAddSelectorsToZeroAddress(FacetCut diamondCut);
    error functionSelectorAlreadyExisting(bytes4 functionSelector);
    error NoSelectorsGiven(FacetCut diamondCut);
    error cannotRemoveSelectorsFromZeroAddress(FacetCut diamondCut);
    error UnexistingFunctionSelector(bytes4 functionSelector);
    error cannotReplaceSelectorsFromZeroAddress(FacetCut diamondCut);
    error IncorrectAction(FacetCut diamondCut);

    function diamondCut(FacetCut memory diamondCut) internal {
        if(diamondCut.action == FacetCuAction.Add){
            addFunction(diamondCut);
        } else if(diamondCut.action == FacetCuAction.Replace){
            replaceFunction(diamondCut);
        } else if(diamondCut.action == FacetCuAction.Remove){
            removeFunction(diamondCut);
        } else {
            revert IncorrectAction(diamondCut);
        }
    }

    function addFunction(FacetCut memory diamondCut) internal {
        dsto.DStorage storage ds = dsto.getStorage();
        for(uint i = 0; i < diamondCut.functionSelectors.length; ++i){
            if(diamondCut.functionSelectors.length == 0){
                revert NoSelectorsGiven(diamondCut);
            }
            if(diamondCut.facetAddress == address(0)){
                revert cannotAddSelectorsToZeroAddress(diamondCut);
            }
            if(ds.selectorToAddress[diamondCut.functionSelectors[i]] != address(0)){
                revert functionSelectorAlreadyExisting(diamondCut.functionSelectors[i]);
            }          
            ds.selectorToAddress[diamondCut.functionSelectors[i]] = diamondCut.facetAddress;
            emit DiamondCut(diamondCut);
        }
    }

    function removeFunction(FacetCut memory diamondCut) internal {
        dsto.DStorage storage ds = dsto.getStorage();
        for(uint i = 0; i < diamondCut.functionSelectors.length; ++i){
            if(diamondCut.functionSelectors.length == 0){
                revert NoSelectorsGiven(diamondCut);
            }
            if(diamondCut.facetAddress == address(0)){
                revert cannotRemoveSelectorsFromZeroAddress(diamondCut);
            }
            if(ds.selectorToAddress[diamondCut.functionSelectors[i]] == address(0)){
                revert UnexistingFunctionSelector(diamondCut.functionSelectors[i]);
            }
            ds.selectorToAddress[diamondCut.functionSelectors[i]] = address(0);
            emit DiamondCut(diamondCut);          
        }
    }

    function replaceFunction(FacetCut memory diamondCut) internal {
        dsto.DStorage storage ds = dsto.getStorage();
        for(uint i = 0; i < diamondCut.functionSelectors.length; ++i){
            if(diamondCut.functionSelectors.length == 0){
                revert NoSelectorsGiven(diamondCut);
            }
            if(diamondCut.facetAddress == address(0)){
                revert cannotReplaceSelectorsFromZeroAddress(diamondCut);
            }
            if(ds.selectorToAddress[diamondCut.functionSelectors[i]] == address(0)){
                revert UnexistingFunctionSelector(diamondCut.functionSelectors[i]);
            }
            ds.selectorToAddress[diamondCut.functionSelectors[i]] = diamondCut.facetAddress;
            emit DiamondCut(diamondCut); 
        }
    }





}