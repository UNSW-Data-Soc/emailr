// replace all {{name}} with csv data
const fillEmailWithCsvData = (emailHTML, csvData) => {
  const emailHTMLWithCsvData = emailHTML.replace(/{{(.*?)}}/g, (match, p1) => {
    return csvData[p1] || match;
  });
  return emailHTMLWithCsvData;
};

// nodemailer
const nodemailer = require("nodemailer");

// convert html to text
const { convert: htmlToText } = require("html-to-text");
const options = {
  wordwrap: 130,
  // ...
};

// express server
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8000;

// * MIDDLEWARE
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});

app.post("/email", (req, res) => {
  console.log(req.body);
  const { fromName, subject, fromEmail, html, csvData, emailCol, fromPassword } = req.body;
  const csv = csvData;

  const transportOptions = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: fromEmail,
      pass: fromPassword,
    },
  };
  const transporter = nodemailer.createTransport(transportOptions);

  csv.forEach((row) => {
    const emailHTML = fillEmailWithCsvData(html, row);

    void transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`, // sender address
      to: row[emailCol], // list of receivers
      subject: subject, // Subject line
      text: htmlToText(emailHTML, options), // plain text body
      html: emailHTML, // html body
    });
  });

  res.status(200).json({ message: "sent" });
});

app.listen(PORT, (error) => {
  if (error) {
    console.log(error);
  }
  console.log(`Server is running on port ${PORT}`);
});
