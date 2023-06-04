import { getTokenLogoURL } from "../components/CurrencyLogo";
import { Currency, Token } from "@uniswap/sdk-core";
import { useCallback, useState } from "react";
import { useProvider } from "@celo-tools/use-contractkit";

export default function useAddTokenToMetamask(currencyToAdd: Currency | undefined): {
    addToken: () => void;
    success: boolean | undefined;
} {
    const library = useProvider();

    const token: Token | undefined = currencyToAdd?.wrapped;

    const [success, setSuccess] = useState<boolean | undefined>();

    const addToken = useCallback(() => {
        if (library && library.provider.isMetaMask && library.provider.request && token) {
            library.provider
                .request({
                    method: "wallet_watchAsset",
                    params: {
                        //@ts-ignore // need this for incorrect ethers provider type
                        type: "ERC20",
                        options: {
                            address: token.address,
                            symbol: token.symbol,
                            decimals: token.decimals,
                            image: getTokenLogoURL(token.address),
                        },
                    },
                })
                .then((success) => {
                    setSuccess(success);
                })
                .catch(() => setSuccess(false));
        } else {
            setSuccess(false);
        }
    }, [library, token]);

    return { addToken, success };
}
