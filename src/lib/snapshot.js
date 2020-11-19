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

import { UpdateService } from "./update_service";

// represent a patch received from the transactional update DBus service
export class Snapshot {
    static async snapshots() {
        // the place for collecting the found snapshots
        const snapshots = [];
        const service = new UpdateService();
        const transaction = await service.transaction();

        // register callbacks for the patch update details DBus signals,
        // must be done before (!) calling the GetUpdates() DBus method
        transaction.watchSignal(
            "Snapshot",
            (args) => {
                console.debug("Received snapshot: ", args[0]);
                // add patch to the list
                snapshots.push(new Snapshot(args[0]));
            });

        const promise = new Promise(resolve => {
            transaction.watchSignal(
                "Finished",
                () => {
                    console.log("Snapshot reading finished, found", snapshots.length, "snapshots");
                    resolve(snapshots);
                });
        });

        transaction.call("GetSnapshots");
        return promise;
    }

    constructor({
        // "default" is a keyword and minus is not allowed in a variable name,
        // these need a special handling
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Invalid_JavaScript_identifier_as_a_property_name
        subvolume, number, active, type, "pre-number" : preNumber, date, default : isDefault, user, "used-space" : usedSpace,
        cleanup, description, userdata
    }) {
        // FIXME: a DBus variant value is received as an object with "t" and "v"
        // attributes, move these ".v"s elsewhere?
        this.active = active.v;
        this.cleanup = cleanup.v;
        this.date = date.v;
        this.default = isDefault.v;
        this.description = description.v;
        this.number = number.v;
        this.preNumber = preNumber && preNumber.v;
        this.subvolume = subvolume.v;
        this.type = type.v;
        this.usedSpace = usedSpace && usedSpace.v;
        this.user = user.v;
        this.userData = userdata && userdata.v;
    }
}
