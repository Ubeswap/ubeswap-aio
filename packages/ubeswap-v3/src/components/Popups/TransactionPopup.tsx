import { useContractKit } from "@celo-tools/use-contractkit";
import { AlertCircle, CheckCircle } from "react-feather";
import { ExternalLink } from "../../theme";
import { ExplorerDataType, getExplorerLink } from "../../utils/getExplorerLink";
import { ChainId } from "@ubeswap/sdk";

interface TransactionPopupProps {
    hash: string;
    success?: boolean;
    summary?: string;
}

export default function TransactionPopup({ hash, success, summary }: TransactionPopupProps) {
    const { network } = useContractKit();
    const chainId = network.chainId as unknown as ChainId;

    return (
        <div id={success ? `transaction-success-toast` : `transaction-failed-toast`} className={`${hash} f f-ac`}>
            <div className={"pr-1"}>{success ? <CheckCircle color={"var(--green)"} size={"1.5rem"} /> : <AlertCircle color={"var(--red)"} size={"1.5rem"} />}</div>
            <div>
                <div className={"mb-025"}>{summary ?? `Hash: ` + hash.slice(0, 8) + "..." + hash.slice(58, 65)}</div>
                {chainId && <ExternalLink href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}>View on Explorer</ExternalLink>}
            </div>
        </div>
    );
}
