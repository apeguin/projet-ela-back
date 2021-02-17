const express = require('express');
const app = express();

let https = require('https');
let http = require('http');
let fs = require('fs');

const cors = require('cors');

const compression = require('compression');

let path = require('path');

const publicRouter = require('./app/routers/publicRouter');
const adminRouter = require('./app/routers/adminRouter');
const authRouter = require('./app/routers/authRouter');
const recoveryRouter = require('./app/routers/recoveryRouter');
const security = require('./app/middlewares/authCheck');

app.use(express.json());
app.use(compression());

app.use(express.static('public'));

app.use(express.urlencoded({
    extended: false
}));

app.use(cors(
    {
        origin: "http://localhost:3000",
        credentials: true
    }
));

app.use('/api', publicRouter);
app.use('/api/recovery', recoveryRouter);
app.use('/api/admin', security.checkAdmin, adminRouter);
app.use('/api/auth', authRouter);

app.use(function (_, response, _) {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});



if (process.env.NODE_ENV === 'production') {

    const privateKey = fs.readFileSync('/etc/letsencrypt/live/loupargent-oclock.fr/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/loupargent-oclock.fr/cert.pem', 'utf8');
    const ca = fs.readFileSync('/etc/letsencrypt/live/loupargent-oclock.fr/chain.pem', 'utf8');

    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };

    const helmet = require('helmet');
    
    app.use(helmet.xssFilter());
    app.use(helmet.frameguard({ action: 'deny' }));
  
    const sixtyDaysInSeconds = 5184000;
    app.use(helmet.hsts({ maxAge: sixtyDaysInSeconds }));
    app.use(helmet.dnsPrefetchControl());
    app.use(helmet.expectCt());
    app.use(helmet.hidePoweredBy());
    app.use(helmet.ieNoOpen());
    app.use(helmet.noSniff());
    app.use(helmet.permittedCrossDomainPolicies());
    app.use(helmet.referrerPolicy());
    app.use(
        helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'", 'fonts.googleapis.com', 'fonts.gstatic.com'],
                scriptSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'fonts.gstatic.com'],
                objectSrc: ["'none'"],
                "style-src": ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'fonts.gstatic.com'],
                upgradeInsecureRequests: [],
            },
            reportOnly: false,
        })
    );

    app.use(function (request, response, next) {
        response.header('Access-Control-Allow-Credentials', true);
        response.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        );
        next();
    });
   
 
    const PORT_https = 8443;

    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(PORT_https, () => {
        console.log('HTTPS Server running on port 443');
    });
} else {
    require('dotenv').config();

    app.use(function (request, response, next) {
        response.header('Access-Control-Allow-Credentials', true);
        response.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        );
        next();
    });

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, _ => {
        console.log(`Running on http://localhost:${PORT}`);
    });
};
