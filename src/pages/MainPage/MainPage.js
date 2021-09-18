import React from 'react'
import './MainPage.css'

import { SampleDataContainer } from '../../containers'

// some basic layout
// less logic if possible
export const MainPage = () => {
    return (
        <div className='main-page'>
            <div className='header'>i am a main page</div>
            <SampleDataContainer />
        </div>
    )
}