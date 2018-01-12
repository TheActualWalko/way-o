const canvas = document.getElementById('readout');
const context = canvas.getContext('2d');
const radius = (Math.min(canvas.width, canvas.height) / 2) - 10;

context.lineWidth = 5;

const render = (ledState) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!ledState) {
    return;
  }
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

let deviceHeading = 0;
let currentLocation;
let currentRoute;

let drawRingInterval;

const drawRing = () => {
  if (currentRoute.waypoints.length === 0) {
    clearInterval(drawRingInterval);
    render(null);
    return;
  }
  render(
    LEDs.toLEDstate(
      Maps.heading(currentLocation, currentRoute.waypoints[0]) + deviceHeading,
      Maps.distance(currentLocation, currentRoute.waypoints[0])
    )
  );
}

const updateReadouts = () => {
  document.getElementById('device').innerHTML = deviceHeading;
  document.getElementById('distance').innerHTML = Maps.distance(currentLocation, currentRoute.waypoints[0]);
  document.getElementById('heading').innerHTML = Maps.heading(currentLocation, currentRoute.waypoints[0]);
}

function onMapsLoaded() {
  Maps.initialize();

  Device.onOrientation((heading) => {
    deviceHeading = heading;
    updateReadouts();
  });

  Device.onLocation((location) => {
    currentLocation = location;
    currentRoute = Maps.navigate(currentRoute, location);
    updateReadouts();
  });

  Device.location()
    .then((location) => {
      currentLocation = location;
      return Maps.route(
        location,
        {
          lat: 48.4234358,
          lng: -123.3643227
        }
      );
    })
    .then((route) => {
      currentRoute = route;
      Device.run()
      drawRingInterval = setInterval(drawRing, 16.6);
      updateReadouts();
    });
}