/* eslint-disable react/no-unescaped-entities */
import "mapbox-gl/dist/mapbox-gl.css";
import {Helmet} from 'react-helmet';
import Navbar from "./Components/Navbar";
import MainBody from "./Components/MainBody";


function App() {
  return (
    <div>
      <Helmet>
        <style>{'body { background-color: #E9EEF2; }'}</style>
      </Helmet>
      <Navbar />
      <div className="container" style={{ backgroundColor: "#E9EEF2" }}>
        <p className="headtext">
          Let's calculate <strong style={{ margin: "0 5px" }}>distance</strong>{" "}
          from Google maps
        </p>
        <MainBody/>
      </div>
    </div>
  );
}

export default App;
