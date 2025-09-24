import React from "react";
import { Collapse as ReactCollapse } from "react-collapse";

type CollapseProps = {
  isActive: boolean;
  children: React.ReactElement;
};

export default class Collapse extends React.Component<CollapseProps> {
  static defaultProps = {
    isActive: true,
  };

  render() {
    return (
      // @ts-ignore
      <ReactCollapse isOpened={this.props.isActive}>
        {this.props.children}
      </ReactCollapse>
    );
  }
}
