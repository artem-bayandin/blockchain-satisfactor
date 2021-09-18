import React, { useEffect, useState } from 'react'
import './SampleDataContainer.css'

import { useSelector } from 'react-redux'

import { useContracts } from '../../hooks'
import { BLOCKCHAIN_SLICE_NAME } from '../../redux-toolkit-store'

import SampleContract from '../../contracts/SampleContract.json'
import { SampleConnectButtonContainer } from './SampleConnectButton/SampleConnectButtonContainer'
import { SampleAllItemsContainer } from './SampleAllItems/SampleAllItemsContainer'
import { SampleMyItemsContainer } from './SampleMyItems/SampleMyItemsContainer'
import { SampleMintContainer } from './SampleMint/SampleMintContainer'

export const SampleDataContainer = () => {
    const { networkId, accountId } = useSelector(state => state[BLOCKCHAIN_SLICE_NAME])

    // when changing network contract might become outdated, as it belongs to a specific network
    const { getContractDataByJson } = useContracts({ contractJson: SampleContract })
    const [ sampleContract, setSampleContract ] = useState(getContractDataByJson(SampleContract))
    useEffect(() => {
        const contractData = getContractDataByJson(SampleContract)
        setSampleContract(contractData ? contractData.contract : null)
    }, [networkId])
    
    return (
        <div className='sampe-data-container'>
            <div className='header'>i am a sample data container</div>
            {
                accountId // if accountId exists, then a wallet is connected, so you should check if the right network is selected
                    ? sampleContract // when the right network is selected, contract is loaded and exists
                        ? <>
                            <SampleAllItemsContainer contract={sampleContract} />
                            <SampleMyItemsContainer contract={sampleContract} />
                            <SampleMintContainer contract={sampleContract} />
                        </> : <>
                            <div>
                                contract cannot be loaded. please choose the right network
                            </div>
                        </>
                    : <>
                        <SampleConnectButtonContainer />
                    </>
            }
        </div>
    )
}