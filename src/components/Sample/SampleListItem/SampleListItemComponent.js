import React from 'react'
import './SampleListItemComponent.css'

export const SampleListItemComponent = ({ data }) => {

    return (
        <div className='sample-list-item-component'>
            <span>Id: {data.id}</span>
            <span>Name: {data.name}</span>
            <span>Value: {data.value}</span>
            <span>Creator: {data.creator}</span>
        </div>
    )
}