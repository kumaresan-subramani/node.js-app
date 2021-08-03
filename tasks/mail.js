module.exports = function (repo, branch, version, callback, type, platform) {

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
    var message = {
        "Releasenotes": `${repo} - ${type} Build started form ${branch} at version ${version}`,
        "Docs": `${platform} - ${type} Documentation Build started form ${branch}`,
        "Api": `${platform} - ${type} API Build started form ${branch}`,
        "Patch": `${repo} - ${type} Build started form ${branch} at version ${version}`,
        "Es-build": `Es-build started form ${branch} at version ${version}`
    }
    var mailOptions = {
        from: 'webtesting@syncfusion.com',
        to: 'kumaresan.subramani@syncfusion.com',
        subject: 'mother fucker',
        text: 'Dont mes with me you asshole'
    };
    transporter.sendMail(mailOptions, callback);
}