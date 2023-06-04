import { useContractKit } from "@celo-tools/use-contractkit";
import { useEffect } from "react";
import ReactGA from "react-ga";
import { RouteComponentProps } from "react-router-dom";
import { getCLS, getFCP, getFID, getLCP, Metric } from "web-vitals";
import { ChainId } from "@ubeswap/sdk";

function reportWebVitals({ name, delta, id }: Metric) {
    ReactGA.timing({
        category: "Web Vitals",
        variable: name,
        value: Math.round(name === "CLS" ? delta * 1000 : delta),
        label: id,
    });
}

// tracks web vitals and pageviews
export default function GoogleAnalyticsReporter({ location: { pathname, search } }: RouteComponentProps): null {
    useEffect(() => {
        getFCP(reportWebVitals);
        getFID(reportWebVitals);
        getLCP(reportWebVitals);
        getCLS(reportWebVitals);
    }, []);

    const { network } = useContractKit();
    const chainId = network.chainId as unknown as ChainId;

    useEffect(() => {
        // cd1 - custom dimension 1 - chainId
        ReactGA.set({ cd1: chainId ?? 0 });
    }, [chainId]);

    useEffect(() => {
        ReactGA.pageview(`${pathname}${search}`);
    }, [pathname, search]);
    return null;
}
