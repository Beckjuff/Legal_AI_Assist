<template>
  <div class="page">
    <nav class="nav editor">
      <router-link to="/"
        ><img class="brand--icon" src="@/assets/icon.svg"
      /></router-link>

      <form @submit.prevent class="docTitle">
        <input
          disabled
          v-model="doc.title"
          type="text"
          class="input title"
          :placeholder="$t('docName')"
        />
      </form>
      <p class="lastEdited nav-item">
        {{ $t("lastEdited") }}: {{ lastEdited }}
      </p>
      <p class="nav-item primary">{{ $t("viewOnly") }}</p>

      <button @click="print" class="nav-item ml">{{ $t("print") }}</button>
      <Locale></Locale>
    </nav>

    <div class="editor__app">
      <div class="editor__document"></div>
    </div>
    <div v-if="error" class="modal_container">
      <div class="modal">
        <h3>{{ $t("error") }}</h3>
        <p>{{ $t("errorNoAccess") }}</p>
        <button @click="$router.push('/')" class="btn">{{ $t("ok") }}</button>
      </div>
      <div class="modal_container" @click="$router.push('/')"></div>
    </div>
    <div v-if="!loaded" class="loading--fullscreen">
      <div class="sk-cube-grid">
        <div class="sk-cube sk-cube1"></div>
        <div class="sk-cube sk-cube2"></div>
        <div class="sk-cube sk-cube3"></div>
        <div class="sk-cube sk-cube4"></div>
        <div class="sk-cube sk-cube5"></div>
        <div class="sk-cube sk-cube6"></div>
        <div class="sk-cube sk-cube7"></div>
        <div class="sk-cube sk-cube8"></div>
        <div class="sk-cube sk-cube9"></div>
      </div>
      <img src="@/assets/wordmark.svg" alt="" />
    </div>
  </div>
</template>

<script>
import Quill from "quill/dist/quill.min.js";
import "quill/dist/quill.core.js";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import Locale from "../components/locale";

let editor;
let timeout = null;
export default {
  name: "Shared",
  head: {
    title: {
      inner: "Legal Assistant",
      complement: "Shared Document",
    },
    link: [
      {
        rel: "canonical",
        href: "",
        id: "canonical",
      },
    ],
  },
  components: { Locale },
  data() {
    return {
      doc: {},
      saved: true,
      sharingModal: false,
      shareLink: "",
      error: false,
      loaded: false,
      trace: this.$perf.trace("loadSharedDoc"),
    };
  },
  created() {
    this.trace.start();
  },
  computed: {
    lastEdited() {
      return this.$moment.unix(this.doc.date).fromNow();
    },
  },
  methods: {
    print() {
      window.print();
    },
  },
  mounted() {
    const options = {
      debug: "warn",
      modules: {
        toolbar: false,
      },
      theme: "snow",
      readOnly: true,
      placeholder: this.$t("compose"),
    };

    editor = new Quill("#doc", options);
    this.$firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log("there is user");
        this.$firebase
          .auth()
          .currentUser.getIdToken(/* forceRefresh */ true)
          .then((idToken) => {
            // Send token to your backend via HTTPS
            this.$store.commit("setToken", idToken);
            fetch(
              `${this.$store.getters.api}/api/v1/documents/${this.$route.params.user}/${this.$route.params.docId}`,
              {
                method: "get",
                headers: {
                  Authorization: this.$store.getters.fbToken,
                },
              },
            )
              .then(async (res) => {
                let jsonRes = await res.json();

                if (!jsonRes.error) {
                  this.doc = jsonRes;
                  console.log(jsonRes);
                  this.loaded = true;

                  try {
                    editor.setContents(JSON.parse(this.doc.data));
                  } catch {
                    editor.setContents(this.doc.data);
                  }
                  this.loaded = true;
                  this.trace.stop();
                } else {
                  this.loaded = true;

                  this.error = true;
                }
              })
              .catch((err) => {
                this.loaded = true;
                this.error = true;
              });
          });
      } else {
        fetch(
          `${this.$store.getters.api}/api/v1/documents/${this.$route.params.user}/${this.$route.params.docId}`,
          {
            method: "get",
            headers: {},
          },
        )
          .then(async (res) => {
            let jsonRes = await res.json();
            console.log(res, "request", jsonRes);
            if (!jsonRes.error) {
              this.doc = jsonRes;
              this.loaded = true;

              try {
                editor.setContents(JSON.parse(this.doc.data));
              } catch {
                editor.setContents(this.doc.data);
              }
            } else {
              console.log(res, "error");
              this.loaded = true;

              this.error = true;
              console.log("no access");
            }
          })
          .catch((err) => {
            console.log(err, "request");
            this.loaded = true;
            this.error = true;
            console.log("no access");
          });
      }
      if (this.$analytics) {
        this.$analytics.logEvent("openedSharedDoc", {
          doc: this.$route.params.docId,
          owner: this.$route.params.user,
          loggedIn: user != false,
        });
      }
    });
  },
};
</script>
