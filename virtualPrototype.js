const canvas = document.getElementById('readout');
const context = canvas.getContext('2d');
const radius = (Math.min(canvas.width, canvas.height) / 2) - 10;

context.lineWidth = 5;

let deviceHeading = 0;
let currentLocation;
let currentRoute;

let drawInterval;

const draw = () => {
  if (!currentRoute || currentRoute.waypoints.length === 0) {
    Renderer.render(null);
    return;
  }
  Renderer.render(
    LEDs.toLEDstate(
      Maps.heading(currentLocation, currentRoute.waypoints[0]) + deviceHeading,
      Maps.distance(currentLocation, currentRoute.turns[0])
    )
  );
}

const updateReadouts = () => {
  document.getElementById('device').innerHTML = deviceHeading;
  document.getElementById('distance').innerHTML = Maps.distance(currentLocation, currentRoute.waypoints[0]);
  document.getElementById('heading').innerHTML = Maps.heading(currentLocation, currentRoute.turns[0]);
}

function setDestination(destination) {
  return Device.location()
    .then((location) => Maps.route(location, destination)
      .then((route) => {
        currentRoute = route;
        receiveLocation(location);
        Maps.showPoints(route.waypoints);
      })
    );
}

function receiveLocation(location) {
  currentLocation = location;

  Maps.clearMarkers();
  Maps.addMarkers([currentLocation], 'You', false);

  // short circuit if there's nothing left to compute
  if (!currentRoute) return;

  let oldRoute = currentRoute;
  currentRoute = Maps.navigate(currentRoute, location);
  Maps.addMarkers(currentRoute.waypoints, 'W', true, true);
  Maps.addMarkers(currentRoute.turns, 'T', true);

  updateReadouts();
}

function onMapsLoaded() {
  Maps.initialize(document.getElementById('map-wrap'));

  Device.onOrientation((heading) => {
    deviceHeading = heading;
    updateReadouts();
  });

  Device.onLocation(receiveLocation);

  Device.run();
  drawInterval = setInterval(draw, 16.6);

  setDestination({
    lat: 48.4234358,
    lng: -123.3643227
  });
}