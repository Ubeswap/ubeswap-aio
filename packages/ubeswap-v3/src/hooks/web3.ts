import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { gnosisSafe, injected, ontoconnector, OntoWalletConnector } from "../connectors";
import { OntoWindow } from "../models/types/global";

export function useEagerConnect() {
    const { activate, active } = useWeb3React();
    const [tried, setTried] = useState(false);

    // gnosisSafe.isSafeApp() races a timeout against postMessage, so it delays pageload if we are not in a safe app;
    // if we are not embedded in an iframe, it is not worth checking
    const [triedSafe, setTriedSafe] = useState(!(window.parent !== window));
    const [triedOnto, setTriedOnto] = useState(false);

    // first, try connecting to a gnosis safe
    useEffect(() => {
        if (!triedSafe) {
            gnosisSafe.isSafeApp().then((loadedInSafe) => {
                if (loadedInSafe) {
                    activate(gnosisSafe, undefined, true).catch(() => {
                        setTriedSafe(true);
                    });
                } else {
                    setTriedSafe(true);
                }
            });
        }
    }, [activate, setTriedSafe, triedSafe]);

    useEffect(() => {
        if (!active && triedSafe && !triedOnto) {
            const timeout = new Promise((res, rej) => setTimeout(rej, 8000));
            const isAuthorized = ontoconnector.isAuthorized();

            Promise.race([isAuthorized, timeout])
                .then((isAuthorized) => {
                    if (isAuthorized) {
                        activate(ontoconnector, undefined, true).catch(() => {
                            setTriedOnto(true);
                        });
                    } else {
                        if (isMobile && window.ethereum) {
                            activate(injected, undefined, true).catch(() => {
                                setTriedOnto(true);
                            });
                        } else {
                            setTriedOnto(true);
                        }
                    }
                })
                .catch((e) => window.location.reload());
        } else {
            setTriedOnto(true);
        }
    }, [activate, setTriedSafe, triedOnto]);

    // then, if that fails, try connecting to an injected connector
    //@ts-ignore
    useEffect(async () => {
        if (!active && triedSafe && triedOnto) {
            const timeout = new Promise((res, rej) => setTimeout(rej, 8000));
            const isAuthorized = injected.isAuthorized();

            Promise.race([isAuthorized, timeout])
                .then((isAuthorized) => {
                    if (isAuthorized) {
                        activate(injected, undefined, true).catch((e) => {
                            setTried(true);
                        });
                    } else {
                        if (isMobile && window.ethereum) {
                            activate(injected, undefined, true).catch(() => {
                                setTried(true);
                            });
                        } else {
                            setTried(true);
                        }
                    }
                })
                .catch((e) => window.location.reload());
        }
    }, [activate, active, triedSafe, triedOnto]);

    // wait until we get confirmation of a connection to flip the flag
    useEffect(() => {
        if (active) {
            setTried(true);
            setTriedOnto(true);
        }
    }, [active]);

    return tried && triedOnto;
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
    const { active, error, activate } = useWeb3React();

    const ontoWrongChain = !!localStorage.getItem("ontoWarning");

    useEffect(() => {
        if (!error) return;

        if (error instanceof UnsupportedChainIdError) {
            const _window = window as unknown as OntoWindow;
            if (_window.onto && _window.onto.selectedAddress !== "") {
                localStorage.setItem("ontoWarning", "true");
                window.location.reload();
            }
        }
    }, [error, ontoWrongChain]);

    useEffect(() => {
        const ethereum = window.ethereum;

        if (ethereum && ethereum.on && !active && !error && !suppress) {
            const handleChainChanged = () => {
                // eat errors
                activate(injected, undefined, true).catch((error) => {
                    console.error("Failed to activate after chain changed", error);
                });
            };

            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length > 0) {
                    // eat errors
                    localStorage.setItem("ontoWarning", "");
                    activate(injected, undefined, true).catch((error) => {
                        console.error("Failed to activate after accounts changed", error);
                    });
                }
            };

            ethereum.on("chainChanged", handleChainChanged);
            ethereum.on("accountsChanged", handleAccountsChanged);

            return () => {
                if (ethereum.removeListener) {
                    ethereum.removeListener("chainChanged", handleChainChanged);
                    ethereum.removeListener("accountsChanged", handleAccountsChanged);
                }
            };
        }
        return undefined;
    }, [active, error, suppress, activate]);
}
