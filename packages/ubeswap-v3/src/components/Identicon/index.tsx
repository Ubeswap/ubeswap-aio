import { useEffect, useRef } from "react";
import Jazzicon from "@metamask/jazzicon";
import { StyledIdenticonContainer } from "./styled";
import { useContractKit } from "@celo-tools/use-contractkit";

export default function Identicon() {
    const ref = useRef<HTMLDivElement>();

    const { address } = useContractKit();

    useEffect(() => {
        if (address && ref.current) {
            ref.current.innerHTML = "";
            ref.current.appendChild(Jazzicon(16, parseInt(address.slice(2, 10), 16)));
        }
    }, [address]);

    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    return <StyledIdenticonContainer ref={ref as any} />;
}
