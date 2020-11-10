/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2017 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import cockpit from 'cockpit';
import React, { useState, useEffect } from 'react';
import { Backdrop, Bullseye, Spinner } from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';

import { Patch } from './lib/patch';

const _ = cockpit.gettext;

export function Application() {
    const [loading, setLoading] = useState(true);
    const [patches, setPatches] = useState([]);

    const columns = [
        "Name",
        "Version",
        "Category",
        "Severity",
        "Summary"
    ];

    useEffect(() => {
        Patch.patches().then((patches) => {
            setPatches(patches);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <Backdrop>
                <Bullseye>
                    <Spinner />
                </Bullseye>
            </Backdrop>
        );
    } else {
        console.log("Rendering patches: ", patches);

        const rows = patches.map((patch) => {
            return {
                cells: [
                    patch.name,
                    patch.version,
                    patch.category,
                    patch.severity,
                    patch.summary
                ]
            };
        });

        return (
            <Table caption={ _("Available Updates") } cells={columns} rows={rows}>
                <TableHeader />
                <TableBody />
            </Table>
        );
    }
}
