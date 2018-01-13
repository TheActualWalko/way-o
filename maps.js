const Maps = (() => {
  // how far does a user have to be from a waypoint or turn to "pass" it?
  // use a big number here; streets can be pretty wide and location services sometimes glitches out by half a block.
  const HIT_PROXIMITY_METRES = 10;

  // if a waypoint is less than this distance from a turn, we ignore it.
  // this one doesn't have to be as big.
  const OVERLAP_PROXIMITY_METRES = 5;

  let map;
  let directionsService;
  let directionsDisplay;

  let markers = [];

  const ll = (x) => new google.maps.LatLng(x);
  const computeLLpair = ({lat, lng}) => ({
    lat: lat(),
    lng: lng()
  });

  const getRoute = (from, to) => new Promise((resolve, reject) =>
    directionsService.route(
      {
        origin: from,
        destination: to,
        travelMode: 'BICYCLING'
      },
      (result, status) => status === 'OK' ? resolve(result) : reject({status, result})
    )
  );

  const parseTurns = (route) =>
    route.routes[0].legs[0].steps
      .filter(({maneuver}) => maneuver.startsWith('turn'))
      .map(({start_location}) => start_location)
      .map(computeLLpair);

  const parseWaypoints = (route, turns) =>
    route.routes[0].overview_path
      .map(computeLLpair)
      .filter((waypoint) => {
        let foundNearbyTurn = false;
        turns.forEach((turn) => {
          if (distance(turn, waypoint) < OVERLAP_PROXIMITY_METRES) {
            foundNearbyTurn = true;
          }
        })
        return !foundNearbyTurn;
      });


  // public
  const initialize = (mapWrap) => {
    map = new google.maps.Map(mapWrap, {center:{ lat: 0, lng: 0 }, zoom: 0});
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
  }
  const heading = (from, to) =>
    google.maps.geometry.spherical.computeHeading(
      ll(from),
      ll(to)
    );
  const distance = (from, to) =>
    google.maps.geometry.spherical.computeDistanceBetween(
      ll(from),
      ll(to)
    );
  const route = (from, to) =>
    getRoute(from, to)
      .then((route) => {
        const turns = parseTurns(route);
        return {
          turns,
          waypoints: parseWaypoints(route, turns)
        }
      });
  const navigate = (route, location) => ({
    turns: distance(location, route.turns[0]) < HIT_PROXIMITY_METRES
      ? route.turns.slice(1)
      : route.turns,
    waypoints: distance(location, route.waypoints[0]) < HIT_PROXIMITY_METRES
      ? route.waypoints.slice(1)
      : route.waypoints
  });
  const clearMarkers = () => {
    markers.forEach(m => m.setMap(null));
    markers = [];
  };
  const addMarkers = (newMarkers, label, numbered, bounceFirst) => {
    newMarkers.forEach((coords, i) => {
      markers.push(new google.maps.Marker({
        map,
        animation: bounceFirst && i === 0 ? google.maps.Animation.BOUNCE : null,
        label: numbered
          ? `${label}${i + 1}`
          : label,
        position: coords
      }))
    });
  };
  const showPoints = (points) => {
    const bounds = new google.maps.LatLngBounds();
    points.forEach((coords) => bounds.extend(coords));
    map.fitBounds(bounds, 0.25);
  }
  return {
    initialize,
    heading,
    distance,
    route,
    navigate,
    clearMarkers,
    addMarkers,
    showPoints
  };
})();