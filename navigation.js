const getHeading = (from, to) => google.maps.geometry.spherical.computeHeading(
  new google.maps.LatLng(from),
  new google.maps.LatLng(to)
);

const getDistance = (from, to) => google.maps.geometry.spherical.computeDistanceBetween(
  new google.maps.LatLng(from),
  new google.maps.LatLng(to)
);

const getWaypoints = (result) => result.routes[0].overview_path
  .map(({lat, lng}) => ({lat: lat(), lng: lng()}));

const getTurns = (result) => result.routes[0].legs[0].steps
  .filter(({maneuver}) => maneuver.startsWith('turn'))
  .map(({start_location: {lat, lng}}) => ({lat: lat(), lng: lng()}));

const makeGetRoute = (directionsService) => (origin, destination, travelMode='BICYCLING') => new Promise((resolve, reject) => {
  directionsService.route({
    origin,
    destination,
    travelMode
  }, (result, status) => {
    if (status === 'OK') {
      resolve(result);
    } else {
      reject({
        status,
        result
      });
    }
  })
});