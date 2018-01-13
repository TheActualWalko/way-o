const LEDs = (() => {
  const NUM_LEDS = 32; // the number of lights on the device
  const MAX_SPREAD = 0.5;// proportion of lights that activate at 0 distance
  const MIN_SPREAD = 2/NUM_LEDS; // minimum proportion of lights that activate (should be at least 2 lights)
  const DISTANCE_THRESHOLD = 50; // distance below which light display will broaden

  const getIdealCenter = (heading) => (NUM_LEDS * (heading/360)) % NUM_LEDS

  const getSpread = (distance) => {
    return Math.max(
      MIN_SPREAD,
      Math.min(
        MAX_SPREAD,
        MAX_SPREAD * (1 - (distance / DISTANCE_THRESHOLD))
      )
    );
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
    const spread = spreadFactor * NUM_LEDS;
    for (let i = 0; i < NUM_LEDS; i ++) {
      const ledDistance = getLEDdistance(i, idealCenter);
      if (ledDistance < spread / 2) {
        output.push(Math.sqrt(1 - (ledDistance / (spread / 2))));
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