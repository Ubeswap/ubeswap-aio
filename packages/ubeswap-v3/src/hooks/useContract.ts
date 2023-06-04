import { Contract } from "@ethersproject/contracts";
import IUniswapV2PairABI from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import V2MigratorABI from "../abis/migrator.json";
import IUniswapV2Router02ABI from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import NFTPosMan from "../pages/AddLiquidity/abi2.json";
import ENS_PUBLIC_RESOLVER_ABI from "../abis/ens-public-resolver.json";
import ENS_ABI from "../abis/ens-registrar.json";
import ERC20_ABI from "../abis/erc20.json";
import ERC20_BYTES32_ABI from "../abis/erc20_bytes32.json";
import WETH_ABI from "../abis/weth.json";
import EIP_2612 from "../abis/eip_2612.json";
import MULTICALL_ABI from "../abis/multicall.json";
import NewQuoterABI from "../abis/quoter.json";
import { ENS_REGISTRAR_ADDRESSES, MULTICALL_ADDRESS, NONFUNGIBLE_POSITION_MANAGER_ADDRESSES, QUOTER_ADDRESSES, V2_ROUTER_ADDRESS, V3_MIGRATOR_ADDRESSES } from "../constants/addresses";
import { useMemo } from "react";
import { getContract } from "../utils";
import { WMATIC_EXTENDED } from "../constants/tokens";
import { ChainId, useContractKit, useProvider } from "@celo-tools/use-contractkit";

// returns null on errors
export function useContract<T extends Contract = Contract>(addressOrAddressMap: string | { [chainId: number]: string } | undefined, ABI: any, withSignerIfPossible = true): T | null {
    const library = useProvider();
    const { network, address } = useContractKit();
    const chainId = network.chainId as unknown as ChainId;

    return useMemo(() => {
        if (!addressOrAddressMap || !ABI || !library || !chainId) return null;
        let address: string | undefined;
        if (typeof addressOrAddressMap === "string") address = addressOrAddressMap;
        else address = addressOrAddressMap[chainId];
        if (!address) return null;
        try {
            return getContract(address, ABI, library, withSignerIfPossible && address ? address : undefined);
        } catch (error) {
            console.error("Failed to get contract", error);
            return null;
        }
    }, [addressOrAddressMap, ABI, library, chainId, withSignerIfPossible, address]) as T;
}

export function useV2MigratorContract() {
    return useContract(V3_MIGRATOR_ADDRESSES, V2MigratorABI, true);
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean) {
    return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible);
}

export function useWETHContract(withSignerIfPossible?: boolean) {
    const { network } = useContractKit();
    const chainId = network.chainId as unknown as ChainId;
    return useContract(chainId ? WMATIC_EXTENDED[chainId]?.address : undefined, WETH_ABI, withSignerIfPossible);
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean) {
    return useContract(ENS_REGISTRAR_ADDRESSES, ENS_ABI, withSignerIfPossible);
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean) {
    return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible);
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
    return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible);
}

export function useEIP2612Contract(tokenAddress?: string): Contract | null {
    return useContract(tokenAddress, EIP_2612, false);
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
    return useContract(pairAddress, IUniswapV2PairABI.abi, withSignerIfPossible);
}

export function useV2RouterContract(): Contract | null {
    return useContract(V2_ROUTER_ADDRESS, IUniswapV2Router02ABI.abi, true);
}

export function useMulticall2Contract() {
    return useContract(MULTICALL_ADDRESS, MULTICALL_ABI, false);
}

export function useV3NFTPositionManagerContract(withSignerIfPossible?: boolean) {
    return useContract(NONFUNGIBLE_POSITION_MANAGER_ADDRESSES, NFTPosMan, withSignerIfPossible);
}

export function useV3Quoter() {
    return useContract(QUOTER_ADDRESSES, NewQuoterABI);
}
