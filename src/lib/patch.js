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

export class Patch {
    static async patches() {
        // the place for collecting the found patches
        const patches = [];

        const dbusService = cockpit.dbus("org.opensuse.TransactionalUpdate");
        const dbusProxy = dbusService.proxy("org.opensuse.TransactionalUpdate",
                                            "/org/opensuse/TransactionalUpdate");

        const transaction = (await dbusProxy.call("CreateTransaction"))[0];
        console.log("Created transaction: ", transaction);

        // register callbacks for the patch update details DBus signals,
        // must be done before (!) calling the GetUpdates() DBus method
        dbusService.subscribe({ interface: "org.opensuse.TransactionalUpdate", path: transaction, member: "Update" },
                              (path, iface, signal, args) => {
                                  console.debug("Received patch: ", args[0]);
                                  // add patch to the list
                                  patches.push(new Patch(args[0]));
                              });

        const promise = new Promise(resolve => {
            dbusService.subscribe({ interface: "org.opensuse.TransactionalUpdate", path: transaction, member: "Finished" },
                                  () => {
                                      console.log("Patch reading finished, found", patches.length, "patches");
                                      resolve(patches);
                                  });
        });

        const transactionProxy = dbusService.proxy("org.opensuse.TransactionalUpdate", transaction);
        transactionProxy.call("GetUpdates");

        return promise;
    }

    constructor({ name, version, category, severity, summary, description }) {
        this.name = name;
        this.version = version;
        this.category = category;
        this.severity = severity;
        this.summary = summary;
        this.description = description;
    }
}
