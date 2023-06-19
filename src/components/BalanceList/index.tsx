import type { Coin } from "@cosmjs/stargate";
import { Component, For } from "solid-js";

import "./index.css";

export const BalanceList: Component<{ balances: Coin[]; title: string }> = ({
  balances,
  title,
}) => {
  return (
    <div class="balances-container">
      <h4>{title}</h4>
      <ul>
        <For each={balances}>
          {(b, i) => (
            <li>
              {b.amount} <span class="symbol">{b.denom}</span>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
};
