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
    // eslint-disable-next-line max-lines-per-function, complexity, max-statements
    generateData() {
      this.table.splice(0, this.table.length);
      const duration = parseInt(this.config.duration, 10);
      const prng = utils.splitmix32(this.config.seed);
      if (this.candidates.length <= 2) {
        return;
      }
      const indexScores = Object.fromEntries(
        this.candidates.map((line, index) => [index, 0])
      );
      const mixScores = {};
      for (let index1 = 0; index1 < this.candidates.length - 1; index1 += 1) {
        for (
          let index2 = index1 + 1;
          index2 < this.candidates.length;
          index2 += 1
        ) {
          mixScores[`${index1}-${index2}`] = 0;
        }
      }
      const mixThreshold = parseInt(this.config.mix, 10) / 100;
      let lastIndexes = [];
      const getCandidateIndex = () =>
        Math.floor(this.candidates.length * prng());
      for (
        let currentTimeMinute = this.startTimeMinute;
        currentTimeMinute < this.endTimeMinute;
        currentTimeMinute += duration
      ) {
        const time = this.getTime(currentTimeMinute);
        const minIndexScore = Math.min(...Object.values(indexScores));
        const maxIndexScore = Math.max(...Object.values(indexScores));
        let shouldAddMix = prng() < mixThreshold;
        if (
          currentTimeMinute + duration >= this.endTimeMinute &&
          this.config.endWithAll
        ) {
          this.table.push([time, "🥗 Salad 🥗"]);
        } else {
          if (shouldAddMix) {
            const minMixScore = Math.min(...Object.values(mixScores));
            const maxMixScore = Math.max(...Object.values(mixScores));
            const indexScoreThreshold =
              minIndexScore + (maxIndexScore - minIndexScore) * mixThreshold;
            const mixScoreThreshold =
              minMixScore + (maxMixScore - minMixScore) * 0.25;
            let retries = 500;
            let index1 = getCandidateIndex();
            let index2 = getCandidateIndex();
            while (index2 === index1) {
              index2 = getCandidateIndex();
            }
            const key = () =>
              `${Math.min(index1, index2)}-${Math.max(index1, index2)}`;
            while (
              (lastIndexes.includes(index1) ||
                lastIndexes.includes(index2) ||
                indexScores[index1] > indexScoreThreshold ||
                indexScores[index2] > indexScoreThreshold ||
                mixScores[key()] > mixScoreThreshold) &&
              (retries -= 1) > 0
            ) {
              index1 = getCandidateIndex();
              index2 = getCandidateIndex();
              // eslint-disable-next-line max-depth
              while (index2 === index1) {
                index2 = getCandidateIndex();
              }
            }
            if (retries === 0) {
              shouldAddMix = false;
            } else {
              // eslint-disable-next-line max-depth
              if (prng() >= 0.5) {
                this.table.push([
                  time,
                  `${this.candidates[index1]} & ${this.candidates[index2]}`,
                ]);
              } else {
                this.table.push([
                  time,
                  `${this.candidates[index2]} & ${this.candidates[index1]}`,
                ]);
              }
              indexScores[index1] += 1;
              indexScores[index2] += 1;
              mixScores[key()] += 1;
              lastIndexes = [index1, index2];
            }
          }

          if (!shouldAddMix) {
            const indexScoreThreshold =
              minIndexScore + (maxIndexScore - minIndexScore) * 0.25;
            let retries = 500;
            let index = getCandidateIndex();
            while (
              (lastIndexes.includes(index) ||
                indexScores[index] > indexScoreThreshold) &&
              (retries -= 1) > 0
            ) {
              index = getCandidateIndex();
            }
            this.table.push([time, this.candidates[index]]);
            indexScores[index] += 1;
            lastIndexes = [index];
          }
        }
      }
    },
  },
});

window.onload = () => {
  app.mount("#app");
};
