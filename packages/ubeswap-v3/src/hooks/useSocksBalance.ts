// technically a 721, not an ERC20, but suffices for our purposes
// const SOCKS = new Token(SupportedChainId.MAINNET, SOCKS_CONTROLLER_ADDRESSES[SupportedChainId.MAINNET], 0)

export function useHasSocks(): boolean | undefined {
    // const balance = useTokenBalance(account ?? undefined, chainId === SupportedChainId.MAINNET ? SOCKS : undefined)

    // return useMemo(() => Boolean(balance?.greaterThan(0)), [balance])
    return false;
}
