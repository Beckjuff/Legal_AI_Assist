import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import firebase from "firebase/app";
import moment from "moment";
import "moment/locale/pt.js";
import swal from "sweetalert";
import _ from "lodash";
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";
import "firebase/auth";
import "firebase/remote-config";
import "firebase/analytics";
import "firebase/performance";
import "minireset.css";
import "./assets/main.scss";
import "@/assets/print.scss";
import i18n from "./i18n";
Vue.config.productionTip = false;
const version = require("../package.json").version;
const firebaseConfig = {
  apiKey: "AIzaSyCOYWtOD1IdphGrQdr561aZlKT3njL6JsY",
  authDomain: "autogpt-6f35e.firebaseapp.com",
  databaseURL: "https://autogpt-6f35e-default-rtdb.firebaseio.com",
  projectId: "autogpt-6f35e",
  storageBucket: "autogpt-6f35e.appspot.com",
  messagingSenderId: "765100482272",
  appId: "1:765100482272:web:12afe569be1f4d69acfa85",
  measurementId: "G-TGELH6F5KY",
};
firebase.initializeApp(firebaseConfig);
const locales = require.context("./locales", true, /[A-Za-z0-9-_,\s]+\.json$/i);
let loadedLocales = [];
locales.keys().forEach((key) => {
  const matched = key.match(/([A-Za-z0-9-_]+)\./i);
  if (matched && matched.length > 1) {
    const locale = matched[1];
    loadedLocales.push(locale);
  }
});

Vue.prototype.$supportedLocales = loadedLocales;
Vue.prototype.$config = firebase.remoteConfig();
Vue.prototype.$firebase = firebase;
Vue.prototype.$swal = swal;
Object.defineProperty(Vue.prototype, "$_", {
  value: _,
});

Vue.prototype.$moment = moment;

Vue.prototype.$Sentry = Sentry;
if (window.location.hostname != "localhost") {
  console.log("production", window.hostname);
  Vue.prototype.$perf = firebase.performance();
  Vue.prototype.$analytics = firebase.analytics();
  Sentry.init({
    Vue,
    dsn: "https://651a929bd0444e42ab4dd37ba4f864ac@o130965.ingest.sentry.io/289169",
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracingOrigins: ["localhost", /^\//],
      }),
    ],
    tracesSampleRate: 1,
    release: "Graphite-Writer-App@" + version,
  });
} else {
  console.log("development");
  Vue.prototype.$analytics = false;
  Vue.prototype.$perf = {
    trace() {
      return {
        stop() {
          return;
        },
        start() {
          return;
        },
      };
    },
    stop() {
      return;
    },
    start() {
      return;
    },
  };
}

let app = new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount("#app");
