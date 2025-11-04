import { createApp } from "vue";

const utils = {
  updateIcons() {
    lucide.createIcons({
      nameAttr: "icon",
      attrs: {
        width: "1.1em",
        height: "1.1em",
      },
    });
  },
  /* eslint-disable no-bitwise */
  randomSeed() {
    return (Math.random() * 2 ** 32) >>> 0;
  },
  splitmix32(seed) {
    let localSeed = seed;
    // eslint-disable-next-line func-names
    return function () {
      localSeed |= 0;
      localSeed = (localSeed + 0x9e3779b9) | 0;
      let tmp = localSeed ^ (localSeed >>> 16);
      tmp = Math.imul(tmp, 0x21f0aaad);
      tmp ^= tmp >>> 15;
      tmp = Math.imul(tmp, 0x735a2d97);
      return ((tmp ^ (tmp >>> 15)) >>> 0) / 4294967296;
    };
  },
  /* eslint-enable no-bitwise */
  randomInt(max, seed) {
    const prng = utils.splitmix32(seed);
    return Math.floor(prng() * max);
  },
  shuffleSeeded(array, seed) {
    const output = array.slice();
    const prng = utils.splitmix32(seed);
    for (let iteration = 0; iteration < array.length * 4; iteration += 1) {
      const i1 = Math.floor(prng() * array.length);
      const i2 = Math.floor(prng() * array.length);
      const tmp = output[i2];
      output[i2] = output[i1];
      output[i1] = tmp;
    }
    return output;
  },
  setCookie(cname, cvalue, exdays) {
    const date = new Date();
    date.setTime(date.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${cname}=${cvalue}; path=/; ${expires}`;
  },
  getCookie(cname, defaultValue) {
    const name = `${cname}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let index = 0; index < ca.length; index += 1) {
      let cookie = ca[index];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return defaultValue;
  },
};

class TableGenerator {
  constructor(candidates, mixThreshold, slots, seed) {
    this.candidates = candidates;
    this.size = this.candidates.length;
    this.mixThreshold = mixThreshold;
    this.slots = slots;
    this.prng = utils.splitmix32(seed);
    this.indexScores = this.initIndexScores();
    this.minIndexScore = 0;
    this.maxIndexScore = 0;
    this.mixScores = this.initMixScores();
    this.minMixScore = 0;
    this.maxMixScore = 0;
    this.lastIndexes = [];
  }

  initIndexScores() {
    return Object.fromEntries(this.candidates.map((line, index) => [index, 0]));
  }

  initMixScores() {
    const scores = {};

    for (let index1 = 0; index1 < this.candidates.length - 1; index1 += 1) {
      for (
        let index2 = index1 + 1;
        index2 < this.candidates.length;
        index2 += 1
      ) {
        scores[this.mixKey(index1, index2)] = 0;
      }
    }

    return scores;
  }

  mixKey(index1, index2) {
    return Math.min(index1, index2) * 1000 + Math.max(index1, index2);
  }

  getRandomIndex() {
    return Math.floor(this.prng() * this.size);
  }

  getRandomMix() {
    const index1 = this.getRandomIndex();
    let index2;
    do {
      index2 = this.getRandomIndex();
    } while (index1 === index2);
    return [index1, index2];
  }

  updateIndexScores() {
    this.minIndexScore = Math.min(...Object.values(this.indexScores));
    this.maxIndexScore = Math.max(...Object.values(this.indexScores));
  }

  updateMixScores() {
    this.minMixScore = Math.min(...Object.values(this.mixScores));
    this.maxMixScore = Math.max(...Object.values(this.mixScores));
  }

  indexScoreThreshold(value) {
    return (
      this.minIndexScore + (this.maxIndexScore - this.minIndexScore) * value
    );
  }

  mixScoreThreshold(value) {
    return this.minMixScore + (this.maxMixScore - this.minMixScore) * value;
  }

  getMixValue() {
    const indexScoreThreshold = this.indexScoreThreshold(this.mixThreshold);
    const mixScoreThreshold = this.mixScoreThreshold(0.25);
    let retries = 500;
    let index1, index2;
    do {
      [index1, index2] = this.getRandomMix();
    } while (
      (this.lastIndexes.includes(index1) ||
        this.lastIndexes.includes(index2) ||
        this.indexScores[index1] > indexScoreThreshold ||
        this.indexScores[index2] > indexScoreThreshold ||
        this.mixScores[this.mixKey(index1, index2)] > mixScoreThreshold) &&
      (retries -= 1) > 0
    );
    if (retries === 0) {
      return null;
    }
    this.indexScores[index1] += 1;
    this.indexScores[index2] += 1;
    this.updateIndexScores();
    this.mixScores[this.mixKey(index1, index2)] += 1;
    this.updateMixScores();
    this.lastIndexes = [index1, index2];
    return `${this.candidates[index1]} & ${this.candidates[index2]}`;
  }

  getCandidateValue() {
    const indexScoreThreshold = this.indexScoreThreshold(0.25);
    let retries = 500;
    let index;
    do {
      index = this.getRandomIndex();
    } while (
      (this.lastIndexes.includes(index) ||
        this.indexScores[index] > indexScoreThreshold) &&
      (retries -= 1) > 0
    );
    this.indexScores[index] += 1;
    this.updateIndexScores();
    this.lastIndexes = [index];
    return this.candidates[index];
  }

  getSlotValue() {
    if (this.prng() < this.mixThreshold) {
      const value = this.getMixValue();
      if (value !== null) {
        return value;
      }
    }
    return this.getCandidateValue();
  }

  generate() {
    return this.slots.map((slot) => [slot, this.getSlotValue()]);
  }
}

const VEGETABLES = {
  "🥦": "Broccoli",
  "🥕": "Carrot",
  "🧅": "Onion",
  "🌶️": "Pepper",
  "🍆": "Eggplant",
  "🥔": "Potato",
  "🍄": "Mushroom",
  "🧄": "Garlic",
  "🥬": "Lettuce",
  "🥒": "Cucumber",
  "🥑": "Avocado",
  "🌽": "Corn",
  "🫘": "Beans",
  "🫚": "Ginger",
  "🫛": "Pea",
  "🫜": "Radish",
};

const app = createApp({
  data() {
    return {
      config: {
        startTime: "21:00",
        endTime: "03:00",
        duration: 30,
        seed: utils.randomSeed(),
        candidates: "",
        endWithAll: true,
        mix: 25,
      },
      table: [],
    };
  },
  computed: {
    vegetable() {
      return Object.keys(VEGETABLES)[
        utils.randomInt(Object.keys(VEGETABLES).length, this.config.seed)
      ];
    },
    startTimeMinute() {
      return Math.floor(
        Date.parse(`1970-01-01T${this.config.startTime}:00Z`) / 60000
      );
    },
    endTimeMinute() {
      const result = Math.floor(
        Date.parse(`1970-01-01T${this.config.endTime}:00Z`) / 60000
      );
      return result < this.startTimeMinute ? result + 1440 : result;
    },
    totalDuration() {
      return this.endTimeMinute - this.startTimeMinute;
    },
    candidates() {
      return this.config.candidates
        .split("\n")
        .map((line) => line.trim())
        .filter(
          (value, index, array) =>
            value.length && array.indexOf(value) === index
        );
    },
  },
  watch: {
    vegetable() {
      document.title = `${this.vegetable} Légume`;
    },
    config: {
      handler() {
        this.saveConfig();
        this.generateData();
      },
      deep: true,
    },
  },
  updated() {
    utils.updateIcons();
  },
  mounted() {
    document.title = `${this.vegetable} Légume`;
    setTimeout(this.showApp);
    utils.updateIcons();
    this.newVegetables();
    this.loadConfig();
    this.generateData();
  },
  methods: {
    showApp() {
      document.getElementById("app").setAttribute("style", "");
    },
    getTime(minutes) {
      return `${Math.floor((minutes / 60) % 24)
        .toFixed(0)
        .padStart(2, "0")}:${(minutes % 60).toFixed(0).padStart(2, "0")}`;
    },
    newVegetables() {
      this.config.candidates = utils
        .shuffleSeeded(Object.keys(VEGETABLES), this.config.seed)
        .map((key) => `${key} ${VEGETABLES[key]}`)
        .slice(0, 6)
        .join("\n");
    },
    newSeed() {
      this.config.seed = utils.randomSeed();
    },
    saveConfig() {
      utils.setCookie("legume-config", JSON.stringify(this.config));
    },
    loadConfig() {
      const rawCookie = utils.getCookie("legume-config", null);
      if (rawCookie) {
        try {
          const parsedConfig = JSON.parse(rawCookie);
          Object.keys(parsedConfig).forEach((key) => {
            if (Object.hasOwn(this.config, key)) {
              this.config[key] = parsedConfig[key];
            }
          });
        } catch {
          /* Empty */
        }
      }
    },
    generateData() {
      if (this.candidates.length <= 2) {
        return;
      }
      const duration = parseInt(this.config.duration, 10);
      const mixThreshold = parseInt(this.config.mix, 10) / 100;
      const slots = [];
      for (
        let currentTimeMinute = this.startTimeMinute;
        currentTimeMinute < this.endTimeMinute;
        currentTimeMinute += duration
      ) {
        slots.push(this.getTime(currentTimeMinute));
      }

      const generator = new TableGenerator(
        this.candidates,
        mixThreshold,
        slots,
        this.config.seed
      );

      const table = generator.generate();

      if (this.config.endWithAll) {
        table[table.length - 1][1] = "🥗 SALAD 🥗";
      }

      this.table.splice(0, this.table.length);
      this.table.push(...table);
    },
  },
});

window.onload = () => {
  app.mount("#app");
};
