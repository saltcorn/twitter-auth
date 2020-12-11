const TwitterStrategy = require("passport-twitter").Strategy;
const User = require("@saltcorn/data/models/user");
const Workflow = require("@saltcorn/data/models/workflow");
const Form = require("@saltcorn/data/models/form");

const { getState } = require("@saltcorn/data/db/state");

const authentication = (config) => {
  const cfg_base_url = getState().getConfig("base_url");
  const params = {
    consumerKey: config.twitterKey || "nokey",
    consumerSecret: config.twitterSecret || "nosecret",
    callbackURL: `${addSlash(cfg_base_url)}auth/callback/twitter`,
  };
  return {
    twitter: {
      icon: '<i class="fab fa-twitter"></i>',
      label: "Twitter",
      strategy: new TwitterStrategy(
        params,
        function (token, tokenSecret, profile, cb) {
          //console.log(profile);
          User.findOrCreateByAttribute("twitterId", profile.id, {
            email: "",
          }).then((u) => {
            return cb(null, u.session_object);
          });
        }
      ),
    },
  };
};
const addSlash = (s) => (s[s.length - 1] === "/" ? s : s + "/");
const configuration_workflow = () => {
  const cfg_base_url = getState().getConfig("base_url"),
    base_url = addSlash(cfg_base_url || "http://base_url");
  const blurb = [
    !cfg_base_url
      ? "You should set the 'Base URL' configration property. "
      : "",
    `Create a new application at the <a href="">Twitter developer portal</a>. 
you should obtain the API key and secret, enable 3-legged OAuth, 
and set the callback URL to ${base_url}auth/callback/twitter.`,
  ];
  return new Workflow({
    steps: [
      {
        name: "API keys",
        form: () =>
          new Form({
            labelCols: 3,
            blurb,
            fields: [
              {
                name: "twitterKey",
                label: "Twitter API Key",
                type: "String",
                required: true,
              },
              {
                name: "twitterSecret",
                label: "Twitter API Secret",
                type: "String",
                required: true,
              },
            ],
          }),
      },
    ],
  });
};
module.exports = {
  sc_plugin_api_version: 1,
  authentication,
  configuration_workflow,
};
