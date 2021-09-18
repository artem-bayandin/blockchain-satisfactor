import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { BLOCKCHAIN_SLICE_NAME } from '../constants'

const initialState = {
    loadingNetworkId: false,
    networkId: null,

    loadingChainId: false,
    chainId: null,

    loadingAccountId: false,
    accountId: null,

    message: null,
}

const requestNetworkId = createAsyncThunk(
    `${BLOCKCHAIN_SLICE_NAME}/requestNetworkId`,
    async () => {
        const networkId = await window.ethereum.request({ method: 'net_version' })
        return networkId
    }, {
        condition: (_, { getState }) => {
            // if not yet loading
            const { loadingNetworkId } = getState()[BLOCKCHAIN_SLICE_NAME]
            if (loadingNetworkId) console.log('requestNetworkId rejected: already loading')
            return !loadingNetworkId
        }
    }
)

const registerRequestNetworkIdThunk = builder => {
    builder
        .addCase(requestNetworkId.pending, (state, action) => {
            console.log('requestNetworkId.pending', action)
            state.loadingNetworkId = true
            state.networkId = null
        })
        .addCase(requestNetworkId.fulfilled, (state, action) => {
            console.log('requestNetworkId.fulfilled', action)
            state.loadingNetworkId = false
            state.networkId = action.payload
        })
        .addCase(requestNetworkId.rejected, (state, action) => {
            console.log('requestNetworkId.rejected', action)
            state.loadingNetworkId = false
            state.networkId = null
        })
}

const requestChainId = createAsyncThunk(
    `${BLOCKCHAIN_SLICE_NAME}/requestChainId`,
    async () => {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        return chainId
    }, {
        condition: (_, { getState }) => {
            // if not yet loading
            const { loadingChainId } = getState()[BLOCKCHAIN_SLICE_NAME]
            if (loadingChainId) console.log('requestChainId rejected: already loading')
            return !loadingChainId
        }
    }
)

const registerRequestChainIdThunk = builder => {
    builder
        .addCase(requestChainId.pending, (state, action) => {
            console.log('requestChainId.pending', action)
            state.loadingChainId = true
            state.chainId = null
        })
        .addCase(requestChainId.fulfilled, (state, action) => {
            console.log('requestChainId.fulfilled', action)
            state.loadingChainId = false
            state.chainId = action.payload
        })
        .addCase(requestChainId.rejected, (state, action) => {
            console.log('requestChainId.rejected', action)
            state.loadingChainId = false
            state.chainId = null
        })
}

const requestNetworkAccounts = createAsyncThunk(
    `${BLOCKCHAIN_SLICE_NAME}/requestNetworkAccounts`,
    async (_, { dispatch }) => {
//         /*
//         - user closes metamask window
//         - or metamask fails to login
//         - or metamask does not subscribes
//         - or pending request is here (throws a RPC error)
//         */
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const accountId = accounts[0]
        return accountId
    }, {
        condition: (_, { getState }) => {
            // if not yet loading
            const { loadingAccountId } = getState()[BLOCKCHAIN_SLICE_NAME]
            if (loadingAccountId) console.log('requestNetworkAccounts rejected: already loading')
            return !loadingAccountId // && window.ethereum.isConnected() // and check if we are 'globally' connected
        }
    }
)

const registerRequestNetworkAccountsThunk = builder => {
    builder
        .addCase(requestNetworkAccounts.pending, (state, action) => {
            console.log('requestNetworkAccounts.pending', action)
            state.loadingAccountId = true
            state.accountId = null
        })
        .addCase(requestNetworkAccounts.fulfilled, (state, action) => {
            console.log('requestNetworkAccounts.fulfilled', action)
            state.loadingAccountId = false
            state.accountId = action.payload
        })
        .addCase(requestNetworkAccounts.rejected, (state, action) => {
            console.log('requestNetworkAccounts.rejected', action)
            state.loadingAccountId = false
            state.accountId = null
        })
}

const blockchainSlice = createSlice({
    name: BLOCKCHAIN_SLICE_NAME,
    initialState: initialState,
    reducers: {
        connectedToNetwork(state, action) {
            state.loadingChainId = false
            state.chainId = action.payload.chainId
        },
        disconnectedFromNetwork(state, action) {
            state.chainId = null
            // reload
            console.warn('reload the page')
        },
        networkAccountsChanged(state, action) {
            state.loadingAccountId = false
            state.accountId = action.payload.accounts[0]
        },
        networkChainChanged(state, action) {
            state.loadingChainId = false
            state.chainId = action.payload.chainId
            // reload
            console.warn('reload the page')
        },
        networkMessageReceived(state, action) {
            state.message = action.payload.message
        }
    },
    extraReducers: builder => {
        registerRequestNetworkIdThunk(builder)
        registerRequestChainIdThunk(builder)
        registerRequestNetworkAccountsThunk(builder)
    }
})

const { reducer: blockchainReducer, actions } = blockchainSlice
const { connectedToNetwork, disconnectedFromNetwork, networkAccountsChanged, networkChainChanged, networkMessageReceived } = actions
export { blockchainReducer, connectedToNetwork, disconnectedFromNetwork, networkAccountsChanged, networkChainChanged, networkMessageReceived, requestNetworkAccounts, requestChainId, requestNetworkId }