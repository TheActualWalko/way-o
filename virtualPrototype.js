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
let nextWaypointIndex = 0;
let nextTurnIndex = 0;

let deviceHeading = 0;

const update = () => {
  render(toLEDstate(heading + deviceHeading, distance));
  document.getElementById('distance').innerHTML = distance;
  document.getElementById('heading').innerHTML = heading;
}

if (window.DeviceOrientationEvent) {
  // Listen for the deviceorientation event and handle the raw data
  window.addEventListener('deviceorientation', function(eventData) {
    console.log(eventData);
    if(event.webkitCompassHeading) {
      // Apple works only with this, alpha doesn't work
      deviceHeading = event.webkitCompassHeading;
    }
    else deviceHeading = event.alpha || 0;
    deviceHeading = (deviceHeading + 90) % 360;
    document.getElementById('device').innerHTML = deviceHeading;
    update();
  });
}

function onMapsLoaded() {
  const directionsService = new google.maps.DirectionsService();
  const directionsDisplay = new google.maps.DirectionsRenderer();
  let umarker;
  let nmarker;

  setInterval(() => {

    navigator.geolocation.getCurrentPosition(function(position) {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      console.log(pos);

      if (!umarker) {
         umarker = new google.maps.Marker({
          map,
          label: "U",
          position: pos
        });
      } else {
        umarker.setPosition(pos);
      }

      if (waypoints.length) {
        waypointDistance = getDistance(pos, waypoints[nextWaypointIndex]);
        if (waypointDistance < 6) {
          if (nextWaypointIndex < waypoints.length - 1){
            nextWaypointIndex ++;
          }
        }
        if (!nmarker) {
          nmarker = new google.maps.Marker({
            map,
            label: "N",
            position: waypoints[nextWaypointIndex]
          });
        } else {
          nmarker.setPosition(waypoints[nextWaypointIndex]);
        }
        heading = getHeading(pos, waypoints[nextWaypointIndex]);
        turnDistance = getDistance(pos, turns[nextTurnIndex]);
        if (distance < 2) {
          nextTurnIndex ++;
          if (nextTurnIndex < turns.length) {
            distance = getDistance(pos, turns[nextTurnIndex]);
          } else {
            distance = 0;
          }
        }
        update();
      }
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  }, 4000);

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
    })
    .catch((result) => console.log(result))
}