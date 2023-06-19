import { IconDocumentation } from "@/components/icons/IconDocumentation";
import "./index.css";
import ExplainContainer from "@/components/ExplainContainer";
import { For, Show, createSignal, onMount } from "solid-js";
import { PrimaryButton } from "@/components/PrimaryButton";
import { BalanceList } from "@/components/BalanceList";
import {
  CHAIN_NAME,
  FNS_NFT_ADDRESS,
  FNS_NFT_TOKEN_ID,
  LUNA_CW20_ADDRESS,
  LUNA_CW20_OWNER_ADDRESS,
  REGISTRY_CHAIN_NAME,
} from "@/constants";
import AppStores from "@/stores/app";
import { Coin, QueryClient, setupIbcExtension } from "@cosmjs/stargate";
import { findAssetFromDenom } from "@/lib/utils";
import type { DenomTrace } from "cosmjs-types/ibc/applications/transfer/v1/transfer";
import { chains } from "chain-registry";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { fetchCW20Balance, fetchCW721Info } from "@/lib/queries";

export const HomeView = () => {
  const { account, connectToWallet, isConnected } = AppStores.useSignerStore;
  const { stargateClient, wasmClient } = AppStores.useQueryStore;

  const [balances, setBalances] = createSignal<Coin[] | null>(null);
  const [smartBalances, setSmartBalances] = createSignal<Coin[] | null>(null);
  const [ibcDenoms, setIbcDenoms] = createSignal<DenomTrace[] | null>(null);

  const [cw20Info, setcw20Info] = createSignal<{
    name: string;
    symbol: string;
    balance: number;
  } | null>(null);

  const [cw721Info, setcw721Info] = createSignal<{
    name: string;
    owner: string;
    symbol: string;
    image: string;
    description: string;
  } | null>(null);

  onMount(async () => {
    const rpc = chains.find((c) => c.chain_name === REGISTRY_CHAIN_NAME)!.apis!
      .rpc![0].address;

    const tm = await Tendermint34Client.connect(rpc);

    const client = setupIbcExtension(new QueryClient(tm));
    const { denomTraces } = await client.ibc.transfer.allDenomTraces();
    setIbcDenoms(denomTraces);
  });
  return (
    <>
      <main>
        <ExplainContainer.Container
          heading={<>Wallet Connection</>}
          icon={
            <ExplainContainer.Icon>
              <IconDocumentation></IconDocumentation>
            </ExplainContainer.Icon>
          }
        >
          <>
            <Show
              when={account()}
              fallback={
                <div>
                  <PrimaryButton onClick={connectToWallet}>
                    Connect to your fetch wallet
                  </PrimaryButton>
                </div>
              }
            >
              <div>Your connected wallet address is:</div>

              <div class="address">{account().address}</div>
            </Show>

            <div class="mt-2">
              Your crypto address is a unique identifier, it is used to receive
              and send messages, interact with the network and handle funds.
            </div>
          </>
        </ExplainContainer.Container>

        <ExplainContainer.Container
          heading={<>Bank Balances</>}
          icon={
            <ExplainContainer.Icon>
              <IconDocumentation></IconDocumentation>
            </ExplainContainer.Icon>
          }
        >
          <div>
            An address' balances can be queried using the Stargate or CosmWasm
            client. These balances are raw and you'll need to take into account
            both the decimals and the actual token denomination to display
            something comprehensible to the users. Your own balances will be
            shown after connecting your wallet.
            <Show when={isConnected() && !balances()}>
              <div class="mt-2">
                <PrimaryButton
                  onClick={async () => {
                    const initialized = await stargateClient();
                    const balances = await initialized.getAllBalances(
                      account()!.address
                    );
                    setBalances([...balances]);

                    setSmartBalances(
                      balances
                        .map((b) => {
                          return {
                            ...findAssetFromDenom(b.denom),
                            ...b,
                          };
                        })
                        .map((c) => {
                          // NOTE: chain-registry is misconfigured for atestfet
                          const decimals =
                            c.denom_units?.find(
                              (d) =>
                                d.denom === c.display || d.denom === "testfet"
                            )?.exponent ?? 1;
                          return {
                            amount: (
                              Math.pow(10, -decimals) * parseInt(c.amount)
                            ).toString(),
                            denom: c.display ?? c.denom,
                          };
                        })
                    );
                  }}
                >
                  Query Balances
                </PrimaryButton>
              </div>
            </Show>
            <Show when={balances()}>
              <div>
                <BalanceList
                  balances={balances()!}
                  title="Raw Balances"
                ></BalanceList>
              </div>
            </Show>
            <Show when={smartBalances()}>
              <div>
                <BalanceList
                  balances={smartBalances()!}
                  title="Smart Balances"
                ></BalanceList>
              </div>
            </Show>
            <div class="mt-2">
              These balances will also include Interchain tokens, most commonly
              known as IBC tokens. You'll be able to spot them thanks to their
              special denomination as it starts with <code>ibc</code>.
            </div>
            <br />
            <Show when={ibcDenoms()}>
              <div>
                <h4>
                  The {CHAIN_NAME} network handles {ibcDenoms()!.length} such
                  assets.
                </h4>

                <div class="mt-2">
                  These are:
                  <ul>
                    <For each={ibcDenoms()}>
                      {(ibc, i) => (
                        <li>
                          <span class="symbol">{ibc.baseDenom}</span> using the
                          ibc path {ibc.path}
                        </li>
                      )}
                    </For>
                  </ul>
                </div>
              </div>
            </Show>
            <br />
            Any time you find yourself dealing with such a denomination, you can
            use the
            <code>
              ibc extension for the tendermint client and its
              ibc.transfer.denomTrace
            </code>{" "}
            to translate it into one of the human readable symbol, we've just
            shown. Token informations can usually be found in the{" "}
            <a href="https://github.com/cosmos/chain-registry">
              chain registry repository
            </a>
            .
          </div>
        </ExplainContainer.Container>

        <ExplainContainer.Container
          heading={<>Smart contract - Token (CW20)</>}
          icon={
            <ExplainContainer.Icon>
              <IconDocumentation></IconDocumentation>
            </ExplainContainer.Icon>
          }
        >
          <>
            The Cosmos ecosystem has its own version of the ERC20 token standard
            from EVM chains. These are treated differently from native
            denominations and require CosmWasm and a CosmWasm client to be
            interacted with.
            <br />
            Contrary to Native denominations, CW20 includes optional marketing
            info fields.
            <div class="mt-2">
              Balance for <span class="address">{LUNA_CW20_OWNER_ADDRESS}</span>{" "}
              on the sample <span class="address">{LUNA_CW20_ADDRESS}</span>{" "}
              token:
            </div>
            <div class="mt-2">
              <Show
                when={cw20Info()}
                fallback={
                  <div>
                    <PrimaryButton
                      onClick={async () => {
                        const info = await fetchCW20Balance(await wasmClient());
                        setcw20Info(info);
                      }}
                    >
                      Query Balance
                    </PrimaryButton>
                  </div>
                }
              >
                <div>
                  <div>
                    <div>{cw20Info()!.name}</div>

                    <div>
                      {cw20Info()!.balance.toFixed(5)}
                      <span class="symbol"> {cw20Info()!.symbol}</span>
                    </div>
                  </div>
                </div>
              </Show>
            </div>
          </>
        </ExplainContainer.Container>

        <ExplainContainer.Container
          heading={<>Smart contract - NFTs (CW721)</>}
          icon={
            <ExplainContainer.Icon>
              <IconDocumentation></IconDocumentation>
            </ExplainContainer.Icon>
          }
        >
          <>
            <div>
              Just like the CW20 standard, the CW721 standard is inspired by the
              EVM one. You can query any NFT collection, its information and all
              of its individual tokens using a CosmWasm compatible client.
              <div class="mt-2">
                NFT Info for <span class="symbol">{FNS_NFT_TOKEN_ID}</span> from
                the <span class="address">{FNS_NFT_ADDRESS}</span> collection.
              </div>
            </div>

            <div class="mt-2">
              <Show
                when={cw721Info()}
                fallback={
                  <div>
                    <PrimaryButton
                      onClick={async () => {
                        const info = await fetchCW721Info(await wasmClient());
                        setcw721Info(info);
                      }}
                    >
                      Query NFT info
                    </PrimaryButton>
                  </div>
                }
              >
                <div>
                  <div class="nft__container">
                    <div class="placeholder">
                      <img src={cw721Info()!.image} />
                    </div>
                    <div class="">
                      <div class="nft__container-title">
                        {cw721Info()!.name}
                        <span class="symbol">({cw721Info()!.symbol})</span>
                      </div>

                      <div>
                        <div>
                          <h5>Owner</h5>
                          {cw721Info()!.owner}
                        </div>
                        <div>
                          <h5>Description</h5>

                          {cw721Info()!.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Show>
            </div>
          </>
        </ExplainContainer.Container>

        <ExplainContainer.Container
          heading={<>Ecosystem</>}
          icon={
            <ExplainContainer.Icon>
              <IconDocumentation></IconDocumentation>
            </ExplainContainer.Icon>
          }
        >
          <>
            If you need more resources on developing for Cosmos chains, we
            suggest paying{" "}
            <a
              href="https://github.com/cosmos/awesome-cosmos"
              target="_blank"
              rel="noopener"
            >
              Awesome Cosmos
            </a>{" "}
            a visit.
            <br />
            You can also discover innovative projects on the Fetch.ai blockchain
            on their{" "}
            <a
              href="https://fetch.ai/ecosystem/"
              target="_blank"
              rel="noopener"
            >
              ecosystem page
            </a>
            .
          </>
        </ExplainContainer.Container>
      </main>
    </>
  );
};
