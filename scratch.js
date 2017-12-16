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

const makeToLEDstate = (numLEDs, maxSpread, distanceThreshold) => {
  const getLEDdistance = makeGetLEDdistance(numLEDs);
  const getSpread = makeGetSpread(maxSpread, distanceThreshold);
  const getIdealCenter = makeGetIdealCenter(numLEDs);
  return (heading, distance) => {
    const output = [];
    const idealCenter = getIdealCenter(heading);
    const spreadFactor = getSpread(distance);
    const spread = Math.max(1/numLEDs, spreadFactor * numLEDs);
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

const toLEDstate = makeToLEDstate(16, 0.5, 50);

if (typeof document !== 'undefined') {
  const canvas = document.getElementById('readout');
  const context = canvas.getContext('2d');
  const radius = (Math.min(canvas.width, canvas.height) / 2) - 10;
  context.lineWidth = 5;
  const render = (ledState) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const numLEDs = ledState.length
    const rotateToNorth = Math.PI * (0.5 + (1/numLEDs));
    for (let i = 0; i < numLEDs; i ++) {
      context.strokeStyle = `rgba(255,255,255,${ledState[i]})`;
      context.beginPath();
      context.arc(
        canvas.width/2,
        canvas.height/2,
        radius,
        (Math.PI * 2 * (i/numLEDs)) - (rotateToNorth - 0.01),
        (Math.PI * 2 * ((i+1)/numLEDs)) - (rotateToNorth + 0.01)
      );
      context.stroke();
    }
  }
  let distance = 100;
  let heading = 0;
  const update = () => {
    render(toLEDstate(heading, distance));
    document.getElementById('distance').innerHTML = distance;
    document.getElementById('heading').innerHTML = heading;
  }
  const getCloser = () => {
    distance -= 10;
    update();
  }
  const getFarther = () => {
    distance += 10;
    update();
  }
  const turnLeft = () => {
    heading -= 15;
    heading = (heading + 360) % 360;
    update();
  }
  const turnRight = () => {
    heading += 15
    heading = (heading + 360) % 360;
    update();
  }
  window.addEventListener('keypress', (evt) => {
    if (evt.key === 'a') {
      turnLeft();
    } else if (evt.key === 'd') {
      turnRight();
    } else if (evt.key === 's') {
      getFarther();
    } else if (evt.key === 'w') {
      getCloser();
    }
  });
  update();
} else {
  for (let i = 0; i <= 360; i += 9) {
    console.log(toLEDstate(i, 0.5).map(x => x.toFixed(2)).join(' '));
  }
}
