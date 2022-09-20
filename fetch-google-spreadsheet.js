const { GoogleSpreadsheet } = require("google-spreadsheet");
const secret = require("./cuttinboard-translations-SA.json");

const fs = require("fs");

//# Initialize the sheet
const doc = new GoogleSpreadsheet(
  "1u6s3R5bHU1WbztuNfSc4jx_51RDYtfdD1qzyys8MqWs"
); //# spreadsheet ID

//# Initialize Auth
const init = async () => {
  await doc.useServiceAccountAuth({
    client_email: secret.client_email,
    private_key: secret.private_key,
  });
};

const read = async () => {
  await doc.loadInfo(); //# loads document properties and worksheets
  const sheet = doc.sheetsByTitle["1"]; //# get the sheet by title, I left the default title name. If you changed it, then you should use the name of your sheet
  await sheet.loadHeaderRow(); //# loads the header row (first row) of the sheet
  const colTitles = sheet.headerValues; //# array of strings from cell values in the first row
  const rows = await sheet.getRows({ limit: sheet.rowCount }); //# fetch rows from the sheet (limited to row count)
  let result = {};
  //# map rows values and create an object with keys as columns titles starting from the second column (languages names) and values as an object with key value pairs, where the key is a key of translation, and value is a translation in a respective language
  // eslint-disable-next-line array-callback-return
  rows.map((row) => {
    colTitles.slice(1).forEach((title) => {
      result[title] = result[title] || [];
      const key = row[colTitles[0]];
      result = {
        ...result,
        [title]: {
          ...result[title],
          [key]: row[title] !== "" ? row[title] : undefined,
        },
      };
    });
  });
  return result;
};

const write = (data) => {
  Object.keys(data).forEach((key) => {
    const tempObject = data[key];
    fs.writeFile(
      `./public/locales/${key}/translation.json`,
      JSON.stringify(tempObject, null, 2),
      (err) => {
        if (err) {
          console.error(err);
        }
      }
    );
  });
};

init()
  .then(() => read())
  .then((data) => write(data))
  .catch((err) => console.log("ERROR!!!!", err));
