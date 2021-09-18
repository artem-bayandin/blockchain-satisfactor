import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { BLOCKCHAIN_SLICE_NAME, SAMPLECONTRACT_SLICE_NAME } from '../constants'

// kinda hack, if we need something from web3.utils, like 'toWei'
import Web3 from 'web3'
const web3 = new Web3(window.ethereum)

const initialState = {
    loadingAllTokens: false,
    allTokens: [],

    loadingMyTokens: false,
    myTokens: [],

    mintingToken: false
}

const getAllTokens = createAsyncThunk(
    `${SAMPLECONTRACT_SLICE_NAME}/getAllTokens`,
    async ({ contract }) => {
        return await contract.methods.getAllTokens().call()
    }, {
        condition: (_, { getState }) => {
            // if not yet loading
            const { loadingAllTokens } = getState()[SAMPLECONTRACT_SLICE_NAME]
            if (loadingAllTokens) console.log('getAllTokens rejected on condition')
            return !loadingAllTokens
        }
    }
)

const registerGetAllTokensThunk = builder => {
    builder
        .addCase(getAllTokens.pending, (state, action) => {
            console.log('getAllTokens.pending', action)
            state.loadingAllTokens = true
            state.allTokens.length = 0
        })
        .addCase(getAllTokens.fulfilled, (state, action) => {
            console.log('getAllTokens.fulfilled', action)
            state.loadingAllTokens = false
            state.allTokens = action.payload.map(item => {
                // properties defined in a struct inside a contract
                const { id, name, value, creator } = item
                return {
                    id,
                    name,
                    value,
                    creator
                }
            })
        })
        .addCase(getAllTokens.rejected, (state, action) => {
            console.log('getAllTokens.rejected', action)
            state.loadingAllTokens = false
            state.allTokens.length = 0
        })
}

const getMyTokens = createAsyncThunk(
    `${SAMPLECONTRACT_SLICE_NAME}/getMyTokens`,
    async ({ contract }, { getState }) => {
        const { accountId } = getState()[BLOCKCHAIN_SLICE_NAME]
        console.log('get tokens for', accountId)
        return await contract.methods.getMyTokens().call({ from: accountId })
    }, {
        condition: (_, { getState }) => {
            // if accountId was passed into
            const { accountId } = getState()[BLOCKCHAIN_SLICE_NAME]
            if (!accountId) {
                console.log('getMyTokens rejected: no accountId')
                return false
            }
            // if not yet loading
            const { loadingMyTokens } = getState()[SAMPLECONTRACT_SLICE_NAME]
            if (loadingMyTokens) console.log('getMyTokens rejected: already loading')
            return !loadingMyTokens
        }
    }
)

const registerGetMyTokensThunk = builder => {
    builder
        .addCase(getMyTokens.pending, (state, action) => {
            console.log('getMyTokens.pending', action)
            state.loadingMyTokens = true
            state.myTokens.length = 0
        })
        .addCase(getMyTokens.fulfilled, (state, action) => {
            console.log('getMyTokens.fulfilled', action)
            state.loadingMyTokens = false
            state.myTokens = action.payload.map(item => {
                // properties defined in a struct inside a contract
                const { id, name, value, creator } = item
                return {
                    id,
                    name,
                    value,
                    creator
                }
            })
        })
        .addCase(getMyTokens.rejected, (state, action) => {
            console.log('getMyTokens.rejected', action)
            state.loadingMyTokens = false
            state.myTokens.length = 0
        })
}

const mintItem = createAsyncThunk(
    `${SAMPLECONTRACT_SLICE_NAME}/mintItem`,
    async ({ contract, cost }, { getState, rejectWithValue }) => {
        const { accountId } = getState()[BLOCKCHAIN_SLICE_NAME]
        /*
        const result = await contract
            .methods
            .mintItem() // this might have params, if defined in contract
            .send({
                from: accountId,
                // value on the screen most likely will be in 'whole' coins, but contract needs the number of its lowest parts (according to precision of a coin)
                // value: cost * 1000000000000000000 // as eth has 18 digits of precision
                value: web3.utils.toWei(cost.toString(), 'ether') // so we convert our UI number into weis
            })
            .once('error', err => {
                console.log('minting error', err)
                // 4001 - MetaMask Tx Signature: User denied transaction signature.
                return null
            })
            .then(receipt => {
                console.log('minting succeeded', receipt)
                return receipt
            })
        */
        let result
        try {
            result = await contract
                .methods
                .mintItem() // this might have params, if defined in contract
                .send({
                    from: accountId,
                    // value on the screen most likely will be in 'whole' coins, but contract needs the number of its lowest parts (according to precision of a coin)
                    // value: cost * 1000000000000000000 // as eth has 18 digits of precision
                    value: web3.utils.toWei(cost.toString(), 'ether') // so we convert our UI number into weis
                })
        } catch (err) {
            console.log('minting error', err)
            // 4001 - MetaMask Tx Signature: User denied transaction signature.
            return rejectWithValue({ err })
        }
        if (!result) return null
        console.log('minting result', result)
        const { transactionHash, events } = result
        // depends on what you return in your custom event NewTokenCreated
        const { /*id, owner, */token: tokenObject } = events.NewTokenCreated.returnValues
        const { id: tokenId, name: tokenName, value: tokenValue, creator } = tokenObject
        return {
            transactionHash,
            token: {
                id: tokenId, name: tokenName, value: tokenValue, creator
            }
        }
    }, {
        condition: (_, { getState }) => {
            // if accountId was passed into
            const { accountId } = getState()[BLOCKCHAIN_SLICE_NAME]
            if (!accountId) {
                console.log('getMyTokens rejected: no accountId')
                return false
            }
            // if not yet loading
            const { mintingToken } = getState()[SAMPLECONTRACT_SLICE_NAME]
            if (mintingToken) console.log('mintItem rejected: already minting')
            return !mintingToken
        }
    }
)

const registerMintItemThunk = builder => {
    builder
        .addCase(mintItem.pending, (state, action) => {
            console.log('mintItem.pending', action)
            state.mintingToken = true
        })
        .addCase(mintItem.fulfilled, (state, action) => {
            console.log('mintItem.fulfilled', action)
            state.mintingToken = false
            const { token } = action.payload
            state.allTokens.push(token)
            state.myTokens.push(token)
        })
        .addCase(mintItem.rejected, (state, action) => {
            console.log('mintItem.rejected', action)
            state.mintingToken = false
            if (action.payload) {
                // most likely we've sent an error
                const { err } = action.payload
                if (err && err.code === 4001) {
                    console.log('User denied transaction signature.')
                }
            }
        })
}

const sampleContractSlice = createSlice({
    name: SAMPLECONTRACT_SLICE_NAME,
    initialState: initialState,
    reducers: {
    },
    extraReducers: builder => {
        registerGetAllTokensThunk(builder)
        registerGetMyTokensThunk(builder)
        registerMintItemThunk(builder)
    }
})

const { reducer: sampleContractReducer/*, actions*/ } = sampleContractSlice
export { sampleContractReducer, getMyTokens, getAllTokens, mintItem }