# Setup

1. clone this repo
2. npm install
3. create server/awsconfig.js
```javascript
module.exports = 

{
    secretAccessKey: "enter aws credentials here",
    accessKeyId: "enter aws credentials here",
    region: "enter aws credentials here",
    cloudFront: "enter aws credentials here"
  }
```
4. create secrets.json in root folder
```javascript
{
    "NODE_ENV": "production",
    "DOMAIN": "your custom domain"
  }
```
# Development Environment

### `npm run dev`

Runs the app in the development mode.
Open [http://localhost:8080](http://localhost:8080) to view it in the browser.

# Production Environment - deploys to aws lambda

1. Register domain & use aws route 53 nameservers
2. Get approved certificate from certificate manager.
### `sls create_domain`
### `npm run deploy`
