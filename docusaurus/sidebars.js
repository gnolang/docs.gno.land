// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
    tutorialSidebar: [
        'overview',
        {
            type: 'category',
            label: 'Getting Started',
            link: {type: 'doc', id: 'getting-started/getting-started'},
            items: [
                {
                    type: 'category',
                    label: 'Local Setup',
                    link: {type: 'doc', id: 'getting-started/local-setup/local-setup'},
                    items: [
                        'getting-started/local-setup/installation',
                        'getting-started/local-setup/browsing-gnoland',
                        'getting-started/local-setup/creating-a-keypair',
                        'getting-started/local-setup/interacting-with-gnoland',
                    ]
                },
                'getting-started/playground-start',
            ],
        },
        {
            type: 'category',
            label: 'How-to Guides',
            link: {type: 'doc', id: 'how-to-guides/how-to-guides'},
            items: [
                'how-to-guides/simple-contract',
                'how-to-guides/simple-library',
                'how-to-guides/testing-gno',
                'how-to-guides/deploy',
                'how-to-guides/write-simple-dapp',
                'how-to-guides/creating-grc20',
                'how-to-guides/connect-from-go',
                'how-to-guides/connect-wallet-dapp',
                'how-to-guides/port-solidity-to-gno',
            ],
        },
        {
            type: 'category',
            label: 'Concepts',
            link: {type: 'doc', id: 'concepts/concepts'},
            items: [
                'concepts/realms',
                'concepts/packages',
                'concepts/namespaces',
                {
                    type: 'category',
                    label: 'Standard Libraries',
                    link: {type: 'doc', id: 'concepts/stdlibs/stdlibs'},
                    items: [
                        'concepts/stdlibs/banker',
                        'concepts/stdlibs/coin',
                        'concepts/stdlibs/events',
                        'concepts/stdlibs/gnopher-hole-stdlib',
                    ]
                },
                'concepts/gnovm',
                'concepts/gno-language',
                'concepts/testnets',
                'concepts/effective-gno',
                'concepts/proof-of-contribution',
                'concepts/tendermint2',
                'concepts/portal-loop',
                'concepts/gno-modules',
                'concepts/gno-test',
                'concepts/from-go-to-gno',
            ],
        },
        {
            type: 'category',
            label: 'Gno Tooling',
            link: {type: 'doc', id: 'gno-tooling/gno-tooling'},
            items: [
                'gno-tooling/cli/gno-tooling-gno',
                {
                    type: 'category',
                    label: 'gnokey',
                    link: {type: 'doc', id: 'gno-tooling/cli/gnokey/gnokey'},
                    items: [
                        'gno-tooling/cli/gnokey/working-with-key-pairs',
                        'gno-tooling/cli/gnokey/state-changing-calls',
                        'gno-tooling/cli/gnokey/querying-a-network',
                        'gno-tooling/cli/gnokey/full-security-tx',
                    ]
                },
                'gno-tooling/cli/gno-tooling-gnodev',
                'gno-tooling/cli/gno-tooling-gnoland',
                {
                    type: 'category',
                    label: 'gnofaucet',
                    link: {type: 'doc', id: 'gno-tooling/cli/faucet/gno-tooling-gnofaucet'},
                    items: [
                        'gno-tooling/cli/faucet/running-a-faucet',
                    ]
                },
            ]
        },
        {
            type: 'category',
            label: 'Gno Infrastructure',
            link: {type: 'doc', id: 'gno-infrastructure/gno-infrastructure'},
            items: [
                {
                    type: 'category',
                    label: 'Validators',
                    link: {type: 'doc', id: 'gno-infrastructure/validators/validators-overview'},
                    items: [
                        'gno-infrastructure/validators/validators-setting-up-a-new-chain',
                        'gno-infrastructure/validators/validators-connect-to-and-existing-gno-chain',
                        'gno-infrastructure/validators/validators-running-a-validator',
                        'gno-infrastructure/validators/validators-faq',
                    ]
                },
                'gno-infrastructure/premining-balances',
            ],
        },
        {
            type: 'category',
            label: 'Reference',
            link: {type: 'doc', id: 'reference/reference'},
            items: [
                'reference/rpc-endpoints',
                'reference/network-config',
                {
                    type: 'category',
                    label: 'Standard Libraries',
                    link: {type: 'doc', id: 'reference/stdlibs/stdlibs'},
                    items: [
                        {
                            type: 'category',
                            label: 'std',
                            items: [
                                'reference/stdlibs/std/address',
                                'reference/stdlibs/std/banker',
                                'reference/stdlibs/std/coin',
                                'reference/stdlibs/std/coins',
                                'reference/stdlibs/std/realm',
                                'reference/stdlibs/std/chain',
                                'reference/stdlibs/std/testing',
                            ]
                        }
                    ]
                },
                'reference/go-gno-compatibility',
                {
                    type: 'category',
                    label: 'tm2-js-client',
                    link: {type: 'doc', id: 'reference/tm2-js-client/tm2-js-client'},
                    items: [
                        'reference/tm2-js-client/tm2-js-wallet',
                        {
                            type: 'category',
                            label: 'Provider',
                            items: [
                                'reference/tm2-js-client/Provider/tm2-js-provider',
                                'reference/tm2-js-client/Provider/tm2-js-json-rpc-provider',
                                'reference/tm2-js-client/Provider/tm2-js-ws-provider',
                                'reference/tm2-js-client/Provider/tm2-js-utility',
                            ]
                        },
                        {
                            type: 'category',
                            label: 'Signer',
                            items: [
                                'reference/tm2-js-client/Signer/tm2-js-signer',
                                'reference/tm2-js-client/Signer/tm2-js-key',
                                'reference/tm2-js-client/Signer/tm2-js-ledger',
                            ]
                        },
                    ]
                },
                {
                    type: 'category',
                    label: 'gno-js-client',
                    link: {type: 'doc', id: 'reference/gno-js-client/gno-js-client'},
                    items: [
                        'reference/gno-js-client/gno-js-provider',
                        'reference/gno-js-client/gno-js-wallet',
                    ]
                },
                {
                    type: 'category',
                    label: 'gnoclient',
                    link: {type: 'doc', id: 'reference/gnoclient/gnoclient'},
                    items: []
                },
            ],
        },
    ],
};

module.exports = sidebars;
