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

    <div
      v-if="collectionsEnabled && docsLoaded && docs.length > 0"
      class="redesign__documentGroup"
    >
      <h3>Collections</h3>
      <div class="redesign__document__grid">
        <router-link
          :to="'/collection/' + collection.id"
          v-for="collection in collections"
          :key="collection.id"
          class="redesign__document--collection"
        >
          <i class="fas fa-bookmark redesign__document__icon"></i>
          <div class="redesign__collection__title">
            <p class="redesign__document__title">{{ collection.title }}</p>
            <p class="redesign__document__desc">
              {{ $t("docs") }}: {{ collection.docs.length }}
            </p>
          </div>
        </router-link>
      </div>
    </div>
    <div
      v-if="collectionsCount == 0 && docsLoaded"
      class="redesign__collections__onboarding"
    >
      <p>{{ $t("collections.youHaveNone") }}</p>
      <p>{{ $t("collections.instructions") }}</p>
      <br />
      <p>{{ $t("collections.about") }}</p>
      <br />
      <p>
        {{ $t("collections.dontNeed") }}
        <router-link to="/settings">{{ $t("settingsText") }}</router-link>
      </p>
    </div>
    <div v-if="docsLoaded" class="redesign__documentGroup">
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
            <li v-if="collectionsEnabled && child.data.owner === 'You'">
              <a @click.prevent="openTagModal(child.data)">{{
                $t("homeContext.editTags")
              }}</a>
            </li>
            <li v-if="child.data.owner === 'You'">
              <a
                @click.prevent="deleteDoc(child.data)"
                class="btn--inline red"
                >{{ $t("delete") }}</a
              >
            </li>
          </template>
        </vue-context>
      </div>
      <div v-if="docs.length <= 0 && docsLoaded" class="noDocs">
        <img src="../assets/undraw_files_6b3d.svg" alt="No Documents" />
        <h3>{{ $t("noDocs") }}</h3>
        <p>{{ $t("noDocsDesc") }}</p>
      </div>
    </div>
    <div v-if="featureModal" class="modal_container">
      <div class="modal--feature">
        <img src="../assets/undraw_around_the_world_v9nu.svg" alt="" />
        <h3>{{ $t("feature.new") }}</h3>
        <p>{{ $t("feature.supports") }}</p>
        <p>{{ $t("feature.translate") }}</p>
        <p>{{ $t("feature.support") }}:</p>
        <p>{{ $t("feature.useBox") }}</p>
        <Locale></Locale>
        <button @click="closeFeatureModal" class="btn">{{ $t("ok") }}</button>
      </div>
      <div class="modal_container" @click="closeFeatureModal"></div>
    </div>
    <div v-if="collectionsFeatureModal && false" class="modal_container">
      <div class="modal--feature">
        <img src="../assets/undraw_folder_39kl.svg" alt="" />
        <h3>{{ $t("collectionsOnboard.title") }}</h3>
        <p>{{ $t("collectionsOnboard.subHead") }}</p>
        <p>{{ $t("collectionsOnboard.thinkOf") }}</p>
        <p>{{ $t("collectionsOnboard.allows") }}</p>
        <p>{{ $t("collectionsOnboard.getStarted") }}</p>
        <p>{{ $t("feature.useBox") }}</p>
        <Locale></Locale>
        <button @click="collectionsFeatureModal = false" class="btn">
          {{ $t("ok") }}
        </button>
      </div>
      <div
        class="modal_container"
        @click="collectionsFeatureModal = false"
      ></div>
    </div>
    <div v-if="tagModal" class="modal_container light">
      <div class="modal">
        <h3>{{ $t("collections.tagsFor") }} "{{ tagModalDoc.title }}"</h3>
        <p>{{ $t("collections.used") }}</p>
        <vue-tags-input
          :validation="validation"
          v-model="tag"
          :tags="tags"
          :autocomplete-items="autoCompleteItems"
          @tags-changed="(newTags) => (tags = newTags)"
        />
        <p>{{ $t("collections.onlyUse") }}</p>
        <button @click="closeTagModal" class="btn">{{ $t("done") }}</button>
      </div>
      <div class="modal_container light" @click="closeTagModal"></div>
    </div>
  </div>
</template>

