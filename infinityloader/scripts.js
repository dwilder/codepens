// How many indicators on each side?
const inum = 12;

function replaceLoaders() {
  const loaders = document.getElementsByTagName('progress');
  for (let i = 0; i < loaders.length; i++) {
    // Create the new loader:
    const loader = new InfinityLoader();

    // Get the parent node of the progress indicator:
    const parent = loaders[i].parentNode;

    // Replace the original progress indicator with the new one:
    parent.replaceChild(loader, loaders[i]);
  }
}

function InfinityLoader() {
  const createContainer = () => {
    const container = document.createElement('div');
    container.className = 'loader';
    return container;
  };

  const createSpoke = (side, index) => {
    // Create the spoke:
    const spoke = document.createElement('div');
    spoke.className = 'spoke--' + side + '-' + index;

    // Create the indicator:
    const indicator = document.createElement('div');
    indicator.className = 'indicator--' + side + '-' + index;

    // And put it in the indicator container:
    spoke.appendChild(indicator);

    return spoke;
  };

  const attachSpokes = (loader) => {
    // Create indicators:
    for (let j = 0; j < 2; j++) {
      // Pick a side:
      const side = j === 0 ? 'left' : 'right';

      for (let k = 0; k < inum; k++) {
        const spoke = createSpoke(side, k);

        // Add this one to the loader:
        loader.appendChild(spoke);
      }
    }
  };

  return (function InfinityLoader() {
    const loader = createContainer();
    attachSpokes(loader);
    return loader;
  })();
}

replaceLoaders();
