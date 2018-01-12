const LEDs = (() => {
  const NUM_LEDS = 32; // the number of lights on the device
  const MAX_SPREAD = 0.25;// proportion of lights that activate above distance threshold
  const MIN_SPREAD_LEDS = 1.5;// minimum number of lights that activate at low distances (should be at least 1)
  const DISTANCE_THRESHOLD = 100; // distance below which light display will narrow

  const getIdealCenter = (heading) => (NUM_LEDS * (heading/360)) % NUM_LEDS

  const getSpread = (distance) => {
    if (distance > DISTANCE_THRESHOLD) {
      return (MAX_SPREAD / 2);
    } else {
      return (distance / DISTANCE_THRESHOLD) * (MAX_SPREAD / 2)
    }
  }

  const getLEDdistance = (index, center) => Math.min(
    Math.abs((index + NUM_LEDS) - center),
    Math.abs(index - (center + NUM_LEDS)),
    Math.abs(index - center)
  );

  const toLEDstate = (heading, distance) => {
    const output = [];
    const idealCenter = getIdealCenter(heading);
    const spreadFactor = getSpread(distance);
    const spread = Math.max(MIN_SPREAD_LEDS, spreadFactor * NUM_LEDS);
    for (let i = 0; i < NUM_LEDS; i ++) {
      const ledDistance = getLEDdistance(i, idealCenter);
      if (ledDistance < spread) {
        output.push(Math.sqrt(1 - (ledDistance / spread)));
      } else {
        output.push(0);
      }
    }
    return output;
  }

  return {
    toLEDstate
  };
})();