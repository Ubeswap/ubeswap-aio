import { Currency } from "@uniswap/sdk-core";
import { useMemo } from "react";
import { WMATIC_EXTENDED } from "../constants/tokens";
import { tryParseAmount } from "../state/swap/hooks";
import { useTransactionAdder } from "../state/transactions/hooks";
import { useCurrencyBalance } from "../state/wallet/hooks";
import { useWETHContract } from "./useContract";
import { t } from "@lingui/macro";

import AlgebraConfig from "algebra.config";
import { useContractKit } from "@celo-tools/use-contractkit";

export enum WrapType {
    NOT_APPLICABLE,
    WRAP,
    UNWRAP,
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE };
/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export default function useWrapCallback(
    inputCurrency: Currency | undefined,
    outputCurrency: Currency | undefined,
    typedValue: string | undefined
): { wrapType: WrapType; execute?: undefined | (() => Promise<void>); inputError?: string } {
    const { address: account, network } = useContractKit();
    const { chainId } = network;
    const wethContract = useWETHContract();
    const balance = useCurrencyBalance(account ?? undefined, inputCurrency);
    // we can always parse the amount typed as the input currency, since wrapping is 1:1
    const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency), [inputCurrency, typedValue]);
    const addTransaction = useTransactionAdder();

    let chainSymbol: string;

    if (chainId === AlgebraConfig.CHAIN_PARAMS.chainId) {
        chainSymbol = AlgebraConfig.CHAIN_PARAMS.wrappedNativeCurrency.symbol;
    }

    return useMemo(() => {
        if (!wethContract || !chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE;
        const weth = WMATIC_EXTENDED[chainId];
        if (!weth) return NOT_APPLICABLE;

        const hasInputAmount = Boolean(inputAmount?.greaterThan("0"));
        const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount);

        if (inputCurrency.isNative && weth.equals(outputCurrency)) {
            return {
                wrapType: WrapType.WRAP,
                execute:
                    sufficientBalance && inputAmount
                        ? async () => {
                              try {
                                  const txReceipt = await wethContract.deposit({ value: `0x${inputAmount.quotient.toString(16)}` });
                                  addTransaction(txReceipt, { summary: t`Wrap ${inputAmount.toSignificant(6)} ${chainSymbol} to W${chainSymbol}` });
                              } catch (error) {
                                  console.error("Could not deposit", error);
                              }
                          }
                        : undefined,
                inputError: sufficientBalance ? undefined : hasInputAmount ? t`Insufficient ${chainSymbol} balance` : t`Enter ${chainSymbol} amount`,
            };
        } else if (weth.equals(inputCurrency) && outputCurrency.isNative) {
            return {
                wrapType: WrapType.UNWRAP,
                execute:
                    sufficientBalance && inputAmount
                        ? async () => {
                              try {
                                  const txReceipt = await wethContract.withdraw(`0x${inputAmount.quotient.toString(16)}`);
                                  addTransaction(txReceipt, { summary: t`Unwrap ${inputAmount.toSignificant(6)} W${chainSymbol} to ${chainSymbol}` });
                              } catch (error) {
                                  console.error("Could not withdraw", error);
                              }
                          }
                        : undefined,
                inputError: sufficientBalance ? undefined : hasInputAmount ? t`Insufficient W${chainSymbol} balance` : t`Enter W${chainSymbol} amount`,
            };
        } else {
            return NOT_APPLICABLE;
        }
    }, [wethContract, chainId, inputCurrency, outputCurrency, inputAmount, balance, addTransaction]);
}
