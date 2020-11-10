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
import { Button, Card, CardHeader, CardActions, CardTitle, CardBody } from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import { PatchDetails } from './PatchDetails';
import cockpit from 'cockpit';

const _ = cockpit.gettext;

/**
 * Builds the needed structure for rendering the patches and their details in an expandable
 * Patternfly/Table
 */
const buildRows = (patchesList) => (
    patchesList.reduce((list, patch, rowId) => {
        const parentRow = {
            isOpen: false,
            selected: false,
            cells: [
                patch.name,
                patch.version,
                patch.category,
                patch.severity,
                patch.summary,
            ]
        };
        const detailsRow = {
            parent: rowId * 2,
            cells: [
                { title: <PatchDetails patch={patch} /> }
            ]
        };

        return [...list, parentRow, detailsRow];
    }, [])
);

export function PatchesList({ patches, onSubmit }) {
    const [rows, setRows] = useState(buildRows(patches));
    const [selectedRows, setSelectedRows] = useState([]);

    const columns = [
        _("Name"),
        _("Version"),
        _("Category"),
        _("Severity"),
        _("Summary")
    ];

    const onCollapse = (event, rowId, isOpen) => {
        const newRows = rows.map((row, idx) => (
            { ...row, isOpen: (rowId === idx) ? isOpen : row.isOpen }
        ));
        setRows(newRows);
    };

    const onSelect = (event, isSelected, rowId) => {
        const newRows = rows.map((row, idx) => (
            { ...row, selected: (rowId === -1 || rowId === idx) ? isSelected : row.selected }
        ));
        setRows(newRows);

        if (isSelected && !selectedRows.includes(rowId)) {
            setSelectedRows([...selectedRows, rowId]);
        } else {
            setSelectedRows(selectedRows.filter(r => r !== rowId));
        }
    };

    const onSubmitFn = () => {
        const names = selectedRows.map(r => rows[r].cells[0]);
        onSubmit(names);
    };

    return (
        <Card>
            <CardHeader>
                <CardActions>
                    { onSubmit &&
                    <Button
                        variant="primary"
                        isDisabled={selectedRows.length === 0}
                        onClick={onSubmitFn}
                    >
                        {_("Install Patches")}
                    </Button> }
                </CardActions>
                <CardTitle><h2>{_("Available Updates")}</h2></CardTitle>
            </CardHeader>
            <CardBody>
                <Table
                    aria-label={_("Available Updates")}
                    cells={columns}
                    rows={rows}
                    onCollapse={onCollapse}
                    onSelect={onSelect}
                    canSelectAll
                    variant="compact"
                >
                    <TableHeader />
                    <TableBody />
                </Table>
            </CardBody>
        </Card>
    );
}
