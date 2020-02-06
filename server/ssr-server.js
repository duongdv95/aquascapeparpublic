const express          = require("express")
const dev              = process.env.NODE_ENV !== 'production'
const next             = require("next")
const app              = next({ dev })
const handle           = app.getRequestHandler()
const bodyParser       = require("body-parser");
const dynamodb         = require("./dynamodb")
const {checkSchema, validationResult}    = require("express-validator/check")
const {fixtureSchema}  = require("./validateschema.js")
const { upload, deleteImages }          = require("./services/file-upload")
const multiUpload      = upload.array("image", 20)
const aws              = require("aws-sdk")
const awsconfig        = require("./awsconfig")
const cognitoconfig        = require("./cognitoconfig")
const jwt              = require("jsonwebtoken")
const jwkToPem         = require('jwk-to-pem');
const path             = require("path")
const { createSitemap } = require("sitemap")
var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({region: cognitoconfig.region});
const server = express()

if(!dev) {
    server.use('/_next', express.static(path.join(__dirname, '.next')))
}

if(dev) {
    app.prepare()
        .then(() => {
            server.use(bodyParser.json())
            server.use((err, req, res, next) => {
                if(err.status === 400)
                  return res.status(err.status).json({success: false, message: "Invalid request"});
                return next(err);
            })
    
            //USER ROUTES
            server.get("/search", (req, res) => {
                const page = "/search"
                const queryParams = req.query
                app.render(req, res, page, queryParams)
            })
            
            server.get("/fixtures/:id/*", (req, res) => {
                const page = "/fixtures"
                return app.render(req, res, page, { id: req.params.id})
            })
    
            server.get("/aquarium-substrate-calculator", (req, res) => {
                const page = "/substratecalculator"
                return app.render( req, res, page)
            })
            // USER API ROUTES
            server.get("/api/getFixtures", async (req, res) => {
                const {id, query} = req.query
                const response = await dynamodb.getFixture({url_id: id, query})
                res.status(200).json(response)
            })
    
            //ADMIN ROUTES
            server.get("/admin/createfixture", (req, res) => {
                const page = "/createfixture"
                return app.render(req, res, page)
            })
            
            server.get("/admin/editFixture/:id", (req, res) => {
                const page = "/editfixture"
                return app.render(req, res, page, { id: req.params.id })            
            })
    
            server.get("/admin/imageupload/:id", (req, res) => {
                const page = "/imageupload"
                return app.render(req, res, page, { id: req.params.id})
            })
    
            server.get("/api/checktoken", checkToken, (req, res) => {
                res.status(200).json({ success: true, message: "Authorized" })
            })
    
            // ADMIN API ROUTES
            server.post("/api/login", async function (req, res) {
                let { username, password } = req.body
                let headersObject = req.headers
                let HttpHeaders = []
                for (var headerName in headersObject) {
                    HttpHeaders.push({ headerName: headersObject[headerName] })
                }
                var params = {
                    AuthFlow: cognitoconfig.AuthFlow, /* required */
                    ClientId: cognitoconfig.ClientId, /* required */
                    UserPoolId: cognitoconfig.UserPoolId, /* required */
                    AuthParameters: {
                        'USERNAME': username,
                        'PASSWORD': password
                    }
                };
                await cognitoidentityserviceprovider.adminInitiateAuth(params, function (err, data) {
                    if (err) {
                        res.status(400).json({ success: false, message: err.message })
                    } else {
                        let { AccessToken, RefreshToken, IdToken } = data.AuthenticationResult
                        res.status(200).json({ token: IdToken })
                    }
                });
            })
    
            server.put("/api/editfixture", checkToken, async function (req, res) {
                const { make, model, specifications, PAR, product_links, notes, url_id } = req.body
                const fixtureData = generateFixtureObj({
                    make, model, specifications, PAR, product_links, notes
                })
                const response = await dynamodb.editFixture({ fixtureData, url_id })
                if (response.success) {
                    res.status(200).json(response)
                } else {
                    res.status(400).json(response)
                }
            })
    
            server.put("/api/deletefixture", checkToken, async function (req, res) {
                const { url_id } = req.body
                console.log(url_id)
                const response = await dynamodb.deleteFixture({ url_id })
                if (response.success) {
                    res.status(200).json(response)
                } else {
                    res.status(400).json(response)
                }
            })
    
            server.post("/api/image-upload", checkToken, function (req, res) {
                multiUpload(req, res, async function (err) {
                    if (err) {
                        return res.status(422).send({ success: false, errors: [{ title: 'File Upload Error', detail: err.message }] });
                    }
                    const url_id = req.body.url_id
                    const imagesArray = req.files.map((element) => {
                        return element.location
                    })
                    const keyArray = req.files.map((element) => {
                        return element.key
                    })
                    const oldResponse = await dynamodb.getFixture({ url_id })
                    //Old Images Key Removal
                    if(oldResponse.fixturesArray[0].images.length !== 0) {
                        if(oldResponse.fixturesArray[0].images[0] !== 'https://d2s6kvwb83n6p4.cloudfront.net/No_image_available_600_x_450.svg') {
                            const oldImagesArray = oldResponse.fixturesArray[0].images
                            const oldImagesKeyArray = oldImagesArray
                            .filter(function(element) {
                                if(element === null) { 
                                    return false
                                }
                                return true
                            })
                            .map(function(element) {
                                return element.replace("https://d2s6kvwb83n6p4.cloudfront.net/", "")
                            })
                            oldImagesKeyArray.forEach((element) => {
                                deleteImages({key: element})
                            })
                        }
                    }
                    const response = await dynamodb.addImagesToFixture({ url_id, imagesArray })
                    if (!response.success) {
                        keyArray.forEach((element) => {
                            deleteImages({ key: element })
                        })
                    }
                    return res.json(response);
                });
            });
    
            server.post("/api/addFixture", checkToken, checkSchema(fixtureSchema), checkIfValidRequest, async (req, res) => {
                const { make, model, specifications, PAR, product_links, notes } = req.body
                const fixtureData = generateFixtureObj({
                    make, model, specifications, PAR, product_links, notes
                })
                const response = await dynamodb.addFixture({ fixtureData })
                if (response.success) {
                    res.status(200).json(response)
                } else {
                    res.status(400).json(response)
                }
            })
    
            // GOOGLE ROBOTS 
            server.get("/robots.txt", (req, res) => {
                let robotsPath = path.join(__dirname, "../pages/robots.txt")
                res.sendFile(robotsPath)
            })
    
            server.get("/sitemap.xml", async (req, res) => {
                const response = await dynamodb.getFixture({query: "all"})
                if (response && response.success) {
                    try {
                        var urlsArray = [
                            { url: '/', priority: 1},
                            { url: '/blog', priority: 0.8},
                            { url: '/choosing-a-light', priority: 0.8},
                            { url: '/aquarium-substrate-calculator', priority: 0.8},
                            { url: '/choosing-a-light', priority: 0.8},
                            { url: '/testing-method', priority: 0.8},
                            { url: '/contact', priority: 0.8},
                        ]
                        response.fixturesArray.forEach((element) => {
                            urlsArray.push({ url: `/fixtures/${element.url_id}/${element.make}-${element.model.replace(/\s/g, "-")}`, priority: 0.5})
                        })
                        const sitemap = createSitemap({
                            hostname: "https://aquariumpardata.com",
                            cacheTime: 600000,
                            urls: urlsArray
                        })
                        const xml = sitemap.toXML()
                        res.header('Content-Type', 'application/xml');
                        res.send( xml );
                      } catch (e) {
                        console.error(e)
                        res.status(500).end()
                      }
                } else {
                    res.status(500).end()
                }
    
            })
    
            server.get('*', (req, res) => {
                return handle(req, res)
            })
            server.listen(8080, (err) => {
                if (err) throw err
                console.log('> Ready on http://localhost:8080')
            })
        })
        .catch((ex) => {
            console.error(ex.stack)
            process.exit(1)
        })
}

