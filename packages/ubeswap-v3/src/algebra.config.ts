// import WDOGE_LOGO from "./assets/images/doge-logo.png";
// import USDC_LOGO from "./assets/svg/usd-coin-usdc-logo.svg";
// import ETH_LOGO from "./assets/images/ether-logo.png";

export default {
    CHAIN_PARAMS: {
        chainId: 42220,
        chainIdHex: "0xA4EC",
        chainName: "Celo",
        wrappedNativeCurrency: {
            name: "Celo",
            symbol: "CELO",
            decimals: 18,
            address: "0x471ece3750da237f93b8e339c536989b8978a438",
            logo: "https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_CELO.png",
        },
        rpcURL: "https://forno.celo.org",
        blockExplorerURL: "https://celoscan.io",
    },

    // Token addresses should be in lowercase
    DEFAULT_TOKEN_LIST: {
        // Tokens, which would be displayed on the top of Token Selector Modal
        defaultTokens: {
            ["0x471ece3750da237f93b8e339c536989b8978a438"]: { name: "CELO", symbol: "CELO", decimals: 18 },
            ["0x765de816845861e75a25fca122bb6898b8b1282a"]: { name: "Celo Dollar", symbol: "cUSD", decimals: 18 },
            ["0x00be915b9dcf56a3cbe739d9b9c202ca692409ec"]: { name: "Ubeswap", symbol: "UBE", decimals: 18 },
        },
        // Tokens, which would be used for creating multihop routes
        tokensForMultihop: {
            ["0x471ece3750da237f93b8e339c536989b8978a438"]: { name: "CELO", symbol: "CELO", decimals: 18 },
            ["0x765de816845861e75a25fca122bb6898b8b1282a"]: { name: "Celo Dollar", symbol: "cUSD", decimals: 18 },
            ["0x00be915b9dcf56a3cbe739d9b9c202ca692409ec"]: { name: "Ubeswap", symbol: "UBE", decimals: 18 },
        },
        tokensLogos: {
            ["0x471ece3750da237f93b8e339c536989b8978a438"]: "https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_CELO.png",
            ["0x765de816845861e75a25fca122bb6898b8b1282a"]: "https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png",
            ["0x00be915b9dcf56a3cbe739d9b9c202ca692409ec"]: "https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_UBE.png",
        },
        stableTokens: {
            ["0x765de816845861e75a25fca122bb6898b8b1282a"]: { name: "Celo Dollar", symbol: "cUSD", decimals: 18 },
        },
        stableTokenForUSDPrice: { address: "0x765de816845861e75a25fca122bb6898b8b1282a", name: "Celo Dollar", symbol: "cUSD", decimals: 18 },
        // Real tokens and their possible fake names. Used for token launch safety
        filterForScamTokens: {
            tokensForCheck: {
                ["DD"]: "0x582daef1f36d6009f64b74519cfd612a8467be18",
                ["DC"]: "0x7b4328c127b85369d9f82ca0503b000d09cf9180",
            },
            possibleFakeNames: [
                {
                    names: ["Doge Dragon", "DogeDragon", "Dragon Doge", "DragonDoge"],
                    realAddress: "0x582daef1f36d6009f64b74519cfd612a8467be18",
                },
                {
                    names: ["Dogechain Token", "DogeChain Token", "Dogechain", "DogeChain"],
                    realAddresses: "0x7b4328c127b85369d9f82ca0503b000d09cf9180",
                },
            ],
        },
    },

    V3_CONTRACTS: {
        POOL_DEPLOYER_ADDRESS: "0xcC980E18E3efa39e4dD98F057A432343D534314D",
        FACTORY_ADDRESS: "0x9e7C3C558173B08B3050863dde8104657e80a1c6",
        QUOTER_ADDRESS: "0xFB71f6cF2f22A94A7Ce417CCB3134af8A221575A",
        SWAP_ROUTER_ADDRESS: "0x0Ec0d90443A42a7A98bB3BbA5a3b548C338d4253",
        NONFUNGIBLE_POSITION_MANAGER_ADDRESS: "0xc8f82019C41b5de01aBcdDB3cc92c93fCD3aBB7F",
        MULTICALL_ADDRESS: "0x12BC3d39614403856C7f8D14c4B69ccb8Ef6423d",
        MIGRATOR_ADDRESS: "0x71199Ad3138e223Bb0c33925e5867f2400d5125B",
        FARMING_CENTER_ADDRESS: "0xA3e87FA978ea6D889120A1699365a19dDa6FB361",
        LIMIT_FARMING_ADDRESS: "0x74df876f14AE61D2b13677479bbcde6Dff450D9c",
        ETERNAL_FARMING_ADDRESS: "0x38E111394c68b3dA454d16CDEEe58cfB76AE43B7",
        POOL_INIT_CODE_HASH: "0x6ec6c9c8091d160c0aa74b2b14ba9c1717e95093bd3ac085cee99a49aab294a4",
    },

    SUBGRAPH: {
        infoURL: "https://api.thegraph.com/subgraphs/name/iliaazhel/ubeswap",
        farmingURL: "https://api.thegraph.com/subgraphs/name/ubeswap/algebrafarming",
        blocklyticsURL: "https://api.thegraph.com/subgraphs/name/ubeswap/celo-blocks",
    },

    API: {
        eternalFarmsAPR: "https://api.algebra.finance/api/APR/eternalFarmings/?network=Dogechain-Quickswap",
        limitFarmsAPR: "https://api.algebra.finance/api/APR/limitFarmings/",
        eternalFarmsTVL: "https://api.algebra.finance/api/TVL/eternalFarmings/?network=Dogechain-Quickswap",
        limitFarmsTVL: "https://api.algebra.finance/api/TVL/limitFarmings/",
        poolsAPR: "https://api.algebra.finance/api/APR/pools/?network=Dogechain-Quickswap",
    },

    MISC: {
        title: "Ubeswap",
        description: "Swap and provide liquidity on Ubeswap",
        appURL: "dogechain.quickswap.exchange",
    },
};
