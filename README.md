# gulp-starter
Gulp Starter - Gulp + webpack + babel + sass + browserSync

#### External Dependencies to use gulp-image package
- brew install libjpeg libpng on macOS
- apt-get install -y libjpeg libpng on Ubuntu

#### Npm
Launch npm package manager to install all requirements
```sh 
npm install
```
#### Config file
Take a look to **config.json** for assets/plugins/packages settings
#### Gulp
Compile js using webpack (babel support is integrated)
```sh 
gulp js
```
Compile css using sass 
```sh 
gulp css
```
Compress Images
```sh 
gulp images
```
Launch serve task to start development using browserSync
```sh 
gulp serve
```
