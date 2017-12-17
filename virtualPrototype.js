const toLEDstate = makeToLEDstate(32, 0.25, 100);
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

let heading = null;
let distance = Infinity;
let waypoints = [];
let turns = [];
let nextWaypoint = 0;
let nextTurn = 0;

const update = () => {
  render(toLEDstate(heading, distance));
  document.getElementById('distance').innerHTML = distance;
  document.getElementById('heading').innerHTML = heading;
}

function onMapsLoaded() {
  const directionsService = new google.maps.DirectionsService();
  const directionsDisplay = new google.maps.DirectionsRenderer();
  const map = new google.maps.Map(document.getElementById('map-wrap'));
  directionsDisplay.setMap(map);

  const from = {
    lat: 48.421566,
    lng: -123.3631124
  };
  const to = {
    lat: 48.4234358,
    lng: -123.3643227
  };

  makeGetRoute(directionsService)(from, to)
    .then((result) => {
      turns = getTurns(result);
      waypoints = getWaypoints(result);
      waypoints.push(to);
      directionsDisplay.setDirections(result);
      const markers = [];
      window.addEventListener('keypress', (evt) => {
        if (evt.key === 'a') {
          markers.push(new google.maps.Marker({
            map,
            position: waypoints[nextWaypoint]
          }));
          nextWaypoint ++;
          heading = getHeading(waypoints[nextWaypoint - 1], waypoints[nextWaypoint]);
          distance = getDistance(waypoints[nextWaypoint - 1], turns[nextTurn]);
          if (distance < 2) {
            nextTurn ++;
            if (nextTurn < turns.length) {
              distance = getDistance(waypoints[nextWaypoint - 1], turns[nextTurn]);
            } else {
              distance = 0;
            }
          }
          update();
        }
      });
    })
    .catch((result) => console.log(result))
}