# Project requirement

- **NodeJS** Version: 12
- **Angular** Version: 8
- **MongoDB** Version: 4.0.2

# Setup Project

- Run npm install both on ./server/ and ./angular/.
- Run npm install -g nodemon on local for development
- Run npm install -g pm2 on live environment
- On ./server/ rename remove.env to .env.
- On ./server/ run command **npm start**.
- On ./angular/ run command **npm start**.
- On startup database will be set up automatically.
- After DB setup import the signs collection in the DB as mentioned in the \server\db\mongoimport
- Configuration files are in angular\src\environments folder. Backend URL is in angular\src\environments\environment.ts for production we can use angular\src\environments\environment.prod.ts
- Backend configurations are in server\.env file (which needs to be gitnored as .env is added as part of the build pipeline)

# Admin Sign Up

- Go to http://localhost:4200/signup
- Enter Email and Password
- Admin will be registered
- Login admin http://localhost:4200/login/admin
# Mongo DB

### Linux:

- Connect to the Mongo shell and Execute Following:

```console
$ mongo
> use admin

> db.createUser(
  {
    user: "<username>",
    pwd: "<password>",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)

> db.grantRolesToUser("<username>", [ { role: "readWrite", db: "atsign" } ])
```

- Enabling Authentication
```console
sudo nano /etc/mongod.conf
```
Add following line:

```console
security:
  authorization: "enabled"
```
Restart mongodb
```console
sudo systemctl restart mongod
```

update username and password in .env file

### Windows:

- Open the Mongo cli and Execute Following:

```console
<mongo installation path>\bin\mongo
> use admin

> db.createUser(
  {
    user: "<username>",
    pwd: "<password>",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)

> db.grantRolesToUser("<username>", [ { role: "readWrite", db: "atsign" } ])
```

Add the following to the mongod.cfg
```console
auth=true
```
Restart mongodb

-- for license information
https://www.npmjs.com/package/npm-license-crawler
npm i npm-license-crawler -g
- npm-license-crawler --production --onlyDirectDependencies --dependencies --csv licenses.csv

