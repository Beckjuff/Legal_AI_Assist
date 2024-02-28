<template>
  <footer class="footer">
    <div class="container">
      <div class="about--row">
        <p>
          {{ $t("footer.languageDisclaimer") }}
          <br />
          {{ $t("footer.languageAsk") }}: <a href=""></a>.
        </p>
        <p>
          {{ $t("footer.freeAndOpenSource") }}
          <a target="_blank" href="https://ronanfuruta.com">Ronan Furuta</a>
        </p>
        <p>
          {{ $t("footer.questionsAndSuggestions") }}
          <a href=""></a>
        </p>
        <p>
          {{ $t("footer.github") }}
          <a target="_blank" href="">Github</a>
        </p>
        <small>
          {{ $t("footer.legal") }}
          <a @click="logTermsClick" target="_blank" href="">{{
            $t("footer.tos")
          }}</a>
          {{ $t("footer.and") }}
          <a @click="logPrivacyClick" target="_blank" href="">{{
            $t("footer.pp")
          }}</a>
        </small>
      </div>
    </div>
  </footer>
</template>
<script>
import Locale from "./locale";
const version = require("../../package").version;
export default {
  name: "Footer",
  components: { Locale },
  data() {
    return {
      version: version,
    };
  },
  methods: {
    logPrivacyClick() {
      if (this.$analytics) {
        this.$analytics.logEvent("privacyPolicyClicked");
      }
    },
    logTermsClick() {
      if (this.$analytics) {
        this.$analytics.logEvent("termsOfServiceClicked");
      }
    },
  },
};
</script>
