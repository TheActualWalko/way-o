const Device = (() => {
  const POSITION_POLL_TIMEOUT = 4000;

  const orientationListeners = [];
  const locationListeners = [];

  const runOrientationListeners = (eventData) => {
    const rawHeading = event.webkitCompassHeading
      ? event.webkitCompassHeading
      : event.alpha;
    if (rawHeading === null || rawHeading === undefined) {
      console.error('usable heading not found in device orientation event.', eventData);
      window.removeEventListener('deviceorientation', runOrientationListeners);
      return;
    }
    const deviceHeading = (rawHeading + 90) % 360;
    orientationListeners.forEach((listener) => listener(deviceHeading))
  };

  const onOrientation = (listener) => {
    orientationListeners.push(listener);
  }

  const onLocation = (listener) => {
    locationListeners.push(listener);
  }

  const location = () => new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition((position) => {
      if (!position.coords) {
        console.error(position);
        reject('coords not found in position');
      } else {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }
    });
  });

  const run = () => {
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', runOrientationListeners);
    } else {
      console.error('device orientation event not supported.');
    }

    const interval = setInterval(() => {
        location().then((result) => {
          locationListeners.forEach((listener) => listener(result));
        });
      },
      POSITION_POLL_TIMEOUT
    );
  }

  return {
    run,
    location,
    onOrientation,
    onLocation
  };
})();