class Level {
  constructor() {
    this.assets = {};
    this.assetsLoaded = 0;
    this.isFinished = false;
  }

  assetLoaded(assetKey) {
    if (this.assetLoadedCallback) this.assetLoadedCallback(++this.assetsLoaded, assetKey);
  }

  load() {
    let assetKeys = Object.keys(this.assets);
    let self = this;
    let loadPromise = new Promise((resolve) => {
      function loadAsset(assetIndex) {
        if (assetKeys[assetIndex]) {
          let assetKey = assetKeys[assetIndex];
          setTimeout(() => {
            self[assetKey] = self.assets[assetKey]();
            self.assetLoaded(assetKey);
            loadAsset(assetIndex + 1);
          });
        } else {
          resolve();
        }
      }
      loadAsset(0);
    });
    return loadPromise;
  }

  update(/* delta */) {
    // Override to update level specific objects not updated other ways.
  }

  clear() {
    // Override to clear level specific objects not known by GAME.
  }
}
export default Level;
