import { configureStore } from '@reduxjs/toolkit'
import { blockchainReducer } from './slices/blockchain'
import { sampleContractReducer } from './slices/sampleContract'

import {
    BLOCKCHAIN_SLICE_NAME
    , SAMPLECONTRACT_SLICE_NAME
} from './constants'

export const store = configureStore({
    reducer: {
        [BLOCKCHAIN_SLICE_NAME]: blockchainReducer,
        [SAMPLECONTRACT_SLICE_NAME]: sampleContractReducer
    }
})