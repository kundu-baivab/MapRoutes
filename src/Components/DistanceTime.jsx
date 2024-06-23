import {useContext} from 'react'
import DirectionDataContext from "../Context/DirectionDataContext";

const DistanceTime = () => {
    const { directionData, setDirectionData } = useContext(DirectionDataContext);
  return directionData?.routes && (
    <>
      {(directionData?.routes[0]?.distance * 0.001).toFixed(0)}
    </>
  ) 
}

export default DistanceTime
