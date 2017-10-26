# Deadbeef Control
Remote Control web-app for the [DeaDBeeF Audio Player](https://github.com/DeaDBeeF-Player/deadbeef)

## Features
Basic playback controls via sleek and modern "material" WEB interface:

* Play/pause
* Next/Prev
* Shuffle
* Song/Artist/Album Info, etc.

## Requirements
* python 2.7
* flask >= 0.12
Optional:
* pip
* python-virtualenv

## Installation
Download and unpack sources from this repository.
This app requires Flask, a python microframework which provides backend logic and serves static content.

### Flask installation
You may follow the [official Flask documentation](http://flask.pocoo.org/docs/0.12/installation/) or these simple steps:
For example, let's assume deadbeef-control archive was downloaded and unpacked into /opt/deadbeef-control
* `$ pip install virtualenv ` or `apt-get install python-virtualenv` or `yum install python-virtualenv`- this step depends on your current distro and preferences.
* `$ cd /opt/deadbeef-control`
* `$ virtualenv flask`
* `$ . flask/bin/activate` - mind the space after dot!
* `$ pip install flask`
* `$ deactivate `

Now you may start the app:
* `$ ./run.py`
You should see the output like:
```bash
 Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)
```
*  Point your browser to [http://127.0.0.1:5000](http://127.0.0.1:5000) or to whatever you host IP is.

#### Other Installation Variants
In this example flask framework is installed into python virtualenv, this is optional as you may have flask installed by different means. You may (and you should) serve static content by other means, see [this](http://flask.pocoo.org/docs/0.12/deploying/#deployment)
For other choices please follow official documentation.
In any way don't forget to change shebang string accordingly in *run.py*

## Warning
Please do not expose this app's socket onto the outside networks!
Flask internal web-server is not intended for production use, see [this](http://flask.pocoo.org/docs/dev/deploying/) for proper deployment options.
For home use only. 
You have been warned >:)

## Bugs
* Available controls and behaviour is limited to commands provided by DeaDBeeF command line (see `deadbeef --help`), 
therefore this app lacks playlist management and many other advanced features of GTK application.
* Please report bugs to the Issues section in this repo.

## Contributions
This app made it into the world `thanks to these` wonderful open-source projects:
* [Python](https://www.python.org/)
* [Flask - microframework](http://flask.pocoo.org/)
* [jQuery](https://jquery.com/)
* [Materialize - responsive front-end framework](http://materializecss.com/)
* [Yarn - dependency management](https://yarnpkg.com/lang/en/)
* [DeaDBeeF](https://github.com/ameiji/deadbeef-control)


# License
Copyright (c) <2017> Dmitry Sarkisov <ait.meijin@gmail.com>, MIT License
See LICENSE file