<script>
import Locale from "@/components/locale.vue";
import VueContext from "vue-context";
import VueTagsInput from "@johmun/vue-tags-input";
import "../assets/redesign.scss";

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
            return regex.test(text);
          },
        },
      ],
      collectionsEnabledOnServer:
        this.$config.getValue("collectionsEnabled").asBoolean() ||
        window.location.hostname,
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
      trace: this.$perf.trace("loadDocuments"),
      feedback: false,
      shownCollections: false,
    };
  },
  created() {
    this.trace.start();
  },
  computed: {
    autoCompleteItems() {
      let items = [];
      Object.keys(this.collections).forEach((key) => {
        items.push(this.collections[key].title);
      });
      return items;
    },
    collectionsFeatureModal: {
      get() {
        console.log(
          localStorage.getItem("collectionsFeatureModal"),
          "collections settings",
        );
        if (localStorage.getItem("collectionsFeatureModal") !== "true") {
          if (!this.shownCollections && !this.featureModal) {
            return true;
          }
        }
        return false;
      },
      set(val) {
        localStorage.setItem("collectionsFeatureModal", "true");
        this.shownCollections = true;
      },
    },
    collectionsEnabled() {
      if (
        this.$store.getters.collectionsSetting === "true" ||
        this.$store.getters.collectionsSetting === true
      ) {
        console.log("true computed");
        if (this.collectionsEnabledOnServer) {
          if (this.$analytics) {
            this.$analytics.setUserProperties({ collectionsEnabled: true });
          }
          return true;
        }
      }
      if (this.$analytics) {
        this.$analytics.setUserProperties({ collectionsEnabled: false });
      }
      return false;
    },
    collections() {
      return this.$store.getters.collections
        ? this.$store.getters.collections
        : [];
    },
    collectionsCount() {
      return Object.keys(this.collections).length;
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
    filteredDocs() {
      if (this.search.length <= 0) {
        return this.$store.state.docs;
      } else {
        return this.$store.state.docs.filter((i) => {
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
      // console.log(tags, "tags", this.tagModalDoc.id)
      this.$store.commit("setTags", {
        id: this.tagModalDoc.id,
        tags: tags,
      });
      fetch(
        `${this.$store.getters.api}/api/v1/collections/${this.user.uid}/${this.tagModalDoc.id}`,
        {
          method: "post",
          headers: {
            Authorization:
              "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3YmFiYWFiYTEwNWFkZDZiM2ZiYjlmZjNmZjVmZTNkY2E0Y2VkYTEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiTW9vbiBHYXRlcyIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQWNIVHRmc0RJVmV2OEljcVFSMU50dkhQcERjMDEwRnlmWTVXNkJBODJOMT1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9ncmFwaGl0ZS04OGU0MSIsImF1ZCI6ImdyYXBoaXRlLTg4ZTQxIiwiYXV0aF90aW1lIjoxNjg2OTYyNDcxLCJ1c2VyX2lkIjoialFSODZCUHB1MWRGSzVWRTFkRkFaNEltNWxNMiIsInN1YiI6ImpRUjg2QlBwdTFkRks1VkUxZEZBWjRJbTVsTTIiLCJpYXQiOjE2ODY5NjI5NTksImV4cCI6MTY4Njk2NjU1OSwiZW1haWwiOiJtb29uZ2F0ZXM1MDAwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTEwNzk3NTE1MTY2NjYxNjQzMzI5Il0sImVtYWlsIjpbIm1vb25nYXRlczUwMDBAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.ck7MFNDKHirSqVbvdCwWFj6BEm878XjrHkpXiWZOKgtJNPwPfo-HG1wvYC01sOij0xvl4062xUX9QYm-NVLIqymIGTyswuMedmHjuwx02EYGz9-YCgQZJm0o6SrEr8czh58famB-qW1-rPVUZUONmiemKs6LW1SWWSYM-TV0YhuV63Omdu2lvLIvZpBhlcIx2ISev-aaD7K040yk4VPmAKFWmxRZvXd21YByx_-9GI7QwGWpt0alZThTwd4jt2bmTnZJxHbNhasn6iMmJs01O-w92r6FLRQZqm-F6HO09YcBWIifhpb7J9rytTEVVgekGfcKhUbUP-IB8wZCUD8itQ",
            "content-type": "application/json",
          },
          body: JSON.stringify({ tags: tags, time: this.$moment().unix() }),
        },
      )
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            console.log("updated tags");
            this.$forceUpdate();
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
      console.log("dd");
      this.$router.push(`/d/edit`);
    },
  },

  mounted() {},
};
</script>
