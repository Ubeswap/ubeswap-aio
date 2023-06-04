import { ChainId } from "@ubeswap/sdk";
import React from "react";
import { WrappedCurrency } from "../../models/types";
import { StyledImgLogo } from "./styled";

import { useContractKit } from "@celo-tools/use-contractkit";
import AlgebraConfig from "../../algebra.config";

export const getTokenLogoURL = (symbol: string) => `https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_${symbol}.png`;

export default function CurrencyLogo({ currency, size = "24px", style, fromList = false, ...rest }: { currency?: WrappedCurrency; size?: string; fromList?: boolean; style?: React.CSSProperties }) {
    const { network } = useContractKit();
    const chainId = network.chainId as unknown as ChainId;

    let logo;

    if (chainId === AlgebraConfig.CHAIN_PARAMS.chainId) {
        logo = AlgebraConfig.CHAIN_PARAMS.wrappedNativeCurrency.logo;
    }

    if (!currency) return <div />;

    // if (currency.address?.toLowerCase() in specialTokens) {
    //     return <StyledImgLogo src={specialTokens[currency.address.toLowerCase()]} size={size} style={style} {...rest} />;
    // }

    if (currency.isNative) {
        return <StyledImgLogo src={logo} size={size} style={style} {...rest} />;
    }

    return <StyledImgLogo src={getTokenLogoURL(currency.symbol)} size={size} style={style} {...rest} />;
}
