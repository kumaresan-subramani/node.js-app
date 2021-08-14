module.exports = function (options, callback) {

    var nodemailer = require('nodemailer');
    //Sendmail
    var transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        timeout: 50000,
        auth: {
            user: 'webtesting@syncfusion.com',
            pass: 'WDT_Testing'
        },
        tls: {
            ciphers: 'SSLv3'
        }
    });
    var mailOptions = {
        from: 'sales@klartdigi.com',
        to: options.cusMail,
        subject: options.regarding,
        text: options.content
    };
    transporter.sendMail(mailOptions, callback);
}