# Testing DBus Service

This a testing DBus service providing the backend for the transactional
updates Cockpit module.

## Installing

For connecting to the system bus you need to allow the access via
special configuration files. To install them run:

```
sudo make install
```

Then simply start the service (as `root`):

```
./tu-server.rb
```

You can connect to the session bus instead, that does not require any
configuration (but still needs running as `root` to refresh the repositories):

```
./tu-server.rb --session-bus
```

## Testing Data

The [data/patches.xml](data/patches.xml) file contains an example with available
patches. (With many applicable patches from an SLE15-SP1 system.)

You can use it with the `--patch` option:

```
./tu-update.rb --patch data/patches.xml
```

To get testing data from your system just this command:

```
LC_ALL=C zypper --xmlout list-patches | sed 's/\(source url=".*\)?[^"]*/\1/' > patches.xml
```

*(Note: The 'sed' filtering removes the "secret" tokens from the SCC repository URLs.)*

## TODO

- Patch installation
- Check pending snapshots
- List old snapshots
- Rollback

## DBus API Description

*TBD*
