import React from 'react'
import { Switch, Route } from 'react-router'

import { MainPage } from './pages'

import { EthContainer } from './containers'

// import routes, layout, components for pages
export const App = () => {
    return (
        <EthContainer>
            <Switch>
                <Route path="*" render={props => <MainPage {...props}></MainPage>} />
            </Switch>
        </EthContainer>
    )
}