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
        // variable for collecting the found patches
        const patches = [];

        const dbus_client = cockpit.dbus("org.opensuse.transactional_update");
        const dbus_proxy = dbus_client.proxy("org.opensuse.transactional_update",
                                             "/org/opensuse/transactional_update");

        const transaction = (await dbus_proxy.call("CreateTransaction"))[0];
        console.log("Created transaction: ", transaction);
        const transaction_proxy = dbus_client.proxy("org.opensuse.transactional_update", transaction);

        // register callbacks for the patch update details DBus signals,
        // must be done before (!) calling the GetUpdates() DBus method
        dbus_client.subscribe({ interface: "org.opensuse.transactional_update", path: transaction, member: "Update" },
                              (path, iface, signal, args) => {
                                  console.debug("Received patch: ", args[0]);
                                  // collect the received patches
                                  patches.push(Object.assign(new Patch(), args[0]));
                              });

        const ret = new Promise(resolve => {
            dbus_client.subscribe({ interface: "org.opensuse.transactional_update", path: transaction, member: "Finished" },
                                  () => {
                                      console.log("Patch reading finished, found", patches.length, "patches");
                                      resolve(patches);
                                  });
        });

        transaction_proxy.call("GetUpdates");

        return ret;
    }
}
