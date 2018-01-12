const Maps = (() => {
  const TURN_PROXIMITY = 2;
  const WAYPOINT_PROXIMITY = 6;

  let directionsService;

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

  const parseWaypoints = (route) =>
    route.routes[0].overview_path
      .map(computeLLpair);


  // public
  const initialize = () => {
    directionsService = new google.maps.DirectionsService();
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
      .then((route) => ({
        turns: parseTurns(route),
        waypoints: parseWaypoints(route)
      }));
  const navigate = (route, location) => ({
    turns: distance(location, route.turns[0]) < TURN_PROXIMITY
      ? route.turns.slice(1)
      : route.turns,
    waypoints: distance(location, route.waypoints[0]) < WAYPOINT_PROXIMITY
      ? route.waypoints.slice(1)
      : route.waypoints
  });
  return {
    initialize,
    heading,
    distance,
    route,
    navigate
  };
})();