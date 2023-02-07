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

    function _diamondCut(FacetCut memory diamondCut) internal {
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
            _enforceHasContractCode(diamondCut.facetAddress, "No facet implementation");          
            ds.selectorToAddress[diamondCut.functionSelectors[i]] = diamondCut.facetAddress;
            ds.addressToSelectors[diamondCut.facetAddress].push(diamondCut.functionSelectors[i]);
            ds.addressToSelectorToPosition[diamondCut.facetAddress][diamondCut.functionSelectors[i]] = ds.addressToSelectors[diamondCut.facetAddress].length;
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
            delete ds.selectorToAddress[diamondCut.functionSelectors[i]];
            uint oldPosition = ds.addressToSelectorToPosition[diamondCut.facetAddress][diamondCut.functionSelectors[i]];
            delete ds.addressToSelectorToPosition[diamondCut.facetAddress][diamondCut.functionSelectors[i]];
            delete ds.addressToSelectors[diamondCut.facetAddress][oldPosition];
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
            uint oldPosition = ds.addressToSelectorToPosition[diamondCut.facetAddress][diamondCut.functionSelectors[i]];
            delete ds.addressToSelectorToPosition[diamondCut.facetAddress][diamondCut.functionSelectors[i]];
            delete ds.addressToSelectors[diamondCut.facetAddress][oldPosition];
            ds.addressToSelectors[diamondCut.facetAddress].push(diamondCut.functionSelectors[i]);
            ds.addressToSelectorToPosition[diamondCut.facetAddress][diamondCut.functionSelectors[i]] = ds.addressToSelectors[diamondCut.facetAddress].length;
            emit DiamondCut(diamondCut); 
        }
    }


    function _enforceHasContractCode(address _contract, string memory _errorMessage) private view {
        uint256 contractSize;
        assembly {
            contractSize := extcodesize(_contract)
        }
        require(contractSize > 0, _errorMessage);
    }


}