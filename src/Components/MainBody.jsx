import { useState, useEffect } from "react";
import SrcCoordsContext from "../Context/SrcCoordsContext";
import DestnCoordsContext from "../Context/DestnCoordsContext";
import DirectionDataContext from "../Context/DirectionDataContext";
import Maps from "./Maps";
import srcdot from "../assets/src.svg";
import stopdot from "../assets/stop.svg";
import dstnicon from "../assets/dstn.svg";
import as from "../assets/addstop.svg";
import DistanceTime from "./DistanceTime";

const BASE_URL = "https://api.mapbox.com/search/searchbox/v1/suggest?";
const MAPBOX_RETRIEVE_URL =
  "https://api.mapbox.com/search/searchbox/v1/retrieve/";
const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MainBody = () => {
  const [source, setSource] = useState("");
  const [destn, setDestn] = useState("");
  const [stops, setStops] = useState([""]);
  const [dis, setDis] = useState(false);
  const [sourceInput, setSourceInput] = useState("");
  const [destnInput, setDestnInput] = useState("");
  const [distance, setDistance] = useState(0);

  const [sourceChange, setSourceChange] = useState(false);
  const [destnChange, setDestnChange] = useState(false);
  const [stopChange, setStopChange] = useState([false]);
  const [addressList, setAddressList] = useState([]);
  const [stopAddressLists, setStopAddressLists] = useState([[]]);

  const [srcCoords, setSrcCoords] = useState([]);
  const [destCoords, setDestCoords] = useState([]);
  const [directionData, setDirectionData] = useState([]);
  const [waypoints, setWaypoints] = useState([]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (sourceChange) {
        getAddressList(source, setAddressList);
      } else if (destnChange) {
        getAddressList(destn, setAddressList);
      } else {
        stops.forEach((stop, index) => {
          if (stopChange[index]) {
            getAddressList(stop, (list) => {
              const newStopLists = [...stopAddressLists];
              newStopLists[index] = list;
              setStopAddressLists(newStopLists);
            });
          }
        });
      }
    }, 1000);
    return () => clearTimeout(delay);
  }, [source, destn, ...stops]);

  const getAddressList = async (query, setList) => {
    try {
      setList([]);
      const response = await fetch(
        `${BASE_URL}q=${query}&language=en&limit=4&session_token=[GENERATED-UUID]&country=IN&access_token=${TOKEN}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      setList(result.suggestions || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const onAddressClick = async (item, setCoordFunc) => {
    const res = await fetch(
      `${MAPBOX_RETRIEVE_URL}${item.mapbox_id}?session_token=[GENERATED-UUID]&access_token=${TOKEN}`
    );
    const result = await res.json();
    setCoordFunc({
      long: result.features[0].geometry.coordinates[0],
      lat: result.features[0].geometry.coordinates[1],
    });
  };

  const addStop = () => {
    setStops([...stops, ""]);
    setStopChange([...stopChange, false]);
    setStopAddressLists([...stopAddressLists, []]);
  };

  const removeStop = (index) => {
    const newStops = stops.slice();
    newStops.splice(index, 1);
    setStops(newStops);

    const newStopChange = stopChange.slice();
    newStopChange.splice(index, 1);
    setStopChange(newStopChange);

    const newStopLists = stopAddressLists.slice();
    newStopLists.splice(index, 1);
    setStopAddressLists(newStopLists);

    const newWaypoints = waypoints.slice();
    newWaypoints.splice(index, 1);
    setWaypoints(newWaypoints);
  };

  const removeFirstStop = () => {
    setStops([""]);
    setStopChange([false]);
    setStopAddressLists([[]]);
    setWaypoints([]);
  };

  const handleStopChange = (index, event) => {
    const newStops = stops.slice();
    newStops[index] = event.target.value;
    setStops(newStops);
    const newStopChange = stopChange.slice();
    newStopChange[index] = true;
    setStopChange(newStopChange);
  };

  const calculateDistance = () => {
    const d = <DistanceTime/>;
    setSourceInput(source);  
    setDestnInput(destn);
    setDistance(d);
    setDis(true);
  };

  return (
    <SrcCoordsContext.Provider value={{ srcCoords, setSrcCoords }}>
      <DestnCoordsContext.Provider value={{ destCoords, setDestCoords }}>
        <DirectionDataContext.Provider
          value={{ directionData, setDirectionData }}
        >
          <div className="app-container">
            <div className="dist-form">
              <div className="full-form">
                <div className="form-container">
                  <div className="trip-form-container">
                    <form>
                      <div className="form-group">
                        <label>Origin</label>
                        <div className="wrapper">
                          <img className="icon" src={srcdot} alt="" />
                          <input
                            type="text"
                            name="origin"
                            placeholder="Enter origin"
                            value={source}
                            onChange={(e) => {
                              setSource(e.target.value);
                              setSourceChange(true);
                            }}
                          />
                        </div>
                        {addressList && sourceChange && (
                          <div className="options">
                            {addressList.map((item, index) => (
                              <p
                                key={index}
                                className="option"
                                onClick={() => {
                                  setSource(item.name);
                                  onAddressClick(item, setSrcCoords);
                                  setSourceChange(false);
                                }}
                              >
                                {item.name}, {item.place_formatted}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      {stops.map((stop, index) => (
                        <div key={index} className="form-group">
                          <label>Stop {index == 0 ? "" : index + 1}</label>
                          <div className="wrapper">
                            <img className="icon" src={stopdot} alt="" />
                            <input
                              disabled={
                                source == "" || destn == "" ? true : false
                              }
                              type="text"
                              value={stop}
                              onChange={(event) =>
                                handleStopChange(index, event)
                              }
                              placeholder={`Enter stop ${
                                index == 0 ? "" : index + 1
                              }`}
                            />
                          </div>
                          {stopAddressLists[index] && stopChange[index] && (
                            <div className="options">
                              {stopAddressLists[index].map(
                                (item, itemIndex) => (
                                  <p
                                    key={itemIndex}
                                    className="option"
                                    onClick={() => {
                                      const newStops = stops.slice();
                                      newStops[index] = item.name;
                                      setStops(newStops);
                                      onAddressClick(item, (coords) => {
                                        const newWaypoints = [...waypoints];
                                        newWaypoints[index] = coords;
                                        setWaypoints(newWaypoints);
                                      });
                                      const newStopChange = stopChange.slice();
                                      newStopChange[index] = false;
                                      setStopChange(newStopChange);
                                    }}
                                  >
                                    {item.name}, {item.place_formatted}
                                  </p>
                                )
                              )}
                            </div>
                          )}
                          {stops.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeStop(index)}
                              className="remove-stop-button"
                            >
                              Remove
                            </button>
                          )}
                          {stops.length == 1 && stops[0] != "" && (
                            <button
                              type="button"
                              onClick={() => removeFirstStop()}
                              className="remove-stop-button"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <div className="button-group">
                        <button
                          disabled={source == "" || destn == "" ? true : false}
                          type="button"
                          onClick={addStop}
                          className="add-stop-button"
                        >
                          <img src={as} alt="" />
                        </button>
                      </div>
                      <div className="form-group">
                        <label>Destination</label>
                        <div className="wrapper">
                          <img className="icon" src={dstnicon} alt="" />
                          <input
                            type="text"
                            name="destination"
                            placeholder="Enter destination"
                            value={destn}
                            onChange={(e) => {
                              setDestn(e.target.value);
                              setDestnChange(true);
                            }}
                          />
                        </div>
                        {addressList && destnChange && (
                          <div className="options">
                            {addressList.map((item, index) => (
                              <p
                                key={index}
                                className="option"
                                onClick={() => {
                                  setDestn(item.name);
                                  onAddressClick(item, setDestCoords);
                                  setDestnChange(false);
                                }}
                              >
                                {item.name}, {item.place_formatted}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
                <div className="form-button">
                  <button
                    className="dis-calc"
                    disabled={!source || !destn}
                    onClick={calculateDistance}
                  >
                    Calculate
                  </button>
                </div>
              </div>
              <div className="distance">
                <div className="dis">
                  <h2>Distance</h2>
                  <p>{dis ? distance : 0} kms</p>
                </div>
                <div className="route">
                  {dis && (<p>The distance between <strong>{sourceInput}</strong> and <strong>{destnInput}</strong> via the seleted route is <strong>{distance} kms.</strong></p>)}
                </div>
              </div>
            </div>
            <div className="map-container">
              <Maps waypoints={waypoints} />
            </div>
          </div>
        </DirectionDataContext.Provider>
      </DestnCoordsContext.Provider>
    </SrcCoordsContext.Provider>
  );
};

export default MainBody;
