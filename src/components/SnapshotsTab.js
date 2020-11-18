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
import {
    PageSection,
    PageSectionVariants
} from '@patternfly/react-core';
import { Loading } from './Loading';
import { SnapshotsList } from './SnapshotsList';
import cockpit from 'cockpit';

const _ = cockpit.gettext;
const n_ = cockpit.ngettext;

/**
 * Dummy data. Just replace with data from the D-Bus service.
 */
const dummySnapshots = [
    { id: 2, date: new Date('2020-11-16 10:02') },
    { id: 1, date: new Date('2020-11-15 14:30'), current: true },
    { id: 0, date: new Date('2020-11-10 12:00'), active: true }
];

export function SnapshotsTab() {
    const [loading] = useState(false);
    const [snapshots] = useState(dummySnapshots);

    const statusText = () => {
        if (loading) {
            return _('Loading existing snapshots. Please, wait...');
        } else {
            return n_('1 snapshot found', `${snapshots.length} snapshots found`, snapshots.length);
        }
    };

    const content = () => {
        if (loading) {
            return <Loading />;
        }

        return (
            <SnapshotsList
                snapshots={snapshots}
                onRollbackRequest={(event, id) => console.log('Rolling back to snapshot', id)}
            />
        );
    };

    return (
        <>
            <PageSection className="content-header-extra">
                <div id="state" className="content-header-extra--state">
                    { statusText() }
                </div>
            </PageSection>
            <PageSection variant={PageSectionVariants.light}>
                { content() }
            </PageSection>
        </>
    );
}
