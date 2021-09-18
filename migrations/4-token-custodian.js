const Satisfaction = artifacts.require('Satisfaction')
const TheGrandMasterTokenCustodian = artifacts.require('TheGrandMasterTokenCustodian')

module.exports = async deployer => {
    // deploy token
    await deployer.deploy(Satisfaction)

    // assign token to a var to get its address
    const token = await Satisfaction.deployed()

    // pass token address into bank contract (for future minting)
    await deployer.deploy(TheGrandMasterTokenCustodian, token.address)

    // assign bank to a var to get its address
    const tgmtc = await TheGrandMasterTokenCustodian.deployed()

    // change token minter
    await token.grantMinterAccess(tgmtc.address)
}