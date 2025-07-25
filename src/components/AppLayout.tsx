import React from "react";
import ScrollContainer from "./ScrollContainer";
import { WithTranslation, withTranslation } from "react-i18next";
import { IconContext } from "react-icons";

type AppLayoutInternalProps = {
  toolbar: React.ReactElement;
  layerList: React.ReactElement;
  layerEditor?: React.ReactElement;
  map: React.ReactElement;
  bottom?: React.ReactElement;
  modals?: React.ReactNode;
  floorSelector?: React.ReactNode;
} & WithTranslation;

class AppLayoutInternal extends React.Component<AppLayoutInternalProps> {
  render() {
    document.body.dir = this.props.i18n.dir();

    return (
      <IconContext.Provider value={{ size: "14px" }}>
        <div className="maputnik-layout">
          {this.props.toolbar}
          <div className="maputnik-layout-main">
            <div className="maputnik-layout-list">{this.props.layerList}</div>
            <div className="maputnik-layout-drawer">
              <ScrollContainer>{this.props.layerEditor}</ScrollContainer>
            </div>
            {this.props.map}
          </div>
          {this.props.bottom && (
            <div className="maputnik-layout-bottom">{this.props.bottom}</div>
          )}
          {this.props.modals}
          {this.props.floorSelector}
        </div>
      </IconContext.Provider>
    );
  }
}

const AppLayout = withTranslation()(AppLayoutInternal);
export default AppLayout;
