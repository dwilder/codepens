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
  const createLoader = () => {
    const loader = document.createElement('div');
    loader.className = 'loader';
    return loader;
  };

  const createSpoke = (side, index) => {
    const spoke = document.createElement('div');
    spoke.className = 'indicator--' + side + '-' + index;
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
    const loader = createLoader();
    attachSpokes(loader);
    return loader;
  })();
}

replaceLoaders();
