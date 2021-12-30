import * as React from "react";
import { useState, useEffect, useRef } from "react";
import MapGL, { NavigationControl } from "react-map-gl";
import "./App.css";
import ReactSlider from "react-slider";
import Slider from "react-input-slider";

const axios = require("axios");
const MAPBOX_TOKEN =
  "pk.eyJ1IjoicHJpeWFqb3NoaXBqIiwiYSI6ImNreGMzMGtjazBrcHAyb3BkeW52YjNwdHEifQ.uk5RQR864AEZkNtLFB6sTQ";

function App() {
  const [state, setState] = useState({ x: 80 });
  const [centerArr, setCenterArr] = useState([]);
  const [allLayers, setAllLayers] = useState([]);
  const [allSliderStep, setAllSliderStep] = useState([]);
  const [currentTime, setCurrentTime] = useState([]);
 
  const [layer, setLayer] = useState("");
  const [layer1, setLayer1] = useState("");
  const [isPlay, setIsPlay] = useState(true);
  const [viewport, setViewport] = useState({
    latitude: 37.8,
    longitude: -122.4,
    zoom: 14,
    bearing: 0,
    pitch: 0,
  });

  useEffect(() => {
    axios
      .get("https://d39iuqtftml5m4.cloudfront.net/radar/germany/w3_hd_sat.json")
      .then(function (response) {
        let testarr = response.data.center;
        setCenterArr(testarr);
        setLayer(
          "https://d39iuqtftml5m4.cloudfront.net" +
            response.data.timesteps[0].tiles
        );
        setAllLayers(response.data.timesteps);
      })
      .catch(function (error) {
        console.log("error:", error);
      })
      .then(function () {});
  }, []);

  const navControlStyle = {
    right: 10,
    top: 10,
  };

  const rasterStyle = {
    version: 8,
    sources: {
      "raster-tiles": {
        type: "raster",
        tiles: [layer],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: "test",
        type: "raster",
        source: "raster-tiles",
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  };

  const rasterStyle1 = {
    version: 8,
    sources: {
      "raster-tiles": {
        type: "raster",
        tiles: [layer1],
        tileSize: 256,
      },
    },
    center: centerArr,
    layers: [
      {
        id: "test",
        type: "raster",
        source: "raster-tiles",
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  };

  const onCLickPlayPause = (e) => {
    setIsPlay(!isPlay);
    if(allSliderStep.length>0){
      timer();
    }  else{
      setTimeout(() => {
        setIsPlay(true);
      }, 60);   
    }
  };

  function tConvert(time) {
    var myTime = time.substr(11, 5).replace("/.*(d{2}:d{2}:d{2}).*/", "$1");
    time = myTime;
    time = time
      .toString()
      .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    if (time.length > 1) {
      time = time.slice(1);
      time[5] = +time[0] < 12 ? "AM" : "PM";
      time[0] = +time[0] % 12 || 12;
    }
    return time.join("");
  }

  const SliderArea = (x) => {
    setState({ x: parseFloat(x.toFixed(2)) });
    setCurrentTime(tConvert(allLayers[x].date));
    setLayer("https://d39iuqtftml5m4.cloudfront.net" + allLayers[x].tiles);
    let result = [...allSliderStep];
    result.push(x);
    setAllSliderStep(result);
  };

  function timer(interval = 1500) {
    function loop(count = 1) {
      let myTimeout;
      if (count - 1 <= allSliderStep.length - 1) {
        myTimeout = setTimeout(loop, interval, ++count);
        setState({ x: parseFloat(allSliderStep[count - 1]) });
      } else {
        setIsPlay(true);
        clearTimeout(myTimeout);
      }
    }
    loop();
  }

  return (
    <div className="container">
      <div className="row _mt">
        <div className="col-sm-12">
          <MapGL
            {...viewport}
            width="50vw"
            height="80vh"
            mapStyle={rasterStyle}
            onViewportChange={setViewport}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl style={navControlStyle} />
          </MapGL>
        </div>
        <div className="col-sm-3">
        <button
            onClick={(e) => onCLickPlayPause(e)}
            className="play-pause-btn"
          >
            {isPlay ? (
              <i className="fa fa-play blue"></i>
            ) : (
              <i className="blue fa fa-pause"></i>
            )}
          </button>
          
        <span>{currentTime}</span>

        </div>
        <div className="col-sm-9">
          <Slider
            axis="x"
            xstep={1}
            xmin={0}
            xmax={allLayers.length - 1}
            x={state.x}
            onChange={({ x }) => SliderArea(x)}
          />

        
        </div>
      </div>
    </div>
  );
}
export default App;
