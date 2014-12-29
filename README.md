# Deutsche Bank Policy Portal

Currently most everything is taking place in [`src/index.html`](https://github.com/naterkane/deutsche-policy-portal/blob/develop/src/index.html) however, things will chance once each view is widget-ized.

### To get started

    $ git clone git@github.com:naterkane/deutsche-policy-portal.git deutsche && cd deutsche
    $ npm install

**for testing uncompiled** 

    $ grunt connect:test

**for testing distribution copy** _( which still needs attention )_

    $ grunt build
    $ grunt server:dist

and that should about do it for now. 

more utility commands can be found in the [`Gruntfile`](https://github.com/naterkane/deutsche-policy-portal/blob/develop/Gruntfile.js)