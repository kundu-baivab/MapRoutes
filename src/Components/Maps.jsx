import { useState, useEffect, useRef, useContext } from "react";
import Map, { Marker } from "react-map-gl";
import pin from "../assets/loc.png";
import SrcCoordsContext from "../Context/SrcCoordsContext";
import DestnCoordsContext from "../Context/DestnCoordsContext";
import DirectionDataContext from "../Context/DirectionDataContext";
import MapBoxRoute from "./MapBoxRoute";
import srcdot from "../assets/src.svg";
import stopdot from "../assets/stop.svg";
import dstnicon from "../assets/dstn.svg";

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_DRIVING_ENDPOINT =
  "https://api.mapbox.com/directions/v5/mapbox/driving/";

const Maps = ({waypoints}) => {
  const mapRef = useRef();

  const { srcCoords, setSrcCoords } = useContext(SrcCoordsContext);
  const { destCoords, setDestCoords } = useContext(DestnCoordsContext);
  const { directionData, setDirectionData } = useContext(DirectionDataContext);

  // Use to fly to Src Marker
  useEffect(() => {
    if (srcCoords) {
      mapRef.current?.flyTo({
        center: [srcCoords.long, srcCoords.lat],
        duration: 2500,
      });
    }
  }, [srcCoords]);

  // Use to fly to Destn Marker
  useEffect(() => {
    if (destCoords) {
      mapRef.current?.flyTo({
        center: [destCoords.long, destCoords.lat],
        duration: 2500,
      });
    }
  }, [destCoords]);

  useEffect(()=>{
    if (srcCoords && destCoords) {
        getDirectionRoute();
      }
  },[srcCoords,destCoords,waypoints]);

  const getDirectionRoute = async () => {
    const waypointStr = waypoints
      .map((wp) => `${wp.long},${wp.lat}`)
      .join(";");
    const endpoint = `${MAPBOX_DRIVING_ENDPOINT}${srcCoords.long},${srcCoords.lat};${waypoints.length > 0 ? waypointStr + ";" : ""}${destCoords.long},${destCoords.lat}?overview=full&geometries=geojson&access_token=${TOKEN}`;

    const res = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await res.json();
    setDirectionData(result);
  };

  const [userLocation, setUserLocation] = useState();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <div>
      {userLocation ? (
        <Map
          ref={mapRef}
          mapboxAccessToken={TOKEN}
          initialViewState={{
            longitude: userLocation.longitude,
            latitude: userLocation.latitude,
            zoom: 4,
          }}
          style={{ height: 500, width: "100%", overflow: "visible", borderColor:'black' }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          transitionDuration="200"
        >
          {/* User Loaction Marker */}
          <Marker
            longitude={userLocation.longitude}
            latitude={userLocation.latitude}
            anchor="bottom"
          >
            <img src={pin} width={20} height={28} alt="User Location" />
          </Marker>
          {/* Source Marker */}
          {srcCoords.length !== 0 ? (
            <Marker
              longitude={srcCoords?.long}
              latitude={srcCoords?.lat}
              anchor="bottom"
            >
              <img src={srcdot} width={20} height={28} alt="Source" />
            </Marker>
          ) : null}

          {/* Waypoints Markers */}
          {waypoints.map((waypoint, index) => (
            <Marker
              key={index}
              longitude={waypoint.long}
              latitude={waypoint.lat}
              anchor="bottom"
            >
              <img src={stopdot} width={20} height={28} alt={`Stop ${index + 1}`} />
            </Marker>
          ))}

          {/* Destination Marker */}
          {destCoords.length !== 0 ? (
            <Marker
              longitude={destCoords?.long}
              latitude={destCoords?.lat}
              anchor="bottom"
            >
              <img src={dstnicon} width={20} height={28} alt="Destination" />
            </Marker>
          ) : null}
          {directionData?.routes ? (
            <MapBoxRoute
              coordinates={directionData?.routes[0]?.geometry?.coordinates}
            />
          ) : null}
        </Map>
      ) : null}
    </div>
  );
};

export default Maps;
