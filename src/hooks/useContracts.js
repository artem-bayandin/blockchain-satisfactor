import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { BLOCKCHAIN_SLICE_NAME } from '../redux-toolkit-store'
import { useWeb3 } from './useWeb3'

const contracts = {}

const getCachedName = (networkId, contractName) => `__NET::${networkId}__CTRN::${contractName}`

const extractContractName = contractJson => contractJson ? contractJson.contractName : null

const getContractDataByName = (contractName, networkId) => {
    const cachedName = getCachedName(networkId, contractName)
    if (!contracts.hasOwnProperty(cachedName)) return null // throw err ?
    return contracts[cachedName]
}

const getContractDataByJson = (contractJson, networkId) => {
    const contractName = extractContractName(contractJson)
    if (!contractName) return null
    return getContractDataByName(contractName, networkId)
}

const tryRegisterContract = (web3, contractJson, networkId) => {
    if (!networkId) return

    const contractName = extractContractName(contractJson)
    const cachedName = getCachedName(networkId, contractName)

    if (!contracts.hasOwnProperty(cachedName)) {
        // add to 'collection'
        console.log(`registering contract '${contractJson.contractName}' in ${networkId}`)
        const contract = contractJson.networks[networkId]
            ? new web3.eth.Contract(contractJson.abi, contractJson.networks[networkId].address)
            : null
        contracts[cachedName] = {
            name: contractName,
            json: contractJson,
            networkId,
            contract
        }
    } else {
        console.log(`contract '${contractJson.contractName}' is already registered in ${networkId}`)
    }
}

export const useContracts = ({ contractJson }) => {
    const { web3 } = useWeb3()
    const { networkId } = useSelector(state => state[BLOCKCHAIN_SLICE_NAME])

    useEffect(() => {
        // try to init once
        console.log(`useEffect in reloading contract '${contractJson.contractName}' on ${networkId}`)

        if (contractJson && networkId) {
            tryRegisterContract(web3, contractJson, networkId)
        } else {
            console.log('skip loading null contract or null network')
        }
    }, [networkId])

    return {
        contracts,
        extractContractName,
        getContractDataByName: contractName => getContractDataByName(contractName, networkId),
        getContractDataByJson: contractJson => getContractDataByJson(contractJson, networkId)
    }
}