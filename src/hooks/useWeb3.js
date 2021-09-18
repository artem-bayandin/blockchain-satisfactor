import { useState, useEffect } from 'react'
import Web3 from 'web3'

export const useWeb3 = () => {
    const [ web3, setWeb3 ] = useState(null)

    useEffect(() => {
        if (!web3) {
            setWeb3(new Web3(window.ethereum))
        }
    }, [web3])

    return { web3 }
}