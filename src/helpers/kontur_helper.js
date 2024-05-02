const path = require("path");
const dotenv = require("dotenv").config({
  path: path.resolve(__dirname, "./env/.env"),
});
const axios = require("axios").default;
const logger = require("../log/logger");

const API_KEY = process.env.KONTUR_API_KEY;

const fetchOrgName = async (ITN) => {
  try {
    const apiUrl = `https://focus-api.kontur.ru/api3/req?inn=${ITN}&key=${API_KEY}`;
    const response = await axios.get(apiUrl);
    const reply = response.data[0];
    const orgNameObject = reply.UL.legalName;
    const orgName = orgNameObject.full;
    logger.info(`Organisation name for ITN ${ITN}: ${orgName}`, orgNameObject);
    return orgName;
  } catch (error) {
    logger.error("Error checking organisation name", {
      data: error.response.data,
    });
    return null;
  }
};

module.exports = { fetchOrgName };
