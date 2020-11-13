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

import React, { useState, useEffect } from 'react';
import { Page, PageSection, PageSectionVariants } from '@patternfly/react-core';
import { Patch } from './lib/patch';
import { Loading } from './components/Loading';
import { PatchesList } from './components/PatchesList';
import { UpdatedSystemNotice } from './components/UpdatedSystemNotice';
import cockpit from 'cockpit';

const _ = cockpit.gettext;
const n_ = cockpit.ngettext;

export function Application() {
    const [loading, setLoading] = useState(true);
    const [patches, setPatches] = useState([]);

    useEffect(() => {
        Patch.patches().then((patches) => {
            setPatches(patches);
            setLoading(false);
        });
    }, []);

    const statusText = () => {
        if (loading) {
            return _('Loading available patches. Please, wait...');
        } else {
            return n_('1 patch found', `${patches.length} patches found`, patches.length);
        }
    };

    const content = () => {
        if (loading) {
            return <Loading />;
        }

        return (
            <PatchesList
                patches={patches}
                onSubmit={ names => console.log(`Installing ${names}`) }
            />
        );
    };

    if (!loading && patches.length === 0) {
        return <UpdatedSystemNotice />;
    }

    return (
        <Page>
            <PageSection className="content-header-extra">
                <div id="state" className="content-header-extra--state">
                    {statusText()}
                </div>
            </PageSection>
            <PageSection variant={PageSectionVariants.light}>
                {content()}
            </PageSection>
        </Page>
    );
}
