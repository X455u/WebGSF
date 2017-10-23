class HeadsUpDisplay {
  constructor() {
    document.body.innerHTML += `<style>
      .bar {
        position: fixed;
        left: 20px;
        width: 200px;
        height: 20px;
        border-style: solid;
        border-radius: 5px;
        border-width: 1px;
        overflow: hidden;
      }
      .bar.hp {
        bottom: 20px;
        border-color: darkred;
      }
      .bar.shield {
        bottom: 60px;
        border-color: darkblue;
      }
      .stat {
        width: 100%;
        height: 100%;
      }
      .stat.hp {
        background-color: red;
      }
      .stat.shield {
        background-color: blue;
      }
    </style>`;
    this.hpBar = document.createElement('div');
    this.hpBar.className = 'bar hp';
    document.body.appendChild(this.hpBar);
    this.hpStat = document.createElement('div');
    this.hpStat.className = 'stat hp';
    this.hpBar.appendChild(this.hpStat);
    this.shieldBar = document.createElement('div');
    this.shieldBar.className = 'bar shield';
    document.body.appendChild(this.shieldBar);
    this.shieldStat = document.createElement('div');
    this.shieldStat.className = 'stat shield';
    this.shieldBar.appendChild(this.shieldStat);
  }

  updateHP(hpPercent) {
    this.hpStat.style.width = `${hpPercent * 100}%`;
  }

  updateShield(shieldPercent) {
    this.shieldStat.style.width = `${shieldPercent * 100}%`;
  }
}
export const HUD = new HeadsUpDisplay();
