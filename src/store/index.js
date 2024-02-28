import Vue from "vue";
import Vuex from "vuex";

import moment from "moment";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: false,
    token: false,
    docs: [],
    docsLoaded: false,
    feedback: false,
    collectionsSetting: true,
    tags: [],
    api: "",
  },
  mutations: {
    collectionsSetting(state, val) {
      state.collectionsSetting = val;
    },
    feedback(state, res) {
      state.feedback = res;
    },
    setUser(state, user) {
      state.user = user;
    },
    setDocs(state, docs) {
      state.docsLoaded = true;
      state.docs = docs;
    },
    setToken(state, token) {
      state.token = token;
    },
    setTags(state, data) {
      //console.log('setting tags')
      let id = data.id;
      let tags = data.tags;
      let i = 0;
      let index = 0;
      for (i in state.docs) {
        if (state.docs[i]["id"] === id) {
          index = i;
        }
        i++;
      }
      state.docs[index].tags = tags;
      state.tags += tags;
    },
  },
  getters: {
    collectionsSetting(state) {
      return state.collectionsSetting;
    },
    feedback(state) {
      return state.feedback;
    },
    api(state) {
      if (window.location.hostname == "localhost") {
        //   return "http://localhost:3008"
      }
      return state.api;
    },
    fbToken(state, getters) {
      if (state.token) {
        return state.token;
      } else {
        return false;
      }
    },
    user(state) {
      return state.user;
    },
    userDocs(state, getters) {
      console.log("userDocs", state.docs);
      return state.docs.sort((a, b) => {
        return b.index - a.index;
      });
    },
    collections(state) {
      let result = {};
      if (state.tags) {
      }
      state.docs.forEach((doc) => {
        if (doc.tags && doc.tags.length >= 1) {
          doc.tags.forEach((tag) => {
            if (result[tag.text]) {
              result[tag.text].docs.push(doc.id);
            } else {
              result[tag.text] = {
                id: tag.text,
                title: tag.text.replace(/_/g, " "),
                docs: [doc.id],
              };
            }
          });
        }
      });
      state.tags = Object.keys(result);
      return result;
    },
  },
  actions: {
    fetchDocs(context) {
      console.log("fetch docs");
      if (context.getters.fbToken) {
        console.log("token", context.getters.api);
        fetch(`${context.getters.api}/api/v1/documents`, {
          method: "get",
          headers: {
            Authorization:
              "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3YmFiYWFiYTEwNWFkZDZiM2ZiYjlmZjNmZjVmZTNkY2E0Y2VkYTEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiTW9vbiBHYXRlcyIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQWNIVHRmc0RJVmV2OEljcVFSMU50dkhQcERjMDEwRnlmWTVXNkJBODJOMT1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9ncmFwaGl0ZS04OGU0MSIsImF1ZCI6ImdyYXBoaXRlLTg4ZTQxIiwiYXV0aF90aW1lIjoxNjg2OTY3NDE5LCJ1c2VyX2lkIjoialFSODZCUHB1MWRGSzVWRTFkRkFaNEltNWxNMiIsInN1YiI6ImpRUjg2QlBwdTFkRks1VkUxZEZBWjRJbTVsTTIiLCJpYXQiOjE2ODY5Njc0MjAsImV4cCI6MTY4Njk3MTAyMCwiZW1haWwiOiJtb29uZ2F0ZXM1MDAwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTEwNzk3NTE1MTY2NjYxNjQzMzI5Il0sImVtYWlsIjpbIm1vb25nYXRlczUwMDBAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.jT0z8lb72yQmDYLXAyFQhIKK-xcLQdlgYRz4AkjVmKK28EPkbk9zVYsvYOxIhB50KJ2F_bZnI6wcl1Bcvv6IHosGxGSRmEdLPglbzrFwm5M63Nzio534FOGv34qgA3DLq-zx5MyUyOTci_vsYuheCOZu2Dt7aLcnGLBsSVDKOWZAljKopISB6q7gnn3D4EXs95HPGniMg2ZSwXMmkmFA17aCp1fpj0xu3Jhv90xvA8UVtjs490bHnmjsMcmBMfaNEiXxkVQFJz_MU4pQzxYIkT0OO05edivEpjBPc6JKW8_kTlc0QBEnJEU1cdF5HKi2z5A7jUDAHji3yA29fdr6nw",
          },
        })
          .then((res) => res.json())
          .then((res) => {
            context.commit("setDocs", res);
            console.log(res);
            return res;
          })
          .catch((res) => {
            console.log("error fetching docs", res);
          });
      } else {
        console.log("no token");
      }
    },
  },
  modules: {},
});