if(!dev) {
    let checkToken = (req, res, next) => {
        let bearerHeader = req.headers['authorization']
        if(bearerHeader !== undefined && (bearerHeader.replace("Bearer",""))) {
            let bearer = bearerHeader.split(" ");
            let token = bearer[1]
            try {
                let decodedToken = validateToken(token)
                if(decodedToken.aud === cognitoconfig.ClientId
                && decodedToken.iss === `https://cognito-idp.us-west-2.amazonaws.com/${cognitoconfig.UserPoolId}`
                && decodedToken.token_use === "id") {
                    next()
                } else {
                    res.status(400).send({"success":false,"message":"Auth token is invalid"})
                }
            } catch(err) {
                res.status(400).send({ "success":false, err: err.message })
            }
        } else {
            res.status(400).json({success: false, message: "Auth token not supplied"})
        }
    }
    server.use(bodyParser.json())
    server.use((err, req, res, next) => {
        if(err.status === 400)
          return res.status(err.status).json({success: false, message: "Invalid request"});
        return next(err);
    })

    //USER ROUTES
    server.get("/search", (req, res) => {
        const page = "/search"
        const queryParams = req.query
        app.render(req, res, page, queryParams)
    })
    
    server.get("/fixtures/:id/*", (req, res) => {
        const page = "/fixtures"
        return app.render(req, res, page, { id: req.params.id})
    })

    server.get("/aquarium-substrate-calculator", (req, res) => {
        const page = "/substratecalculator"
        return app.render( req, res, page)
    })
    // USER API ROUTES
    server.get("/api/getFixtures", async (req, res) => {
        const {id, query} = req.query
        const response = await dynamodb.getFixture({url_id: id, query})
        res.status(200).json(response)
    })

    //ADMIN ROUTES
    server.get("/admin/createfixture", (req, res) => {
        const page = "/createfixture"
        return app.render(req, res, page)
    })
    
    server.get("/admin/editFixture/:id", (req, res) => {
        const page = "/editfixture"
        return app.render(req, res, page, { id: req.params.id })            
    })

    server.get("/admin/imageupload/:id", (req, res) => {
        const page = "/imageupload"
        return app.render(req, res, page, { id: req.params.id})
    })

    server.get("/api/checktoken", checkToken, (req, res) => {
        res.status(200).json({ success: true, message: "Authorized" })
    })

    // ADMIN API ROUTES
    server.post("/api/login", async function (req, res) {
        let { username, password } = req.body
        let headersObject = req.headers
        let HttpHeaders = []
        for (var headerName in headersObject) {
            HttpHeaders.push({ headerName: headersObject[headerName] })
        }
        var params = {
            AuthFlow: cognitoconfig.AuthFlow, /* required */
            ClientId: cognitoconfig.ClientId, /* required */
            UserPoolId: cognitoconfig.UserPoolId, /* required */
            AuthParameters: {
                'USERNAME': username,
                'PASSWORD': password
            }
        };
        await cognitoidentityserviceprovider.adminInitiateAuth(params, function (err, data) {
            if (err) {
                res.status(400).json({ success: false, message: err.message })
            } else {
                let { AccessToken, RefreshToken, IdToken } = data.AuthenticationResult
                res.status(200).json({ token: IdToken })
            }
        });
    })

    server.put("/api/editfixture", checkToken, async function (req, res) {
        const { make, model, specifications, PAR, product_links, notes, url_id } = req.body
        const fixtureData = generateFixtureObj({
            make, model, specifications, PAR, product_links, notes
        })
        const response = await dynamodb.editFixture({ fixtureData, url_id })
        if (response.success) {
            res.status(200).json(response)
        } else {
            res.status(400).json(response)
        }
    })

    server.put("/api/deletefixture", checkToken, async function (req, res) {
        const { url_id } = req.body
        console.log(url_id)
        const response = await dynamodb.deleteFixture({ url_id })
        if (response.success) {
            res.status(200).json(response)
        } else {
            res.status(400).json(response)
        }
    })

    server.post("/api/image-upload", checkToken, function (req, res) {
        multiUpload(req, res, async function (err) {
            if (err) {
                return res.status(422).send({ success: false, errors: [{ title: 'File Upload Error', detail: err.message }] });
            }
            const url_id = req.body.url_id
            const imagesArray = req.files.map((element) => {
                return element.location
            })
            const keyArray = req.files.map((element) => {
                return element.key
            })
            const oldResponse = await dynamodb.getFixture({ url_id })
            //Old Images Key Removal
            if(oldResponse.fixturesArray[0].images.length !== 0) {
                if(oldResponse.fixturesArray[0].images[0] !== 'https://d2s6kvwb83n6p4.cloudfront.net/No_image_available_600_x_450.svg') {
                    const oldImagesArray = oldResponse.fixturesArray[0].images
                    const oldImagesKeyArray = oldImagesArray
                    .filter(function(element) {
                        if(element === null) { 
                            return false
                        }
                        return true
                    })
                    .map(function(element) {
                        return element.replace("https://d2s6kvwb83n6p4.cloudfront.net/", "")
                    })
                    oldImagesKeyArray.forEach((element) => {
                        deleteImages({key: element})
                    })
                }
            }
            const response = await dynamodb.addImagesToFixture({ url_id, imagesArray })
            if (!response.success) {
                keyArray.forEach((element) => {
                    deleteImages({ key: element })
                })
            }
            return res.json(response);
        });
    });

    server.post("/api/addFixture", checkToken, checkSchema(fixtureSchema), checkIfValidRequest, async (req, res) => {
        const { make, model, specifications, PAR, product_links, notes } = req.body
        const fixtureData = generateFixtureObj({
            make, model, specifications, PAR, product_links, notes
        })
        const response = await dynamodb.addFixture({ fixtureData })
        if (response.success) {
            res.status(200).json(response)
        } else {
            res.status(400).json(response)
        }
    })

    // GOOGLE ROBOTS 
    server.get("/robots.txt", (req, res) => {
        let robotsPath = path.join(__dirname, "../pages/robots.txt")
        res.sendFile(robotsPath)
    })

    server.get("/sitemap.xml", async (req, res) => {
        const response = await dynamodb.getFixture({query: "all"})
        if (response && response.success) {
            try {
                var urlsArray = [
                    { url: '/', priority: 1},
                    { url: '/blog', priority: 0.8},
                    { url: '/choosing-a-light', priority: 0.8},
                    { url: '/aquarium-substrate-calculator', priority: 0.8},
                    { url: '/choosing-a-light', priority: 0.8},
                    { url: '/testing-method', priority: 0.8},
                    { url: '/contact', priority: 0.8},
                ]
                response.fixturesArray.forEach((element) => {
                    urlsArray.push({ url: `/fixtures/${element.url_id}/${element.make}-${element.model.replace(/\s/g, "-")}`, priority: 0.5})
                })
                const sitemap = createSitemap({
                    hostname: "https://aquariumpardata.com",
                    cacheTime: 600000,
                    urls: urlsArray
                })
                const xml = sitemap.toXML()
                res.header('Content-Type', 'application/xml');
                res.send( xml );
              } catch (e) {
                console.error(e)
                res.status(500).end()
              }
        } else {
            res.status(500).end()
        }

    })

    server.get('*', (req, res) => handle(req, res))
    module.exports = server
}


