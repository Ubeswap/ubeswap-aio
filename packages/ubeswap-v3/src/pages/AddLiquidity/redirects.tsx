import { NewAddLiquidityPage } from "../../pages/NewAddLiquidity";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { WMATIC_EXTENDED } from "../../constants/tokens";

import AlgebraConfig from "../../algebra.config";
import { useContractKit } from "@celo-tools/use-contractkit";

export function RedirectDuplicateTokenIdsNew(props: RouteComponentProps<{ currencyIdA: string; currencyIdB: string; step: string }>) {
    const {
        match: {
            params: { currencyIdA, currencyIdB, step },
        },
    } = props;

    const { network } = useContractKit();
    const { chainId } = network;

    // prevent weth + eth
    let symbol;

    if (chainId === AlgebraConfig.CHAIN_PARAMS.chainId) {
        symbol = AlgebraConfig.CHAIN_PARAMS.wrappedNativeCurrency.symbol;
    }

    const isETHOrWETHA = currencyIdA === symbol || (chainId !== undefined && currencyIdA === WMATIC_EXTENDED[chainId]?.address);
    const isETHOrWETHB = currencyIdB === symbol || (chainId !== undefined && currencyIdB === WMATIC_EXTENDED[chainId]?.address);

    if (currencyIdA && currencyIdB && (currencyIdA.toLowerCase() === currencyIdB.toLowerCase() || (isETHOrWETHA && isETHOrWETHB))) {
        return <Redirect to={`/add/${currencyIdA}`} />;
    }
    return <NewAddLiquidityPage {...props} />;
}
