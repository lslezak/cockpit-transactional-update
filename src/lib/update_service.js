/*
 * Copyright (c) [2020] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of version 2 of the GNU General Public License as published
 * by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, contact SUSE LLC.
 *
 * To contact SUSE LLC about this file by physical or electronic mail, you may
 * find current contact information at www.suse.com.
 */

import cockpit from 'cockpit';

// wrapper for a transaction object inside the org.opensuse.TransactionalUpdate
// DBus service
// see https://cockpit-project.org/guide/latest/cockpit-dbus.html
class UpdateTransaction {
    constructor(dbusService, objectPath) {
        this.service = dbusService;
        this.proxy = dbusService.proxyFor(objectPath);
    }

    // call a DBus method of this DBus object
    call(method) {
        console.log("Calling method", method);
        this.proxy.call(method);
    }

    // watch a signal emitted by the DBus object,
    // the callback receives the DBus data as the argument
    watchSignal(name, callback) {
        console.log("Watching signal", name);
        const signal = {
            interface: "org.opensuse.TransactionalUpdate",
            path: this.proxy.path,
            member: name
        };

        this.service.dbusService.subscribe(
            signal,
            function(_path, _iface, _signal, args) { callback(args) }
        );
    }
}

// wrapper for the org.opensuse.TransactionalUpdate DBus service
export class UpdateService {
    constructor() {
        // the DBus service
        this.dbusService = cockpit.dbus("org.opensuse.TransactionalUpdate");
        // proxy for the root object
        this.dbusProxy = this.proxyFor("/org/opensuse/TransactionalUpdate");
    }

    // create a transaction object at the DBus service
    async transaction() {
        const transaction = (await this.dbusProxy.call("CreateTransaction"))[0];
        console.log("Created transaction: ", transaction);
        return new UpdateTransaction(this, transaction);
    }

    // create a DBus proxy for a DBus object
    proxyFor(path) {
        return this.dbusService.proxy("org.opensuse.TransactionalUpdate", path);
    }
}
