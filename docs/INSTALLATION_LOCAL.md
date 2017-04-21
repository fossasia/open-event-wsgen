# How to install the Open Event Web App Generator on my local machine

## Deploying Locally

First install the dependencies.

```shell
npm install or npm install bcrypt
```
if getting error than, fix npm permissions globally.and start from step 1.
refer this:"https://docs.npmjs.com/getting-started/fixing-npm-permissions"

sometimes it may give an error of fetch failed
then type

```shell
npm config set registry http://registry.npmjs.org/
```

and then restart the terminal and start from step 1

Run the app

```shell
npm run start
```

or
```shell
npm run server.generator
````

if getting any binding error while doing npm run start do the following:

```shell
npm -rf rm node_modules
```
```shell
npm cache clean
```
This command runs the npm rebuild command on the matched folders.This is useful when you install a new version of
node, and must recompile all your C++ addons with the new binary.

```shell
npm rebuild
```
 after running above commands again do npm run start.

The app will be running on http://localhost:5000

Note : If you are running the app behind a proxy, set the proxy option in config.json to `http://username:password@proxy_url:proxy_port`, and make sure it is url encoded.

## Requirements

| Component  | Name/Flavour | Minimum Version |
|---|---|---|
|  OS | Mac/Windows/Linux | Any |
| Node.js |  | v4.0 (or above) |
| Browser | Firefox/Chrome/Safari | 21+/11+/9+

Note: Computers running on Windows OS may encounter problems when installing the Webapp Generator on local machines. As Windows does not come bundled with a C++ compiler, which is needed in NodeJS, the command prompt may throw up a error which states that `node-gyp rebuild` fails on yor system. Hence it is advised a further prerequisite (for Windows users) is to download Visual Studio Community 2015 which contains a C++ compiler (link is https://www.visualstudio.com/downloads/)
