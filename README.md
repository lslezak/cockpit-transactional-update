# Cockpit Transactional Update

A transactional update module for [Cockpit](http://www.cockpit-project.org).

:warning: This is a proof of concept module in development state!
Not ready for production!

The code is based on the [Cockpit Starter Kit](
https://github.com/cockpit-project/starter-kit).

# Getting and building the source

Make sure you have `npm` and `make` available, install them (in openSUSE):

```
sudo zypper install npm make
```

These commands check out the source and build it into the `dist/` directory:

```
git clone https://github.com/lslezak/cockpit-transactional-update.git
cd cockpit-transactional-update
make
```

# The DBus Service

This module requires a special DBus service as a background for executing the
real transactional actions.

So far there is no such a service for that. But there is a testing service
in the `dbus/` subdirectory serving as a PoC example.

## Installation

```
cd dbus
sudo make install
```

This will install the DBus configuration files so the application is allowed
to connect to the system bus.

## Running the service

The DBus can start the service automatically in background, but it is
recommended to start it manually to see the debugging output and use some
testing data.

```
cd dbus
sudo ./tu-server.rb --patch data/patches.xml
```

This wil read the patches from a `zypper` dump instead of really calling
`zyppper`.


# Installing

`make install` compiles and installs the package in `/usr/share/cockpit/`. The
convenience targets `srpm` and `rpm` build the source and binary rpms,
respectively. Both of these make use of the `dist-gzip` target, which is used
to generate the distribution tarball. In `production` mode, source files are
automatically minified and compressed. Set `NODE_ENV=production` if you want to
duplicate this behavior.

For development, you usually want to run your module straight out of the git
tree. To do that, link that to the location were `cockpit-bridge` looks for packages:

```
make devel-install
```

After changing the code and running `make` again, reload the Cockpit page in
your browser.

You can also use
[watch mode](https://webpack.js.org/guides/development/#using-watch-mode) to
automatically update the webpack on every code change with

```
npm run watch
```
or
```
make watch
```

# Running eslint

This module uses [ESLint](https://eslint.org/) to automatically check
JavaScript code style in `.js` and `.jsx` files.

The linter is executed within every build as a webpack preloader.

For developer convenience, the ESLint can be started explicitly by:

```
npm run eslint
```

Violations of some rules can be fixed automatically by:

```
npm run eslint:fix
```

Rules configuration can be found in the `.eslintrc.json` file.
