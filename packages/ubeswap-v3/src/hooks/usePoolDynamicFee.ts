import { utils } from "ethers";
import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { updateDynamicFee } from "../state/mint/v3/actions";
import { AppState } from "../state";
import { useContractKit, useProvider } from "@celo-tools/use-contractkit";

export function useDynamicFeeValue() {
    return useAppSelector((state: AppState) => state.mintV3.dynamicFee);
}

export function usePoolDynamicFee(address: string) {
    const { network } = useContractKit();
    const { chainId } = network;
    const library = useProvider();

    const dispatch = useAppDispatch();

    const swapEventCallback = (e: any) => {
        dispatch(updateDynamicFee({ dynamicFee: e }));
    };

    return useMemo(() => {
        if (!library || !chainId || !address) return undefined;

        // setState({ chainId, blockNumber: null })

        const filter = {
            address,
            topics: [utils.id("Swap(address,address,int256,int256,uint160,uint128,int24)")],
        };

        library.on(filter, swapEventCallback);
        // library.on('block', blockNumberCallback)
        return () => {
            library.removeListener(filter, swapEventCallback);
        };
    }, [chainId, library, address]);
}
