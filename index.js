const { gzip } = require('zlib');

if (process.env.NODE_ENV === 'production') {
    require('dotenv').config();

    let https = require('https');
    let http = require('http');
    let fs = require('fs');
    let path = require('path');

    const privateKey = fs.readFileSync('/etc/letsencrypt/live/loupargent-oclock.fr/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/loupargent-oclock.fr/cert.pem', 'utf8');
    const ca = fs.readFileSync('/etc/letsencrypt/live/loupargent-oclock.fr/chain.pem', 'utf8');

    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };

    const express = require('express');
    const app = express();
    const helmet = require('helmet');
    const session = require('express-session');

    const compression = require('compression');

    const cors = require('cors');

    app.use(express.json());
    app.use(compression());
    
    app.use(express.static('public'));
    app.use(cors(
        {
            origin: "http://localhost:3000",
            credentials: true
        }
    ));

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

    app.use(express.urlencoded({
        extended: false
    }));
   
    const publicRouter = require('./app/routers/publicRouter');
    const adminRouter = require('./app/routers/adminRouter');
    const authRouter = require('./app/routers/authRouter');
    const recoveryRouter = require('./app/routers/recoveryRouter');
    const security = require('./app/middlewares/authCheck');

    app.use('/api', publicRouter);
    app.use('/api/recovery', recoveryRouter);
    app.use('/api/admin', security.checkAdmin, adminRouter);
    app.use('/api/auth', authRouter);
   
    app.use(function (_, response, _) {
        response.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    const PORT_http = 8080;
    const PORT_https = 8443;

    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(PORT_https, () => {
        console.log('HTTPS Server running on port 443');
    });
} else {
    require('dotenv').config();
    const express = require('express');
    const app = express();
    const expressSwagger = require('express-swagger-generator')(app);
    const cors = require('cors');

    const compression = require('compression');

    const path = require('path');

    app.use(express.json());
    app.use(compression());
    app.use(express.static('public'));
    app.use(express.urlencoded({
        extended: false
    }));
    app.use(cors('*'));

    const authRouter = require('./app/routers/authRouter');
    const publicRouter = require('./app/routers/publicRouter');
    const adminRouter = require('./app/routers/adminRouter');
    const recoveryRouter = require('./app/routers/recoveryRouter');
    const security = require('./app/middlewares/authCheck');

    let options = {
        swaggerDefinition: {
            info: {
                description: 'Les différentes routes qui composent le site',
                title: 'Edition Loup d\'Argent Swagger',
                version: '1.0.0',
            },
            host: 'localhost:3000',
            basePath: '/api',
            produces: [
                "application/json",
                "application/xml"
            ],
            schemes: ['http'],
            securityDefinitions: {
                JWT: {
                    type: ' SECRET_KEY',
                    in: 'header',
                    name: 'Authorization',
                    description: "",
                }
            }
        },
        basedir: __dirname, //app absolute path
        files: ['./app/routers/publicRouter.js', './app/routers/adminRouter.js', './app/routers/authRouter.js'] //Path to the API handle folder
    };
    expressSwagger(options);

    app.use(function (request, response, next) {
        response.header('Access-Control-Allow-Credentials', true);
        response.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        );
        next();
    });

    app.use('/api', publicRouter);
    app.use('/api/recovery', recoveryRouter);
    app.use('/api/admin', security.checkAdmin, adminRouter);
    app.use('/api/auth', authRouter);

    app.use(function (_, response, _) {
        response.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, _ => {
        console.log(`Running on http://localhost:${PORT}`);
    });
};
