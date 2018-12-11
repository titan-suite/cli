module.exports = {
    defaultBlockchain: "aion",
    blockchains: {
        aion: {
            networks: {
                development: {
                    host: "http://TITAN.DEV.NODE",
                    defaultAccount: "",
                    password: ""
                },
                mainnet: {
                    host:
                        "http://api.nodesmith.io/v1/aion/mainnet/jsonrpc?apiKey=API_KEY",
                    defaultAccount: "",
                    password: ""
                },
                testnet: {
                    host:
                        "https://api.nodesmith.io/v1/aion/testnet/jsonrpc?apiKey=API_KEY",
                    defaultAccount: "",
                    password: ""
                }
            }
        },
        ethereum: {
            networks: {
                development: {
                    host: "http://127.0.0.1:8545",
                    defaultAccount: "",
                    password: ""
                }
            }
        }
    }
};