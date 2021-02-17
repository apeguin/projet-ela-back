const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'loupargent.pwd@gmail.com',
        pass: 'mimolette51'
    }
});

module.exports = {

    mailContact: async function (request, response) {
        try {
            const { firstname, lastname, email, object, message } = request.body;

            // console.log(request.body);
            const mailOptions = {
                from: `loupargent.pwd@gmail.com`,
                to: `editionsloupargent@gmail.com`,
                subject: `Contact Loup d'argent - Message de ${firstname} ${lastname} - "${object}"`,
                html: `
                <!DOCTYPE html>
                <html lang="fr">

                <head>
                    <meta charset="UTF-8">

                    <head>
                        <title>Loup d'argent - Email de contact</title>
                        <meta name="viewport" content="width = 375, initial-scale = -1">
                    </head>
                    <link
                        href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
                        rel="stylesheet">
                </head>

                <body style="background-color: #ffffff;  font-size: 16px; font-family: 'Lato', sans-serif;">
                    <center>
                        <table align="center" border="0" cellpadding="0" cellspacing="0" style="height:100%; width:600px;">
                            <!-- BEGIN EMAIL -->
                            <tr>
                                <td align="center"
                                    style="padding:30px; background-image: url('https://nsa40.casimages.com/img/2020/10/06/201006110615163650.png'); background-repeat: no-repeat; background-position: center; background-size: 50%">
                                    <p style="text-align:left">Bonjour chère éditrice,<br><br> Vous avez reçu un mail depuis votre
                                        magnifique site, en voici le contenu :
                                    </p>
                                    <p>
                                        <span
                                            style="text-decoration:none; text-align: left; border: #8229C6 1px solid; padding:10px 10px; display:block;">

                                            <strong>Nom du contact :</strong> ${firstname} ${lastname} <br><br>
                                            <strong>Objet :</strong> ${object}<br><br>
                                            <strong>Contenu du message :</strong> ${message.split('\n').join('<br>')}

                                        </span>
                                    </p>
                                    <p>
                                        <a style="text-decoration:none; background-color: #8229C6; border: #8229C6 1px solid; color: #fff; padding:10px 10px; display:block;"
                                            href="mailto:${email}?&subject=Réponse à votre message : ${object}">

                                            <strong>Répondre à ce message</strong></a>
                                    </p>
                                    <p style="text-align:left">
                                        Sincèrement,
                                        <br>Votre assistant digital</a>
                                    </p>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </center>
                </body>

                </html>
              `
            };
            const emailer = await transporter.sendMail(mailOptions);
            const postal = {
                message: `Email envoyé à ${emailer.envelope.to}`,
                response: emailer.response
            };
            response.status(200).json(postal);

        } catch (error) {
            return response.status(404).json(error);
        }
    }
}
