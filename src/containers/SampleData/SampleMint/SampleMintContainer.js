import React from 'react'
import './SampleMintContainer.css'
import { useInput } from '../../../hooks'
import { useDispatch, useSelector } from 'react-redux'
import { mintItem, SAMPLECONTRACT_SLICE_NAME } from '../../../redux-toolkit-store'

export const SampleMintContainer = ({ contract }) => {
    const dispatch = useDispatch()
    const cost = useInput('0')
    const { mintingToken } = useSelector(state => state[SAMPLECONTRACT_SLICE_NAME])

    return (
        <div className='sample-mint-container'>
            <div className='header'>sample mint container</div>
            <div>contract is {contract ? '' : 'NOT'} loaded</div>
            <input className='sample-button' type="number" value={cost.value} onChange={cost.onChange} />
            <div className={mintingToken ? 'sample-button disabled' : 'sample-button'} onClick={() => !mintingToken && dispatch(mintItem({ contract, cost: parseFloat(cost.value) }))}>mint</div>
        </div>
    )
}