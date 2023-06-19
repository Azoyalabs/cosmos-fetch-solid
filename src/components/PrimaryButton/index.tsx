import "./index.css";
import { Component, JSX } from "solid-js";

type Props = {
  onClick: () => unknown;
  children: JSX.Element | string;
};
export const PrimaryButton: Component<Props> = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>;
};
