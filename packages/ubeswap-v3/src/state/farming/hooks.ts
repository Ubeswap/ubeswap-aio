import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { useClients } from "../../hooks/subgraph/useClients";
import { HAS_TRANSFERED_POSITIONS, ONE_ETERNAL_FARMING, ONE_FARMING_EVENT } from "../../utils/graphql-queries";
import { isFarming, hasTransferredPositions } from "./actions";
import { useContractKit } from "@celo-tools/use-contractkit";

export function useFarmingActionsHandlers(): {
    onIsFarming: () => void;
    hasTransferred: () => void;
} {
    const dispatch = useAppDispatch();
    const { farmingClient } = useClients();
    const { startTime } = useAppSelector((state) => state.farming);

    const { address: account } = useContractKit();

    const isFarmingAdd = useCallback(async () => {
        try {
            const {
                data: { limitFarmings },
                error,
            } = await farmingClient.query({
                query: ONE_FARMING_EVENT(),
                fetchPolicy: "network-only",
                variables: {
                    time: Math.round(Date.now() / 1000),
                },
            });

            if (error) {
                return;
            }

            const {
                data: { eternalFarmings },
                error: eternalError,
            } = await farmingClient.query({
                query: ONE_ETERNAL_FARMING(),
                fetchPolicy: "network-only",
            });

            if (eternalError) {
                return;
            }

            dispatch(
                isFarming({
                    startTime: limitFarmings[0]?.startTime,
                    endTime: limitFarmings[0]?.endTime,
                    eternalFarmings: !!eternalFarmings[0],
                })
            );
        } catch (e) {
            console.log(e);
        }
    }, [dispatch]);

    const fetchHasTransferredPositions = useCallback(async () => {
        if (!account) return;

        try {
            const {
                data: { deposits },
                error,
            } = await farmingClient.query({
                query: HAS_TRANSFERED_POSITIONS(),
                fetchPolicy: "network-only",
                variables: {
                    account,
                },
            });

            if (error) {
                return;
            }

            dispatch(hasTransferredPositions(Boolean(deposits.length)));
        } catch (e) {
            console.log(e);
        }
    }, [dispatch, account]);

    return {
        onIsFarming: isFarmingAdd,
        hasTransferred: fetchHasTransferredPositions,
    };
}
