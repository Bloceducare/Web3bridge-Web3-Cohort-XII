import { ethers } from "ethers";
import { useCallback } from "react"



const useFetchPair = () => {

    const provider = ethers.InfuraProvider('mainnet', import.meta.env.VITE_INFURA_PROVIDER)

    const fecthPair = useCallback(async () => {
        
    }, []);

}

export default useFetchPair