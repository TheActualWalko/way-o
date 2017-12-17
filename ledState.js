const makeGetIdealCenter = (numLEDs) => (heading) => (numLEDs * (heading/360)) % numLEDs;

const makeGetSpread = (maxSpread, distanceThreshold) => (distance) => {
  if (distance > distanceThreshold) {
    return (maxSpread / 2);
  } else {
    return (distance / distanceThreshold) * (maxSpread / 2)
  }
}

const makeGetLEDdistance = (numLEDs) => (index, center) => Math.min(
  Math.abs((index + numLEDs) - center),
  Math.abs(index - (center + numLEDs)),
  Math.abs(index - center)
);

/*
  numLEDs: the number of lights on the device
  maxSpread: proportion of lights that activate above distance threshold
  distanceThreshold: distance below which light display will narrow
*/
const makeToLEDstate = (numLEDs, maxSpread, distanceThreshold) => {
  const getLEDdistance = makeGetLEDdistance(numLEDs);
  const getSpread = makeGetSpread(maxSpread, distanceThreshold);
  const getIdealCenter = makeGetIdealCenter(numLEDs);
  /*
    heading: the current best heading for the rider (in degrees, 0 being north)
    distance: the distance to the next turn
  */
  return (heading, distance) => {
    const output = [];
    const idealCenter = getIdealCenter(heading);
    const spreadFactor = getSpread(distance);
    const spread = Math.max(1.5, spreadFactor * numLEDs);
    for (let i = 0; i < numLEDs; i ++) {
      const distance = getLEDdistance(i, idealCenter);
      if (distance < spread) {
        output.push(Math.sqrt(1 - (distance / spread)));
      } else {
        output.push(0);
      }
    }
    return output;
  }
}