import { useBlockNumber } from "../state/application/hooks";

import useInterval from "./useInterval";
import { useState } from "react";
import useCurrentBlockTimestamp from "./useCurrentBlockTimestamp";

const DEFAULT_MS_BEFORE_WARNING = 5 * 60 * 1000;
const NETWORK_HEALTH_CHECK_MS = 10 * 1000;

const useMachineTimeMs = (updateInterval: number): number => {
    const [now, setNow] = useState(Date.now());

    useInterval(() => {
        setNow(Date.now());
    }, updateInterval);
    return now;
};

export function useIsNetworkFailed() {
    const machineTime = useMachineTimeMs(NETWORK_HEALTH_CHECK_MS);
    const blockTime = useCurrentBlockTimestamp();

    const warning = Boolean(!!blockTime && machineTime - blockTime.mul(1000).toNumber() > DEFAULT_MS_BEFORE_WARNING);

    return warning;
}

export function useIsNetworkFailedImmediate() {
    const machineTime = useMachineTimeMs(1000);
    const blockTime = useCurrentBlockTimestamp();

    const warning = Boolean(!!blockTime && machineTime - blockTime.mul(1000).toNumber());

    return !warning;
}
