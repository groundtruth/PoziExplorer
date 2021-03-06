# PoziExplorer

An app based on the [OpenGeo Suite SDK](http://opengeo.org/technology/sdk/).

[![Build Status](https://travis-ci.org/groundtruth/PoziExplorer.png?branch=master)](https://travis-ci.org/groundtruth/PoziExplorer)
[![Code Climate](https://codeclimate.com/github/groundtruth/PoziExplorer.png)](https://codeclimate.com/github/groundtruth/PoziExplorer)


## Getting it running

Get the code:

    git clone https://github.com/groundtruth/PoziExplorer.git && cd PoziExplorer
    git submodule init
    git submodule update

To run in debug mode (for Groundtruth internal use):

    ./suite-sdk debug -l 9090 -g http://general.pozi.com/geoserver .
    open http://localhost:9090/?config=cardinia   # for example
    open http://cardinia.pozi.dev:9090/           # for example (only if you've set the right alias for localhost)

To deploy (for Groundtruth use):

    ./suite-sdk deploy -d general.pozi.com -r 8080 -u manager -p password -c tomcat6x .
    open http://corangamite.pozi.com           # for example
    open http://corangamite.pozi.com/rev.txt   # for revision details of live code

## About the SDK dependency

Don't install the OpenGeo SDK on your system. It is bundled into PoziExplorer
as a git submodule.

Be sure to run all `suite-sdk` commands using the project-specific version of
the script (`./suite-sdk`). This will use the bundled version of the SDK
(under `opengeo-suite-sdk/`) and the project specific `build.xml` file.

## Windows notes

* install OpenGeo Suite
* copy SDK folder to C:\Tools *(note: may be possible to skip this step and set the environment variable and symlink (below) directly to the installed OpenGeo Suite)*
* install ANT
* install Java JDK
* add environment variables in Path for:
  * `C:\Tools\opengeo-suite-sdk\bin`
  * `%ANT_HOME%\bin`
  * `%JAVA_HOME%\bin`
* replace `C:\Tools\opengeo-suite-sdk\build.xml` with symlink to `C:\Users\Simon\GitHub\PoziExplorer\build.xml`

## Other runtime dependencies

This project expects to be able to use certain webservices.

Please refer to `lib/custom/json/` and the config loading code (where defaults
are defined) for more details.


## Run the tests

We have integration tests defined using [Mocha](http://visionmedia.github.io/mocha/),
[Chai](http://chaijs.com/) and [WD.js](https://github.com/admc/wd). They are run
on each commit by [TravisCI](https://travis-ci.org/groundtruth/PoziExplorer).

Before running the tests locally, you'll need to install:

* [PhantomJS](http://phantomjs.org/download.html)
* [Node.js](http://nodejs.org/download/)
* this project's node modules: `npm install`
* other helpful modules: `npm install -g mocha`, `npm install -g node-inspector`
* the `pkill` utility (Linux: has it, Mac: `brew install proctools`, Cygwin: install `procps`)
* the `nc` utility (Linux: has it, Mac: `brew install netcat`, Cygwin: install `netcat`)

Now you're ready to run the tests:

    # test a local PoziExplorer via PhantomJS (does setup and shutdown):
    ./test/bin/run_local.sh

    # same, but without starting and stopping PoziExplorer and PhantomJS every time
    source ./test/bin/start_for_local.sh  # this starts services and sets env vars
    mocha                                 # actually runs tests... repeat as desired
    mocha
    mocha
    source ./test/bin/stop.sh             # stops services and unsets env vars

    # debug tests interactively
    source ./test/bin/start_for_local.sh
    node-inspector &
    open http://127.0.0.1:8080/debug?port=5858
    mocha --debug-brk
    source ./test/bin/stop.sh
    pkill -f 'node-inspector'

    # run the tests against a live server instead of a local copy of PoziExplorer
    source ./test/bin/start_for_live.sh   # this starts PhantomJS and sets env vars to target the live server
    mocha
    source ./test/bin/stop.sh


