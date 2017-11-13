class Level {
  constructor(assetAmount, assetLoadedCallback) {
    this.assets = assetAmount;
    this.assetsLoaded = 0;
    this.assetLoadedCallback = assetLoadedCallback;
  }

  assetLoaded() {
    this.assetLoadedCallback(++this.assetsLoaded);
  }
}
export default Level;
