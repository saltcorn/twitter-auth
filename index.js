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
    callbackURL: `${cfg_base_url}auth/callback/twitter`,
  };
  return {
    twitter: {
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

const configuration_workflow = () =>
  new Workflow({
    steps: [
      {
        name: "API keys",
        form: () =>
          new Form({
            labelCols: 3,
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

module.exports = {
  sc_plugin_api_version: 1,
  authentication,
  configuration_workflow,
};
