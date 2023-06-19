import "./style.css";
import { Component, JSX } from "solid-js";

type Props = {
  children: string | JSX.Element | JSX.Element[];
};

type ContainerProps = {
  icon: string | JSX.Element;
  children: string | JSX.Element;
  heading: string | JSX.Element;
};

const Container: Component<ContainerProps> = ({ icon, children, heading }) => {
  return (
    <div class="item">
      {icon}
      <div class="details">
        <h3>{heading}</h3>
        {children}
      </div>
    </div>
  );
};
const Icon: Component<Props> = ({ children }) => {
  return <i>{children}</i>;
};

export default { Container, Icon };
