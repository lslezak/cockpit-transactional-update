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
        const xml = await cockpit.spawn(["zypper", "--xmlout", "list-patches"], { superuser : "require" });

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");

        const updates = xmlDoc.getElementsByTagName("update");

        return Array.from(updates).map((update) => {
            return new Patch(
                update.getAttribute("name"),
                update.getAttribute("edition"),
                update.getAttribute("category"),
                update.getAttribute("severity"),
                update.getElementsByTagName("summary")[0].textContent,
                update.getElementsByTagName("description")[0].textContent
            );
        });
    }

    constructor(name, version, category, severity, summary, description) {
        this.name = name;
        this.version = version;
        this.category = category;
        this.severity = severity;
        this.summary = summary;
        this.description = description;

        console.debug("Created Patch object: ", this);
    }
}
