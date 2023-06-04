import { useContractKit, useProvider } from "@celo-tools/use-contractkit";
import { nanoid } from "@reduxjs/toolkit";
import { TokenList } from "@uniswap/token-lists";
import { useCallback } from "react";
import { getNetworkLibrary } from "../connectors";
import { useAppDispatch } from "../state/hooks";
import { fetchTokenList } from "../state/lists/actions";
import getTokenList from "../utils/getTokenList";
import resolveENSContentHash from "../utils/resolveENSContentHash";

export function useFetchListCallback(): (listUrl: string, sendDispatch?: boolean) => Promise<TokenList> {
    const dispatch = useAppDispatch();
    const { network } = useContractKit();
    const { chainId } = network;
    const library = useProvider();

    const ensResolver = useCallback(
        async (ensName: string) => {
            if (!library) {
                throw new Error("Could not construct mainnet ENS resolver");
            }
            return resolveENSContentHash(ensName, library);
        },
        [chainId, library]
    );

    // note: prevent dispatch if using for list search or unsupported list
    return useCallback(
        async (listUrl: string, sendDispatch = true) => {
            const requestId = nanoid();
            sendDispatch && dispatch(fetchTokenList.pending({ requestId, url: listUrl }));
            return getTokenList(listUrl)
                .then((tokenList) => {
                    sendDispatch &&
                        dispatch(
                            fetchTokenList.fulfilled({
                                url: listUrl,
                                tokenList,
                                requestId,
                            })
                        );
                    return tokenList;
                })
                .catch((error) => {
                    console.debug(`Failed to get list at url ${listUrl}`, error);
                    sendDispatch &&
                        dispatch(
                            fetchTokenList.rejected({
                                url: listUrl,
                                requestId,
                                errorMessage: error.message,
                            })
                        );
                    throw error;
                });
        },
        [dispatch, ensResolver]
    );
}
