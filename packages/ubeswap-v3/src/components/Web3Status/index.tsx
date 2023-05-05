import { useContractKit } from "@celo-tools/use-contractkit";
import { useWeb3React } from "@web3-react/core";
import { NetworkContextName } from "../../constants/misc";
import useENSName from "../../hooks/useENSName";
import WalletModal from "../WalletModal";
import { useSortedRecentTransactions } from "../../hooks/useSortedRecentTransactions";
import { Web3StatusInner } from "./Web3StatusInner";
import { Text, Web3StatusConnect } from "./styled";
// import { Trans } from "@lingui/macro";

export default function Web3Status() {
    const { address: account1, network: network1 } = useContractKit();
    const { active, account } = useWeb3React();
    const contextNetwork = useWeb3React(NetworkContextName);
    const { ENSName } = useENSName(account ?? undefined);

    const sortedRecentTransactions = useSortedRecentTransactions();

    const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash);
    const confirmed = sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash);

    if (!contextNetwork.active && !active) {
        return (
            <Web3StatusConnect id="connect-wallet" faded={!account} disabled>
                <Text>Loading...</Text>
            </Web3StatusConnect>
        );
    }

    return (
        <>
            <Web3StatusInner />
            <WalletModal ENSName={ENSName ?? undefined} pendingTransactions={pending} confirmedTransactions={confirmed} />
        </>
    );
}
