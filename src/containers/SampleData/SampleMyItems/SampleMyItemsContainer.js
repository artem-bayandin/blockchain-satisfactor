import React from 'react'
import './SampleMyItemsContainer.css'
import { useDispatch, useSelector } from 'react-redux'
import { SampleListItemComponent } from '../../../components'
import { getMyTokens, SAMPLECONTRACT_SLICE_NAME } from '../../../redux-toolkit-store'

export const SampleMyItemsContainer = ({ contract }) => {
    const dispatch = useDispatch()
    const { myTokens, loadingMyTokens } = useSelector(state => state[SAMPLECONTRACT_SLICE_NAME])

    return (
        <div className='sample-my-items-container'>
            <div className='header'>sample my items container</div>
            <div>contract is {contract ? '' : 'NOT'} loaded</div>
            <div className={loadingMyTokens ? 'sample-button disabled' : 'sample-button'} onClick={() => !loadingMyTokens && dispatch(getMyTokens({ contract }))}>reload</div>
            {
                myTokens && myTokens.length
                ?
                <div className='tokens-list'>
                    {myTokens.map((item, index) => <SampleListItemComponent key={index} data={item} />)}
                </div>
                : <></>
            }
        </div>
    )
}