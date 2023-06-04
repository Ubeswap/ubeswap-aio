import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { blockClient, client, farmingClient } from "../../apollo/client";

import AlgebraConfig from "../../algebra.config";
import { useContractKit } from "@celo-tools/use-contractkit";

export function useBlockClient(): ApolloClient<NormalizedCacheObject> {
    const { network } = useContractKit();
    const { chainId } = network;
    switch (chainId) {
        case AlgebraConfig.CHAIN_PARAMS.chainId:
            return blockClient;
        default:
            return blockClient;
    }
}

export function useDataClient(): ApolloClient<NormalizedCacheObject> {
    const { network } = useContractKit();
    const { chainId } = network;
    switch (chainId) {
        case AlgebraConfig.CHAIN_PARAMS.chainId:
            return client;
        default:
            return client;
    }
}

export function useFarmingClient(): ApolloClient<NormalizedCacheObject> {
    const { network } = useContractKit();
    const { chainId } = network;
    switch (chainId) {
        case AlgebraConfig.CHAIN_PARAMS.chainId:
            return farmingClient;
        default:
            return farmingClient;
    }
}

export function useClients(): {
    dataClient: ApolloClient<NormalizedCacheObject>;
    farmingClient: ApolloClient<NormalizedCacheObject>;
    blockClient: ApolloClient<NormalizedCacheObject>;
} {
    const dataClient = useDataClient();
    const farmingClient = useFarmingClient();
    const blockClient = useBlockClient();

    return {
        dataClient,
        farmingClient,
        blockClient,
    };
}
