const Renderer = (() => {
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
  return { render };
})();