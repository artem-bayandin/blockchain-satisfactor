const Satisfaction = artifacts.require("Satisfaction")
const GrandMaster = artifacts.require("TheGrandMasterTokenCustodian")

require('chai')
    .use(require('chai-bn')(web3.utils.BN))
    .use(require('chai-as-promised'))
    .should()

contract('TheGrandMasterTokenCustodian', async accounts => {
    const [ owner, account1, account2 ] = accounts
    let satisfaction, grandMaster
    let satisfactionAddress, grandMasterAddress

    beforeEach(async () => {
        satisfaction = await Satisfaction.new()
        satisfactionAddress = satisfaction.address
        grandMaster = await GrandMaster.new(satisfaction.address)
        grandMasterAddress = grandMaster.address
        // await satisfaction.grantMinterAccess(grandMaster.address)
    })

    describe('deployed', async () => {
        it('name is set', async () => {
            expect(await grandMaster.name()).to.be.eq('The Grand Master Token Custodian')
        })
        it('symbol is set', async () => {
            expect(await grandMaster.symbol()).to.be.eq('TGMTC')
        })
        it('satisfaction address is valid', async () => {
            expect(await grandMaster.getSatisfactionAddress()).to.be.eq(satisfactionAddress)
        })
    })

    describe('stake/unstake with full allowance', async () => {
        beforeEach(async () => {
            // mint some satisfaction
            // or use another erc20 coin
            const accs = [ owner, account1, account2 ]
            for (var i = 0; i < accs.length; i++) {
                const amount = 10000 * (i+1)
                await satisfaction.mint(accs[i], amount, { from: owner })
                await satisfaction.increaseAllowance(grandMasterAddress, amount, { from: accs[i] })
            }
        })

        it('owner has 10k', async () => {
            expect(Number(await satisfaction.balanceOf(owner))).to.be.eq(10000)
        })
        it('owner allowed 10k', async () => {
            expect(Number(await satisfaction.allowance(owner, grandMasterAddress))).to.be.eq(10000)
        })
        it('account1 has 20k', async () => {
            expect(Number(await satisfaction.balanceOf(account1))).to.be.eq(20000)
        })
        it('account1 allowed 20k', async () => {
            expect(Number(await satisfaction.allowance(account1, grandMasterAddress))).to.be.eq(20000)
        })
        it('account2 has 30k', async () => {
            expect(Number(await satisfaction.balanceOf(account2))).to.be.eq(30000)
        })
        it('account2 allowed 30k', async () => {
            expect(Number(await satisfaction.allowance(account2, grandMasterAddress))).to.be.eq(30000)
        })

        describe('staked', async () => {
            const staker = account2
            let initialAmount
            const stakeAmount1 = 1000
            const stakeAmount2 = 3500
            const stakeSum = stakeAmount1 + stakeAmount2
            
            before(async () => {
                initialAmount = await satisfaction.balanceOf(staker)
                await grandMaster.stake(satisfactionAddress, stakeAmount1, { from: staker })
                await grandMaster.stake(satisfactionAddress, stakeAmount2, { from: staker })
            })

            it('staker balance changed', async () => {
                expect(Number(await satisfaction.balanceOf(account2))).to.be.eq(initialAmount - stakeSum)
            })
            it('gm balance changed', async () => {
                expect(Number(await satisfaction.balanceOf(grandMasterAddress))).to.be.eq(stakeSum)
            })
        })

        describe('unstaked', async () => {
            const staker = account2
            let initialAmount
            const stakeAmount1 = 1000
            const stakeAmount2 = 3500
            const stakeSum = stakeAmount1 + stakeAmount2
            
            before(async () => {
                initialAmount = await satisfaction.balanceOf(staker)
                await grandMaster.stake(satisfactionAddress, stakeAmount1, { from: staker })
                await grandMaster.stake(satisfactionAddress, stakeAmount2, { from: staker })
                await new Promise((resolve, reject) => { setTimeout(() => { resolve() }, 3000) })
                await grandMaster.unstake(satisfactionAddress, { from: staker })
            })

            it('staker balance changed', async () => {
                // what is a better way to compare BN and number?
                expect(Number(await satisfaction.balanceOf(account2)).toString()).to.be.eq(initialAmount.toString())
            })
            it('gm balance changed', async () => {
                expect(Number(await satisfaction.balanceOf(grandMasterAddress))).to.be.eq(0)
            })
        })
    })
})