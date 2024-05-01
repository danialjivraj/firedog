export function fadeIn(element, duration, callback) {
  let start;
  const fadeInDuration = duration;

  function animate(timeStamp) {
    if (!start) start = timeStamp;

    const elapsed = timeStamp - start;
    const progress = elapsed / fadeInDuration;

    if (progress <= 1) {
      const opacity = progress;
      element.style.opacity = opacity;

      requestAnimationFrame(animate);
    } else {
      if (callback) {
        callback();
      }
    }
  }

  requestAnimationFrame(animate);
}

export function fadeOut(element, duration, callback) {
  let start;
  const fadeOutDuration = duration;

  function animate(timeStamp) {
    if (!start) start = timeStamp;

    const elapsed = timeStamp - start;
    const progress = elapsed / fadeOutDuration;

    if (progress <= 1) {
      const opacity = 1 - progress;
      element.style.opacity = opacity;

      requestAnimationFrame(animate);
    } else {
      if (callback) {
        callback();
      }
    }
  }

  requestAnimationFrame(animate);
}

export function fadeInAndOut(element, fadeOutDuration, blackScreenDuration, fadeInDuration, callback) {
  let startFadeOut;

  function fadeOutAnimate(timeStamp) {
    if (!startFadeOut) startFadeOut = timeStamp;

    const elapsedFadeOut = timeStamp - startFadeOut;
    const progressFadeOut = elapsedFadeOut / fadeOutDuration;

    if (progressFadeOut <= 1) {
      const opacity = 1 - progressFadeOut;
      element.style.opacity = opacity;

      requestAnimationFrame(fadeOutAnimate);
    } else {
      setTimeout(() => {
        let startFadeIn;

        function fadeInAnimate(timeStamp) {
          if (!startFadeIn) startFadeIn = timeStamp;

          const elapsedFadeIn = timeStamp - startFadeIn;
          const progressFadeIn = elapsedFadeIn / fadeInDuration;

          if (progressFadeIn <= 1) {
            const opacity = progressFadeIn;
            element.style.opacity = opacity;

            requestAnimationFrame(fadeInAnimate);
          } else {
            element.style.opacity = 1;
            if (callback) {
              callback();
            }
          }
        }

        requestAnimationFrame(fadeInAnimate);
      }, blackScreenDuration);
    }
  }

  requestAnimationFrame(fadeOutAnimate);
}