const jsonWebKeys =
    [
        {
            "alg": "RS256",
            "e": "AQAB",
            "kid": "GlIq4PVQahsjf8+j4UIqhNsDsnTRgCmX43crGPWJsvE=",
            "kty": "RSA",
            "n": "6NMVYRYRiMTZEtN5IWhxA32fvDJk01uDsG4yYd2RYV--nbKSLFfYyEWQyrp2koKnySlmfvW0tdaR92G--16xpcN65M2gcnC4fCirqAO-j1JjphRPgMaOy5TzKnhtLyN_QPaHZTvShDyK4VOHd5uew38Kx3JhMoVrMIS-2oC4VfhyK1Hz8PtF43SqWSb-7en9v2Nw0Ex9wL6MmmUeetiXiLHJybWbeVqniAIbI_NV0f4TDDgM2k8rMFy4iln9RDGJlNY-_MWvmH6AZddHcktv0YFtB9KKtR62vKo8Iz78Yxm0ddz80V62A0KEBWaiBfLUG7ANwz32RWiur7VP21h06Q",
            "use": "sig"
        },
        {
            "alg": "RS256",
            "e": "AQAB",
            "kid": "xm68nWYsvytMQDSbCGwQWZzWKzAnqis++eY5XjpOtfk=",
            "kty": "RSA",
            "n": "llcdGREtKKEsMOkpkMUNQlx84U8rceBnIj-8YRo98yjkMpBRfL5ZsHpSOfsq2eXCixhymurSt018_ntSjy_6UxwJejxTxZqA1V2q2AqL4DgMRh03y1NHLCDi3kq7WBC3a7B7T49c2Ux7nssDASjC6Ti2Q51egequDaYwvGDu2CzX_GTSRZGDgM_FwJpJcFMpI1DgMwcoy_or7-4P3Icz7Uwaf7icVi61U8epHsmr1jIG5EnMp9xNsMwrD_laxy4gSavTWZe67bWVqEPfBZKCK5r0L8iuXS60oaEOqD4-ki_y3TpDGsHELZ-LcTDQhbas_fCWLeqM1SU3Qc7cCsc4Mw",
            "use": "sig"
        }
    ]

