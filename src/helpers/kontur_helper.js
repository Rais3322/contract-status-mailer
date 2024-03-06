const path = require("path");
const dotenv = require("dotenv").config({
  path: path.resolve(__dirname, "./env/.env"),
});
const axios = require("axios").default;
const logger = require("../log/logger");

const API_KEY = process.env.KONTUR_API_KEY;

const fetchOrgName = (ITN) => {
  const apiUrl = `https://focus-api.kontur.ru/api3/req?inn=${ITN}&key=${API_KEY}`;
  let orgName;
  axios
    .get(apiUrl)
    .then((response) => {
      const reply = response.data[0];
      const orgNameObject = reply.UL.legalName;
      orgName = orgNameObject.full;
      logger.info(
        `Organisation name for ITN ${ITN}: ${orgName}`,
        orgNameObject
      );
    })
    .catch((error) => {
      logger.error("Error checking organisation name", {
        data: error.response.data,
      });
    });

  return orgName;
};

module.exports = { fetchOrgName };
