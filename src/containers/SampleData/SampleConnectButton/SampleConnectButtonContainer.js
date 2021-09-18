import React from 'react'
import './SampleConnectButtonContainer.css'

import { useDispatch } from 'react-redux'
import { requestNetworkAccounts } from '../../../redux-toolkit-store'

export const SampleConnectButtonContainer = () => {
    const dispatch = useDispatch()

    return (
        <div className='sample-connect-button'>
            <div className='header'>sample connect button container</div>
            <div>i don't need a contract, he-he</div>
            <div className="sample-button" onClick={() => dispatch(requestNetworkAccounts())}>connect</div>
        </div>
    )
}