aws.config.update(awsconfig)

function validateToken(token) {
    const header = decodeTokenHeader(token)  
    const jsonWebKey = getJsonWebKeyWithKID(header.kid)
    let decodedToken
    verifyJsonWebTokenSignature(token, jsonWebKey, function(err, decoded_token) {
        if (err) {
            throw new Error(err)
        } else {
            decodedToken = decoded_token
        }
    })
    return decodedToken
}

function decodeTokenHeader(token) {
    try {
        const headerEncodedArray = token.split(".")
        const headerEncoded = headerEncodedArray[0]
        const buff = new Buffer(headerEncoded, 'base64')
        const text = buff.toString('ascii')
        return JSON.parse(text)
    } catch (err) {
        console.log(err)
        throw new Error("Invalid JWT")
    }
}

function getJsonWebKeyWithKID(kid) {
    for (let jwk of jsonWebKeys) {
        if (jwk.kid == kid) {
            return jwk
        }
    }
    return null
}

function verifyJsonWebTokenSignature(token, jsonWebKey, clbk) {
    const pem = jwkToPem(jsonWebKey)
    jwt.verify(token, pem, { algorithms: ['RS256'], maxAge: `${1000*60*60}` }, function(err, decodedToken) {
        return clbk(err, decodedToken)
    })
}

let checkToken = (req, res, next) => {
    let bearerHeader = req.headers['authorization']
    if(bearerHeader !== undefined && (bearerHeader.replace("Bearer",""))) {
        let bearer = bearerHeader.split(" ");
        let token = bearer[1]
        try {
            let decodedToken = validateToken(token)
            if(decodedToken.aud === cognitoconfig.ClientId
            && decodedToken.iss === `https://cognito-idp.us-west-2.amazonaws.com/${cognitoconfig.UserPoolId}`
            && decodedToken.token_use === "id") {
                next()
            } else {
                res.status(400).send({"success":false,"message":"Auth token is invalid"})
            }
        } catch(err) {
            res.status(400).send({ "success":false, err: err.message })
        }
    } else {
        res.status(400).json({success: false, message: "Auth token not supplied"})
    }
}

// ADMIN ROUTES



function checkIfValidRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    } else {
        next()
    }
}

var generateFixtureObj = function FixtureData({make, model, specifications, PAR, product_links, notes}) {
    return {
        make,
        model,
        specifications,
        PAR, 
        product_links, 
        notes
    }
}

