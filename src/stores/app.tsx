import { CHAIN_ID, REGISTRY_CHAIN_NAME } from "@/constants";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";
import { OfflineAminoSigner, AccountData } from "@keplr-wallet/types";
import { chains } from "chain-registry";
import { createSignal, createMemo, createRoot } from "solid-js";

const rpc = chains.find((c) => c.chain_name === REGISTRY_CHAIN_NAME)!.apis!
  .rpc![0].address;

function createSignerStore() {
  const [signer, setSigner] = createSignal<OfflineAminoSigner | null>(null);
  const [account, setAccount] = createSignal<AccountData | null>(null);

  const isConnected = createMemo(() => {
    return account !== null;
  });

  const connectToWallet = async () => {
    if (window.keplr) {
      const keplr = window.keplr;
      await keplr.enable([CHAIN_ID]);
      const signer = keplr.getOfflineSigner(CHAIN_ID);

      const accounts = await signer.getAccounts();
      setSigner(signer);
      setAccount(accounts[0]);
    }
  };
  //const increment = () => setCount(count() + 1);
  //const doubleCount = createMemo(() => count() * 2);

  return { signer, connectToWallet, account, isConnected };
}

/*
interface QueryStore {
  queryClient: StargateClient | null;
  initialize: () => Promise<void>;
  useInitializedClient: () => Promise<StargateClient>;
}
export const useQueryClient = create<QueryStore>((set, get) => {
  return {
    queryClient: null,
    useInitializedClient: async () => {
      let client = get().queryClient;
      if (client) {
        return client;
      } else {
        await get().initialize();
        client = get().queryClient;
        return client!;
      }
    },
    initialize: async () => {
      const rpc = chains.find((c) => c.chain_name === REGISTRY_CHAIN_NAME)!
        .apis!.rpc![0].address;

      const client = await StargateClient.connect(rpc);

      set((state) => ({
        queryClient: client,
      }));
    },
  };
});*/

function createQueryStore() {
  const [stargateClient, setStargateClient] =
    createSignal<Promise<StargateClient> >(StargateClient.connect(rpc));
  const [wasmClient, setWasmClient] =
    createSignal<Promise<CosmWasmClient>>(CosmWasmClient.connect(rpc));

    /*
  (() => {
    setStargateClient();
    setWasmClient();
  })();
*/

  return { stargateClient, wasmClient };
}

const useSignerStore = createRoot(createSignerStore);
const useQueryStore = createRoot(createQueryStore);
export default { useSignerStore, useQueryStore };
