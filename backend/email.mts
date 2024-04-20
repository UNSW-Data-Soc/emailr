// replace all {{name}} with csv data
const fillEmailWithCsvData = (emailHTML, csvData) => {
  const emailHTMLWithCsvData = emailHTML.replace(/{{(.*?)}}/g, (match, p1) => {
    return csvData[p1] || match;
  });
  return emailHTMLWithCsvData;
};

// nodemailer
import nodemailer from "nodemailer";

// convert html to text
import { convert as htmlToText } from "html-to-text";
const options = {
  wordwrap: 130,
  // ...
};

export default async (req: Request) => {
  const json = await req.json();
  const { fromName, subject, fromEmail, html, csvData, emailCol, fromPassword } = json;
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
    if (row[emailCol].trim().length === 0) return;
    const emailHTML = fillEmailWithCsvData(html, row);

    void transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`, // sender address
      to: row[emailCol], // list of receivers
      subject: subject, // Subject line
      text: htmlToText(emailHTML, options), // plain text body
      html: emailHTML, // html body
    });
  });

  return Response.json({ message: "Emails sent" });
};
