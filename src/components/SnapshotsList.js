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

import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '@patternfly/react-core';
import {
    Table,
    TableHeader,
    TableBody
} from '@patternfly/react-table';
import cockpit from 'cockpit';
import prettyBytes from 'pretty-bytes';

const _ = cockpit.gettext;

const buildRows = (snapshotsList) => (
    snapshotsList.map((snapshot) => (
        {
            rowKey: snapshot.number,
            cells: [
                snapshot.number,
                snapshot.type,
                snapshot.date,
                snapshot.usedSpace ? prettyBytes(snapshot.usedSpace, { locale: true, binary: true }) : "",
                snapshot.description
            ],
            active: snapshot.active,
            current: snapshot.default
        }
    ))
);

export function SnapshotsList({ snapshots, onRebootRequest, onRollbackRequest }) {
    const [rows] = useState(buildRows(snapshots));

    const columns = [
        _("Number"), _("Type"), _("Date"), _("Size"), _("Description")
    ];

    const actionResolver = ({ id, active, current }) => {
        if (active && current) {
            return null;
        }

        if (!current) {
            return [{ title: _('Rollback'), onClick: onRollbackRequest }];
        } else {
            return [{ title: _('Reboot'), onClick: onRebootRequest }];
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{_("Existing Snapshots")}</CardTitle>
            </CardHeader>
            <CardBody>
                <Table
                    aria-label={_("Existing Snapshots")}
                    cells={columns}
                    rows={rows}
                    variant="compact"
                    actionResolver={actionResolver}
                >
                    <TableHeader />
                    <TableBody />
                </Table>
            </CardBody>
        </Card>
    );
}
