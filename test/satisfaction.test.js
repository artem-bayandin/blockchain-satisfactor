const Satisfaction = artifacts.require("Satisfaction")

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Satisfaction', async accounts => {
    const [ owner, account1, account2, account3 ] = accounts
    let contract

    beforeEach(async () => {
        contract = await Satisfaction.new()
    })

    describe('deployed', async () => {
        it('name is set', async () => {
            expect(await contract.name()).to.be.eq('Your Satisfaction')
        })
        it('symbol is set', async () => {
            expect(await contract.symbol()).to.be.eq('STSFCTN')
        })
    })

    describe('grantMinterAccess', async () => {
        describe('when minter not changed', async () => {
            it('minter is owner', async () => {
                expect(String(await contract.getMinter())).to.eq(owner)
            })
            it('minter was never changed yet', async () => {
                expect(Boolean(await contract.getMinterChanged())).to.eq(false)
            })
            it('does not throw minter changed', async () => {
                await contract.grantMinterAccess(account1, { from: account2 }).should.not.be.rejectedWith('Minter has already been changed in the past.')
            })
            it('fails if sender is not a minter', async () => {
                await contract.grantMinterAccess(account1, { from: account2 }).should.be.rejectedWith('Access denied.')
            })
            it('does not fail if sender is a minter', async () => {
                await contract.grantMinterAccess(account1, { from: owner }).should.not.be.rejectedWith('Access denied.')
            })
            it('fails if new minter is current minter', async () => {
                await contract.grantMinterAccess(owner, { from: owner }).should.be.rejectedWith('No need to do so: new minter is a minter already.')
            })
            it('does not fail if new minter is not current minter', async () => {
                await contract.grantMinterAccess(account1, { from: owner }).should.not.be.rejectedWith('No need to do so: new minter is a minter already.')
            })
            it('emits MinterChanged on success', async () => {
                await contract.grantMinterAccess(account1, { from: owner }).should.not.be.rejectedWith('No need to do so: new minter is a minter already.')
            })
            it('returns true on success', async () => {
                expect(Boolean(await contract.grantMinterAccess(account1, { from: owner }))).to.eq(true)
            })
        })
        describe('when minter changed', async () => {
            let tx, receipt, logs
            const currentMinterParam = owner
            const newMinterParam = account1

            beforeEach(async () => {
                const result = await contract.grantMinterAccess(newMinterParam, { from: currentMinterParam })
                tx = result.tx
                receipt = result.receipt
                logs = result.logs
            })

            it('emits 1 MinterChanged event', async () => {
                logs.filter(log => log.event == 'MinterChanged').length.should.eq(1)
            })
            it('sets MinterChanged.oldMinter', async () => {
                logs[0].args.oldMinter.should.eq(currentMinterParam)
            })
            it('sets MinterChanged.oldMinter', async () => {
                logs[0].args.newMinter.should.eq(newMinterParam)
            })
            it('updates _minter', async () => {
                expect(String(await contract.getMinter())).to.eq(newMinterParam)
            })
            it('sets flag _minterChanged', async () => {
                expect(Boolean(await contract.getMinterChanged())).to.eq(true)
            })
            it('throws minter changed when trying to grant access again', async () => {
                await contract.grantMinterAccess(account2, { from: newMinterParam }).should.be.rejectedWith('Minter has already been changed in the past.')
            })
            it('throws minter changed when trying to grant access again', async () => {
                await contract.grantMinterAccess(account2, { from: owner }).should.be.rejectedWith('Minter has already been changed in the past.')
            })
        })
    })

    describe('mint', async () => {
        const newMinterParam = account1
        const amountToMint = 100500

        beforeEach(async () => {
            // change minter to harden conditions
            await contract.grantMinterAccess(newMinterParam, { from: owner })
        })

        it('fails if msg.sender == owner && msg.sender != minter', async () => {
            await contract.mint(account3, amountToMint, { from: owner }).should.be.rejectedWith('Access denied.')
        })
        it('fails if msg.sender != owner && msg.sender != minter', async () => {
            await contract.mint(account3, amountToMint, { from: account2 }).should.be.rejectedWith('Access denied.')
        })
        it('does not fail if msg.sender == minter', async () => {
            await contract.mint(account3, amountToMint, { from: newMinterParam }).should.not.be.rejectedWith('Access denied.')
        })
        it('increases balance', async () => {
            await contract.mint(account3, amountToMint, { from: newMinterParam })
            expect(Number(await contract.balanceOf(account3))).to.eq(amountToMint)
        })
        it('increases balance twice', async () => {
            await contract.mint(account3, amountToMint, { from: newMinterParam })
            await contract.mint(account3, amountToMint, { from: newMinterParam })
            expect(Number(await contract.balanceOf(account3))).to.eq(amountToMint * 2)
        })
    })
})