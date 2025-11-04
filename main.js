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
    let tmp = seed;
    // eslint-disable-next-line func-names
    return function () {
      tmp |= 0;
      tmp = (tmp + 0x9e3779b9) | 0;
      tmp ^= tmp >>> 16;
      tmp = Math.imul(tmp, 0x21f0aaad);
      tmp ^= tmp >>> 15;
      tmp = Math.imul(tmp, 0x735a2d97);
      return ((tmp ^= tmp >>> 15) >>> 0) / 4294967296;
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
        candidates:
          "🥦 Broccoli\n🥕 Carrot\n🧅 Onion\n🌶️ Pepper\n🍆 Eggplant\n🥔 Potato",
        endWithAll: true,
        back2back: true,
      },
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
  },
  watch: {
    vegetable() {
      document.title = `${this.vegetable} Légume`;
    },
    config: {
      handler() {
        this.saveConfig();
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
    this.config.candidates = utils
      .shuffleSeeded(Object.keys(VEGETABLES), this.config.seed)
      .map((key) => `${key} ${VEGETABLES[key]}`)
      .slice(0, 6)
      .join("\n");
    this.loadConfig();
  },
  methods: {
    getTime(minutes) {
      return `${(minutes / 60).toFixed(0).padStart(2, "0")}:${(minutes % 60)
        .toFixed(0)
        .padStart(2, "0")}`;
    },
    showApp() {
      document.getElementById("app").setAttribute("style", "");
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
  },
});

window.onload = () => {
  app.mount("#app");
};
