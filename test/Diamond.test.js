const { expect } = require('chai')
const { ethers } = require("hardhat");
// HELPER: get function selectors from a contract
function getSelectors (contract) {
  // get the function signatures from the ABI of the contract:
  const signatures = Object.keys(contract.interface.functions)
  // convert from signature to selector:
  const selectors = signatures.reduce((acc, val) => {
    acc.push(contract.interface.getSighash(val))
    return acc
  }, [])
  return selectors
}

describe(`Simple Diamond Contract Test`, function(){

    let diamond;
    let diamondAddress;
    let libStorage;
    let libStorageAddress;
    let diamondCutLib;
    let diamondCutLibAddress;
    let diamondLoupeLib;
    let diamondLoupeLibAddress;
    let ownershipLib;
    let ownershipLibAddress;
    let diamondCutFacet;
    let diamondCutFacetAddress;
    let diamondCutFacetSelectors;
    let diamondLoupeFacet;
    let diamondLoupeFacetAddress;
    let diamondLoupeFacetSelectors;
    let ownershipFacet;
    let ownershipFacetAddress;
    let ownershipFacetSelectors;

    let owner;
    let ownerAddress;

    it(`Should add the owner`, async function(){
        owner = ethers.provider.getSigner(0)
        ownerAddress = await owner.getAddress();
        console.log(`Owner address: ${ownerAddress}`)
    })

    it(`Should deploy storage library`, async function(){
        libStorage = await(await ethers.getContractFactory('DiamondStorage', owner)).deploy()
        await libStorage.deployed()
        libStorageAddress = libStorage.address 
        console.log(`Storage Library deployed to address: ${libStorageAddress}`)
    })
    it(`Should deploy ownership library and facet`, async function(){
        ownershipLib = await(await ethers.getContractFactory('OwnershipLib', owner,{
            libraries: {
                DiamondStorage: libStorageAddress,
            }
        })).deploy()
        await ownershipLib.deployed()
        ownershipLibAddress = ownershipLib.address
        console.log(`Ownership library deployed to: ${ownershipLibAddress}`)

        ownershipFacet = await(await ethers.getContractFactory('OwnershipFacet', owner,{
            libraries:{
                OwnershipLib: ownershipLibAddress, 
            }
        })).deploy()      
        ownershipFacetAddress = ownershipFacet.address
        console.log(`Ownership facet deployed to: ${ownershipFacetAddress}`)

        ownershipFacetSelectors = getSelectors(ownershipFacet)
        console.log(`Ownership facet selectors: `,ownershipFacetSelectors)
    })
    it(`Should deploy diamond cut library and facet`, async function(){
        diamondCutLib = await(await ethers.getContractFactory('DiamondCutLib', owner, {
            libraries: {
                DiamondStorage: libStorageAddress,
            }
        })).deploy()
        await diamondCutLib.deployed()
        diamondCutLibAddress = diamondCutLib.address
        console.log(`Diamon cut library deployed to: ${diamondCutLibAddress}`)

        diamondCutFacet = await(await ethers.getContractFactory('DiamondCutFacet', owner, {
            libraries:{
                DiamondCutLib: diamondCutLibAddress,
                OwnershipLib: ownershipLibAddress,
            }
        })).deploy()
        diamondCutFacetAddress = diamondCutFacet.address 
        console.log(`Diamond cut facet deployed to: ${diamondCutFacetAddress}`)

        diamondCutFacetSelectors = getSelectors(diamondCutFacet)
        console.log(`Diamond cut facet selectors: ${[diamondCutFacetSelectors]}`)
    })
    it(`Should deploy diamond loupe library and facet`, async function(){
        diamondLoupeLib = await(await ethers.getContractFactory(`DiamondLoupeLib`, owner, {
            libraries: {
                DiamondStorage: libStorageAddress,
            }
        })).deploy()
        await diamondLoupeLib.deployed()
        diamondLoupeLibAddress = diamondLoupeLib.address
        console.log(`Diamond loupe lib deployed to: ${diamondLoupeLibAddress}`)

        diamondLoupeFacet = await(await ethers.getContractFactory(`DiamondLoupe`, owner, {
            libraries: {
                DiamondLoupeLib: diamondLoupeLibAddress,
            }
        })).deploy()
        diamondLoupeFacetAddress = diamondLoupeFacet.address
        console.log(`Diamond loupe facet deployed to address: ${diamondLoupeFacetAddress}`)

        diamondLoupeFacetSelectors = getSelectors(diamondLoupeFacet)
        console.log(`Diamond loupe facet selectos: ${diamondLoupeFacetSelectors}`)
    })
    it(`Should deploy the diamond contract`, async function(){
        let diamondCutFacetStruct = {
            facetAddress: diamondCutFacetAddress,
            functionSelectors: diamondCutFacetSelectors,
            action: 0,
        }

        let diamonLoupeFacetStruct = {
            facetAddress: diamondLoupeFacetAddress,
            functionSelectors: diamondLoupeFacetSelectors,
            action: 0,
        }

        let diamondOwnershipFacetStruct = {
            facetAddress: ownershipFacetAddress,
            functionSelectors: ownershipFacetSelectors,
            action: 0,
        }

        diamond = await(await ethers.getContractFactory('Diamond', owner, {
            libraries: {
                DiamondStorage: libStorageAddress,
                DiamondCutLib: diamondCutFacetAddress,
                DiamondLoupeLib: diamondLoupeFacetAddress,
                OwnershipLib: ownershipFacetAddress,
            }
        })).deploy([diamondCutFacetStruct, diamonLoupeFacetStruct, diamondOwnershipFacetStruct])
        await diamond.deployed()
        diamondAddress = diamond.address
        console.log(`Diamond deployed to: ${diamondAddress}`)
    })
    it(`Should call the getOwner() function`, async function(){
        const ownFac = await ethers.getContractAt('OwnershipFacet', diamondAddress)
        let retrievedOwner = await ownFac.owner()
        console.log(`Retrieved owner: ${retrievedOwner}`)
        console.log(`Owner: ${ownerAddress}`)
        expect(retrievedOwner).to.equal(ownerAddress)
    })
})