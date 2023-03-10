const { expect, assert } = require('chai')
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
    let getValueLib;
    let getValueLibAddress;
    let setValueLib;
    let setValueLibAddress;
    let getValueFacet;
    let getValueFacetAddress;
    let getValueSelectors;
    let setValueFacet;
    let setValueFacetAddress;
    let setValueFacetSelectors;

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
    //Testing the ownership facet
    it(`Should call the owner() function`, async function(){
        const ownFac = await ethers.getContractAt('OwnershipFacet', diamondAddress)
        let retrievedOwner = await ownFac.owner()
        console.log(`Retrieved owner: ${retrievedOwner}`)
        console.log(`Owner: ${ownerAddress}`)
        expect(retrievedOwner).to.equal(ownerAddress)
    })
    it(`Should transfer the ownership`, async function(){
        const ownFac = await ethers.getContractAt('OwnershipFacet', diamondAddress)
        let oldOwner = await ownFac.owner()
        console.log(`Actual owner: ${oldOwner}`)

        let newOwner = ethers.provider.getSigner(1)
        let newOwnerAddress = await newOwner.getAddress()
        console.log(`Future owner address: ${newOwnerAddress}`)

        await ownFac.transferOwnership(newOwnerAddress)
        console.log(`Ownership transferred`)

        let retrievedOwner = await ownFac.owner()
        console.log(`Retrieved owner: ${retrievedOwner}`)
        expect(oldOwner).to.not.equal(retrievedOwner)

        await expect(ownFac.connect(owner).transferOwnership(ownerAddress)).to.revertedWith('NotTheOwner')
        console.log(`Operation reverted successfully!`)

        await ownFac.connect(newOwner).transferOwnership(ownerAddress)
        let lastOwner = await ownFac.owner()
        console.log(`Ownership transferred again to: ${lastOwner}`)
        expect(lastOwner).to.equal(ownerAddress)
    })
    //testing diamond loupe facet
    it(`Should call getFacetAddress() from the DiamondLoupe`, async function(){
        const diamLoupe = await ethers.getContractAt('DiamondLoupe', diamondAddress);
        let facetAddress = await diamLoupe.getFacetAddress(0x8da5cb5b)
        console.log(`Function "0x8da5cb5b" is from ${facetAddress}`)
        expect(facetAddress).to.equal(ownershipFacetAddress)
    })
    it(`Should call getFacetsAddresses() from the DiamondLoupe`, async function(){
        const diamLoupe = await ethers.getContractAt('DiamondLoupe', diamondAddress);
        
        let ownerShipselectors = await diamLoupe.getFunctionSelectors(ownershipFacetAddress)
        console.log(`Ownership selectors: ${ownerShipselectors}`)        
        assert.sameMembers(ownerShipselectors, ownershipFacetSelectors)

        let diamondLoupeSelectors = await diamLoupe.getFunctionSelectors(diamondLoupeFacetAddress)
        console.log(`Diamond Loupe selectors: ${diamondLoupeSelectors}`)
        assert.sameMembers(diamondLoupeSelectors, diamondLoupeFacetSelectors)

        let diamondCutSelectors = await diamLoupe.getFunctionSelectors(diamondCutFacetAddress)
        console.log(`Diamond Cut selectors ${diamondCutSelectors}`)
        assert.sameMembers(diamondCutSelectors, diamondCutFacetSelectors)
    })
    it(`Should call the getFacets() from the DiamondLoupe`, async function(){
        const diamLoupe = await ethers.getContractAt('DiamondLoupe', diamondAddress);
        let facets = await diamLoupe.getFacets()
        console.log(facets)
    })
    it(`Should deploy the setValue library and facet`, async function(){
        setValueLib = await(await ethers.getContractFactory('setValueLib', owner, {
            libraries:{
                DiamondStorage: libStorageAddress,
            }
        })).deploy()
        await setValueLib.deployed()
        setValueLibAddress = setValueLib.address
        console.log(`setValue lib deployed to ${setValueLibAddress}`)

        setValueFacet = await(await ethers.getContractFactory('setValueFacet', owner, {
            libraries:{
                setValueLib: setValueLibAddress,
            }
        })).deploy()
        setValueFacetAddress = setValueFacet.address
        console.log(`setValue facet deployed to ${setValueFacetAddress}`)

        setValueFacetSelectors = getSelectors(setValueFacet)
        console.log(`setValue selectors: ${setValueFacetSelectors}`)
    })
    it(`Should add the setValue facet to the diamond`, async function(){
        const diamCut = await ethers.getContractAt('DiamondCutFacet', diamondAddress)
        let setValueFacetStruct = {
            facetAddress: setValueFacetAddress,
            functionSelectors: setValueFacetSelectors,
            action: 0,
        } 

        await diamCut.diamondCut([setValueFacetStruct])

        const diamLoupe = await ethers.getContractAt('DiamondLoupe', diamondAddress)
        let contractAddress = await diamLoupe.getFacetAddress(0x93a09352)
        console.log(`Function selector "0x93a09352" from ${contractAddress} address`)
        assert.equal(contractAddress, setValueFacetAddress)
    })
    it(`Should call the setValue function`, async function(){
        const setValue = await ethers.getContractAt('setValueFacet', diamondAddress)
        await setValue.setValue("Hola hola")

        console.log(`Value set`)
    })
    it(`Should deploy the getValue library and facet`, async function(){
        getValueLib = await(await ethers.getContractFactory('getValueLib', owner, {
            libraries:{
                DiamondStorage: libStorageAddress,
            }
        })).deploy()
        await getValueLib.deployed()
        getValueLibAddress = getValueLib.address
        console.log(`getValue lib deployed to: ${getValueLibAddress}`)

        getValueFacet = await(await ethers.getContractFactory('getValueFacet', owner, {
            libraries:{
                getValueLib: getValueLibAddress,
            }
        })).deploy()
        getValueFacetAddress = getValueFacet.address
        console.log(`getValueFacet deployed to ${getValueFacetAddress}`)

        getValueSelectors = getSelectors(getValueFacet)
        console.log(`getValue facet selectors: ${getValueSelectors}`)
    })
    it(`Should add the getValue facet to diamond`, async function(){
        const diamCut = await ethers.getContractAt('DiamondCutFacet', diamondAddress)
        let getValueFacetStruct = {
            facetAddress: getValueFacetAddress,
            functionSelectors: getValueSelectors,
            action: 0,
        } 

        await diamCut.diamondCut([getValueFacetStruct])

        const diamLoupe = await ethers.getContractAt('DiamondLoupe', diamondAddress)
        let contractAddress = await diamLoupe.getFacetAddress(0x20965255)
        console.log(`Function selector "0x20965255" is from contract ${contractAddress}`)
        assert.equal(contractAddress, getValueFacetAddress)
    })
    it(`Should call the getValue function`, async function(){
        const getValue = await ethers.getContractAt('getValueFacet', diamondAddress)
        let value = await getValue.getValue()
        console.log(`Retrieved value: ${value}`)
    })
})