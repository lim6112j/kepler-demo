import React from 'react'
import { connect } from "react-redux";
import { addDataToMap } from "kepler.gl/actions";
import useSwr from "swr";
import { useDispatch } from "react-redux";
import KeplerGlSchema from 'kepler.gl/schemas';
import { injectComponents, PanelHeaderFactory } from 'kepler.gl/components';
const customTheme = {
  sidePanelBg: '#1f1d2c'
}
//const CustomHeader = () => (<div class="header"> <img src="dist/planning/icon.png" /> <b> Mobble Planner</b></div>);
const CustomHeader = (state) => (<div className="header"> <img src="icon.png" /><b> Mobble Planner</b></div>);

// create a factory
const myCustomHeaderFactory = () => CustomHeader;
// Inject custom header into Kepler.gl,
const KeplerGl = injectComponents([
  [PanelHeaderFactory, myCustomHeaderFactory]
]);
const getMapConfig = (TravelTime) => {

  return KeplerGlSchema.getConfigToSave(TravelTime);
}

function Map(props) {
  //console.log(props.keplerGl)
  const dispatch = useDispatch();
  const { data } = useSwr("covid", async () => {
    const response = await fetch(
      //"https://raw.githubusercontent.com/uber-web/kepler.gl-data/master/movement_pittsburgh/data.csv"
      "https://gist.githubusercontent.com/leighhalliday/a994915d8050e90d413515e97babd3b3/raw/a3eaaadcc784168e3845a98931780bd60afb362f/covid19.json"
    );
    //const dataText = await response.text();
    //const data = csvToJSON(dataText)
    const data = await response.json()
    return data;
  });
  React.useEffect(() => {
    console.log('callback called')
    if (props.keplerGl.TravelTime !== undefined) {
      console.log(getMapConfig(props.keplerGl.TravelTime))
    }
  }, [props.keplerGl.TravelTime])
  //const keplerGl = this.props.keplerGl
  //const mapToSave = KeplerGlSchema.save(keplerGl.TravelTime);
  React.useEffect(() => {
    if (data) {
      dispatch(
        addDataToMap({
          datasets: {
            info: {
              label: "TravelTime",
              id: "TravelTime"
            },
            data
          },
          option: {
            centerMap: true,
            readOnly: false
          },
          config: {}
        })
      );
    }
  }, [dispatch, data]);

  return (
    <KeplerGl
      id="TravelTime"
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_API}
      width={window.innerWidth}
      height={window.innerHeight}
      theme={customTheme}
    />
  );
}
const mapStateToProps = state => state

const mapDispatchToProps = (dispatch, props) => ({
  dispatch,
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
