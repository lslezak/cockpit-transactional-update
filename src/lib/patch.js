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
export class Patch {
    static async patches() {
        // the place for collecting the found patches
        const patches = [];
        const service = new UpdateService();
        const transaction = await service.transaction();

        // register callbacks for the patch update details DBus signals,
        // must be done before (!) calling the GetUpdates() DBus method
        transaction.watchSignal(
            "Update",
            (args) => {
                console.debug("Received patch: ", args[0]);
                // add patch to the list
                patches.push(new Patch(args[0]));
            });

        const promise = new Promise(resolve => {
            transaction.watchSignal(
                "Finished",
                () => {
                    console.log("Patch reading finished, found", patches.length, "patches");
                    resolve(patches);
                });
        });

        transaction.call("GetUpdates");
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
