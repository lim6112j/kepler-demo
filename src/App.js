import React from "react";
import keplerGlReducer from "kepler.gl/reducers";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { taskMiddleware } from "react-palm/tasks";
import { Provider, useDispatch } from "react-redux";
import { addDataToMap } from "kepler.gl/actions";
import useSwr from "swr";
import KeplerGlSchema from 'kepler.gl/schemas';
import { injectComponents, PanelHeaderFactory } from 'kepler.gl/components';
// define custom header
const CustomHeader = () => (<div class="header"> <img src="dist/planning/icon.png" /> <b> Mobble Planner</b></div>);

// create a factory
const myCustomHeaderFactory = () => CustomHeader;

// Inject custom header into Kepler.gl,
const KeplerGl = injectComponents([
  [PanelHeaderFactory, myCustomHeaderFactory]
]);

// render KeplerGl, it will render your custom header
const reducers = combineReducers({
  keplerGl: keplerGlReducer
});

const store = createStore(reducers, {}, applyMiddleware(taskMiddleware));
export default function App() {
  return (
    <Provider store={store}>
      <Map />
    </Provider>
  );
}
function csvToJSON(csv_string) {

  // 1. 문자열을 줄바꿈으로 구분 => 배열에 저장
  //const rows = csv_string.split("\r\n");

  // 줄바꿈을 \n으로만 구분해야하는 경우, 아래 코드 사용
  const rows = csv_string.split("\n");


  // 2. 빈 배열 생성: CSV의 각 행을 담을 JSON 객체임
  const jsonArray = { fields: [], rows: [] };


  // 3. 제목 행 추출 후, 콤마로 구분 => 배열에 저장
  const header = rows[0].split(",");
  //0
  //{name: 'country', format: '', type: 'string'}
  //{name: 'state', format: '', type: 'string'}
  //{name: 'day', format: 'YYYY-M-D H:m:s', type: 'timestamp'}
  //{name: 'latitude', format: '', type: 'real'}
  //{name: 'longitude', format: '', type: 'real'}
  //{name: 'count', format: '', type: 'integer'}
  header.forEach(function (d) {
    d === 'day' ? jsonArray.fields.push({ name: d, format: '', type: 'timestamp' }) : jsonArray.fields.push({ name: d, format: '', type: 'integer' })
  })

  // 4. 내용 행 전체를 객체로 만들어, jsonArray에 담기
  for (let i = 1; i < rows.length; i++) {

    // 빈 객체 생성: 각 내용 행을 객체로 만들어 담아둘 객체임
    let obj = {};

    // 각 내용 행을 콤마로 구분
    let row = rows[i].split(",");

    // 각 내용행을 {제목1:내용1, 제목2:내용2, ...} 형태의 객체로 생성
    for (let j = 0; j < header.length; j++) {
      obj[header[j]] = row[j];
    }

    // 각 내용 행의 객체를 jsonArray배열에 담기
    jsonArray.rows.push(obj);

  }

  // 5. 완성된 JSON 객체 배열 반환
  return jsonArray;

  // 문자열 형태의 JSON으로 반환할 경우, 아래 코드 사용
  // return JSON.stringify(jsonArray);
}
function Map() {
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
      id="traveltime"
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_API}
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
}
