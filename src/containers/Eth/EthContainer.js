import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { connectedToNetwork, disconnectedFromNetwork, networkAccountsChanged, networkChainChanged, networkMessageReceived } from '../../redux-toolkit-store'
import { requestNetworkId } from '../../redux-toolkit-store'

let networkIdRequested = false

export const EthContainer = ({ children }) => {
    console.log('EthContainer loaded')

    const dispatch = useDispatch()

    useEffect(() => {
        console.warn('Regisering eth event handlers. Check loops and reloads')

        // replace with @metamask/detect-provider
        // const provider = await detectEthereumProvider();
        if (!window.ethereum) {
            return
        }

        const eth = window.ethereum

        eth.on('connect', connectionInfo => {
            console.log('connected', connectionInfo)
            dispatch(connectedToNetwork({chainId: connectionInfo.chainId}))
        })

        eth.on('disconnect', err => {
            console.log('disconnected', err)
            dispatch(disconnectedFromNetwork())
            // reload
            /* Once disconnect has been emitted, 
            the provider will not accept any new requests 
            until the connection to the chain has been re-restablished, 
            which requires reloading the page.
            */
        })

        eth.on('accountsChanged', accounts => {
            console.log('accountsChanged', accounts)
            dispatch(networkAccountsChanged({accounts}))
        })

        eth.on('chainChanged', chainId => {
            console.log('chainChanged', chainId)
            dispatch(networkChainChanged({chainId}))
            dispatch(requestNetworkId())
            // We recommend reloading the page unless you have good reason not to.
        })

        eth.on('message', message => {
            console.log('message', message)
            dispatch(networkMessageReceived({message}))
        })

        // should I get networkId here?
        // might throw a connection error?
        if (!networkIdRequested) {
            networkIdRequested = true
            console.log('initial request of a networkId from EthContainer')
            dispatch(requestNetworkId())
        }
        // should I?
        // might throw a connection error?
        // if (!accountIdRequested) {
        //     accountIdRequested = true
        //     console.log('initial request of accounts from EthContainer')
        //     dispatch(requestNetworkAccounts())
        // }
    }, [dispatch])

    return (
        <>
            { children }
        </>
    )
}