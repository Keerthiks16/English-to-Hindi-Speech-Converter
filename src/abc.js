import pkg from "@vitalets/google-translate-api";
const translate = pkg.default;

translate("Hello", { to: "fr" })
  .then((res) => {
    console.log(res.text); // Bonjour
  })
  .catch((err) => {
    console.error(err);
  });
