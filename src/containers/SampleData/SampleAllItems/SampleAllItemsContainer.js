import React from 'react'
import './SampleAllItemsContainer.css'
import { useDispatch, useSelector } from 'react-redux'
import { SampleListItemComponent } from '../../../components'
import { getAllTokens, SAMPLECONTRACT_SLICE_NAME } from '../../../redux-toolkit-store'

export const SampleAllItemsContainer = ({ contract }) => {
    const dispatch = useDispatch()
    const { allTokens, loadingAllTokens } = useSelector(state => state[SAMPLECONTRACT_SLICE_NAME])

    return (
        <div className='sample-all-items-container'>
            <div className='header'>sample all items container</div>
            <div>contract is {contract ? '' : 'NOT'} loaded</div>
            <div className={loadingAllTokens ? 'sample-button disabled' : 'sample-button'} onClick={() => !loadingAllTokens && dispatch(getAllTokens({ contract }))}>reload</div>
            {
                allTokens && allTokens.length
                ?
                <div className='tokens-list'>
                    {allTokens.map((item, index) => <SampleListItemComponent key={index} data={item} />)}
                </div>
                : <></>
            }
        </div>
    )
}