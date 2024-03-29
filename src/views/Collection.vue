<template>
  <div class="home page">
    <nav class="nav">
      <form @submit.prevent class="search__form">
        <input
          v-model="search"
          type="text"
          class="input search"
          :placeholder="$t('search')"
        />
      </form>
      <button class="btn new" @click="newDoc">{{ $t("new") }}</button>
      <Locale v-if="prominentLocale"></Locale>

      <router-link to="/settings"
        ><img :src="$store.getters.user.photoURL" class="user" alt=""
      /></router-link>
    </nav>
    <div v-if="$store.getters.feedback" class="feedBackBar">
      <div class="container">
        <p>Do you Have Feedback?</p>
        <button class="btn--dark" @click="feedBack()">
          Tell us what you think
        </button>
      </div>
    </div>
    <div v-if="!docsLoaded" class="loading">
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
      <p class="version">v{{ version }}</p>
    </div>
    <div v-if="docsLoaded" class="redesign__collection__heading">
      <router-link to="/">{{ $t("back") }}</router-link>
      <h1>{{ title }}</h1>
    </div>

    <section v-if="docsLoaded" class="redesign__documentGroup">
      <h3>{{ $t("homeContext.recentDocs") }}</h3>
      <div class="redesign__document__grid">
        <div
          :key="doc.id"
          @contextmenu.prevent="
            $refs.menu.close();
            $refs.menu.open($event, doc);
          "
          v-for="doc in filteredDocs"
          class="redesign__document__container"
        >
          <router-link :to="openUrl(doc)" class="redesign__document">
            <p class="redesign__document__title">{{ doc.title }}</p>
            <p class="redesign__document__desc">
              {{ $t("opened") }}: {{ lastEdited(doc.opened) }}.
              {{ $t("owner") }}: {{ doc.owner }}
            </p>
          </router-link>
        </div>
        <vue-context ref="menu">
          <template slot-scope="child" v-if="child.data">
            <li>
              <router-link :to="openUrl(child.data)" target="_blank">{{
                $t("homeContext.OpenTab")
              }}</router-link>
            </li>
            <li>
              <a
                @click.prevent="deleteDoc(child.data)"
                class="btn--inline red"
                >{{ $t("delete") }}</a
              >
            </li>
          </template>
        </vue-context>
        <div v-if="docs.length <= 0 && docsLoaded" class="noDocs">
          <img src="../assets/undraw_files_6b3d.svg" alt="No Documents" />
          <h3>{{ $t("noDocs") }}</h3>
          <p>{{ $t("noDocsDesc") }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Locale from "@/components/locale.vue";
import VueContext from "vue-context";
import VueTagsInput from "@johmun/vue-tags-input";

let timeout = null;
export default {
  name: "Home",
  components: { Locale, VueContext, VueTagsInput },
  head: {
    title: {
      inner: "Legal Assistant",
      complement: "Documents",
    },
  },
  data() {
    return {
      tagModalDoc: false,
      tags: [],
      tag: "",
      tagModal: false,
      validation: [
        {
          classes: "no-braces",
          rule: ({ text }) => {
            let regex = /[^A-Za-z0-9\s]+/;
            // console.log(text,regex.test(text) )
            return regex.test(text);
          },
        },
      ],
      collectionsEnabled:
        this.$config.getValue("collectionsEnabled").asBoolean() ||
        window.location.hostname === "localhost",
      featureModal: false,
      prominentLocale: this.$config
        .getValue("prominentLocalDisplay")
        .asBoolean(),
      feedbackConfig: this.$config.getValue("feedback").asBoolean(),
      locale: "en",
      search: "",
      loaded: false,
      accountInfo: false,
      version: require("../../package.json").version,
      trace: this.$perf.trace("loadCollectionDocuments"),
      feedback: false,
    };
  },
  created() {
    this.trace.start();
  },
  computed: {
    title() {
      return this.$store.getters.collections[this.$route.params.id].title;
    },
    docsLoaded() {
      return this.$store.state.docsLoaded;
    },
    docs() {
      if (this.$store.getters.userDocs.length > 0) {
        if (this.$analytics) {
          this.$analytics.setUserProperties({
            docCount: this.$store.getters.userDocs.length,
          });
        }
      }

      return this.$store.getters.userDocs;
    },
    collectionFilter() {
      return this.docs.filter((i) => {
        return (
          this.$store.getters.collections[this.$route.params.id].docs.indexOf(
            i.id,
          ) >= 0
        );
      });
    },
    filteredDocs() {
      if (this.search.length <= 0) {
        return this.collectionFilter;
      } else {
        return this.collectionFilter.filter((i) => {
          clearTimeout(timeout);
          // timeout = setTimeout(this.logSearch, 1000)
          return i.title.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
        });
      }
    },
    photoURL() {
      return `url(${this.$store.state.user.photoURL}) no-repeat center center`;
    },
    user() {
      return this.$store.state.user;
    },
  },
  methods: {
    openTagModal(doc) {
      this.tagModalDoc = doc;
      try {
        this.tags = doc.tags.map((i) => {
          i.text = i.text.replace(/_/g, " ");
          return i;
        });
      } catch {
        this.tags = [];
      }

      this.tag = "";
      this.tagModal = true;
    },
    closeTagModal() {
      this.tagModal = false;
      let tags = this.tags;
      if (!tags) {
        tags = [];
      }
      tags = tags.filter((tag) => {
        return tag.tiClasses.indexOf("ti-invalid") == -1;
      });
      tags = tags.map((i) => {
        i.text = i.text.replace(/ /g, "_");
        return i;
      });
      this.$store.commit("setTags", {
        id: this.tagModalDoc.id,
        tags: tags,
      });
      fetch(
        `${this.$store.getters.api}/api/v1/collections/${this.user.uid}/${this.tagModalDoc.id}`,
        {
          method: "post",
          headers: {
            Authorization: this.$store.getters.fbToken,
            "content-type": "application/json",
          },
          body: JSON.stringify({ tags: tags, time: this.$moment().unix() }),
        },
      )
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            console.log("updated tags");
          }
        });
    },
    deleteDoc(doc) {
      this.$swal({
        title: "Are you sure?",
        text: `Once deleted, you will not be able to recover ${doc.title}`,
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willDelete) => {
        if (willDelete) {
          fetch(
            `${this.$store.getters.api}/api/v1/documents/${this.user.uid}/${doc.id}`,
            {
              method: "delete",
              headers: {
                Authorization: this.$store.getters.fbToken,
                "content-type": "application/json",
              },
              body: JSON.stringify({
                deleteDoc: true,
                time: this.$moment().unix(),
              }),
            },
          )
            .then((res) => res.json())
            .then((res) => {
              if (res.success) {
                this.$store.dispatch("fetchDocs");

                if (this.$analytics) {
                  this.$analytics.logEvent("deletedDoc");
                }
              }
            });
        }
      });
    },
    feedBack() {
      window.localStorage.setItem("feedback", "true");
      this.$store.commit("feedback", false);
      if (this.$analytics) {
        this.$analytics.logEvent("openedFeedback");
      }
      var win = window.open(
        "https://ronan092344.typeform.com/to/WkVNS1",
        "_blank",
      );
      win.focus();
    },
    closeFeatureModal() {
      this.featureModal = false;
      if (this.$analytics) {
        this.$analytics.logEvent("closedLanguageFeature");
      }
      localStorage.setItem("languageFeature", "true");
    },
    openUrl(doc) {
      if (doc.sharedDoc) {
        return "/shared/" + this.user.uid + "/" + doc.id;
      } else {
        return "/d/" + this.user.uid + "/" + doc.id;
      }
    },
    logSearch() {
      console.log("Log search");
      timeout = null;
      if (this.$analytics) {
        this.$analytics.logEvent("searching");
      }
    },
    logOut() {
      if (this.$analytics) {
        this.$analytics.logEvent("logout");
      }
      this.$firebase
        .auth()
        .signOut()
        .then(() => {
          window.location.href = "";
        });
    },
    lastEdited(time) {
      return this.$moment.unix(time).fromNow();
    },
    newDoc() {
      swal(this.$t("newDocName") + ":", {
        content: "input",
        button: this.$t("ok"),
      }).then((value) => {
        if (value != null) {
          if (value.length <= 0) {
            value = "Untitled";
          }

          fetch(`${this.$store.getters.api}/api/v1/documents/new`, {
            method: "post",
            headers: {
              Authorization: this.$store.getters.fbToken,
              "content-type": "application/json",
            },
            body: JSON.stringify({ title: value, time: this.$moment().unix() }),
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.success) {
                if (this.$analytics) {
                  this.$analytics.logEvent("newDoc");
                }
                this.$router.push(
                  `/d/${this.$store.getters.user.uid}/${res.id}`,
                );
              }
            });
        }
      });
    },
  },

  mounted() {
    if (this.$analytics) {
      this.$analytics.logEvent("openedCollectionDocumentsPage");
    }
    this.$firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.$firebase
          .auth()
          .currentUser.getIdToken(/* forceRefresh */ true)
          .then((idToken) => {
            if (!localStorage.getItem("feedback") && this.feedbackConfig) {
              this.$store.commit("feedback", true);
            }
            // Send token to your backend via HTTPS
            this.$store.commit("setToken", idToken);
            this.$store.dispatch("fetchDocs");
            if (!this.$store.getters.collections[this.$route.params.id]) {
              this.$router.push("/");
            }
            this.loaded = true;
            this.trace.stop();
            if (
              !localStorage.getItem("languageFeature") &&
              this.prominentLocale
            ) {
              this.featureModal = true;
              if (this.$analytics) {
                this.$analytics.logEvent("shownLanguageFeature");
              }
            }
          });
      } else {
      }
    });
  },
};
</script>
