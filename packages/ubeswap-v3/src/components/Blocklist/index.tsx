import { ReactNode, useMemo } from "react";
import { useContractKit } from "@celo-tools/use-contractkit";

// SDN OFAC addresses
const BLOCKED_ADDRESSES: string[] = [
    "0x7F367cC41522cE07553e823bf3be79A889DEbe1B",
    "0xd882cFc20F52f2599D84b8e8D58C7FB62cfE344b",
    "0x901bb9583b24D97e995513C6778dc6888AB6870e",
    "0xA7e5d5A720f06526557c513402f2e6B5fA20b008",
    "0x8576aCC5C05D6Ce88f4e49bf65BdF0C62F91353C",
];

export default function Blocklist({ children }: { children: ReactNode }) {
    const { address } = useContractKit();
    const blocked: boolean = useMemo(() => Boolean(address && BLOCKED_ADDRESSES.indexOf(address) !== -1), [address]);
    if (blocked) {
        return <div>Blocked address</div>;
    }
    return <>{children}</>;
}
