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
import React from 'react';
import {
    Backdrop, Bullseye, Spinner, DataList, DataListItem,
    DataListItemRow,
    DataListItemCells,
    DataListCell,
} from '@patternfly/react-core';
import { Patch } from './patch.jsx';

const _ = cockpit.gettext;

export class Application extends React.Component {
    constructor() {
        super();
        this.state = { loading: true };
    }

    componentDidMount() {
        Patch.patches().then((patches) =>
            this.setState({ patches: patches, loading: false })
        );
    }

    render() {
        if (this.state.loading)
            return (
                <Backdrop>
                    <Bullseye>
                        <Spinner />
                    </Bullseye>
                </Backdrop>
            );
        else {
            console.log("Rendering patches: ", this.state.patches);
            return (
                <DataList aria-label={ _("Available Patches") }>
                    <DataListItem aria-labelledby="header" key="patch_table_header">
                        <DataListItemRow>
                            <DataListItemCells
                        dataListCells={[
                            <DataListCell key="header name">
                                Name
                            </DataListCell>,
                            <DataListCell key="header category">Category</DataListCell>,
                            <DataListCell key="header severity">Severity</DataListCell>,
                            <DataListCell key="header summary">Summary</DataListCell>
                        ]}
                            />
                        </DataListItemRow>
                    </DataListItem>
                    {
                        this.state.patches.map((patch, index) => {
                            return (
                                <>
                                    <DataListItem key={index}>
                                        <DataListItemRow>
                                            <DataListItemCells
                                                dataListCells={[
                                                    <DataListCell key="patch name">
                                                        { patch.state.name }
                                                    </DataListCell>,
                                                    <DataListCell key="patch category">{ patch.state.category }</DataListCell>,
                                                    <DataListCell key="patch severity">{ patch.state.severity }</DataListCell>,
                                                    <DataListCell key="patch summary">{ patch.state.summary }</DataListCell>
                                                ]}
                                            />
                                        </DataListItemRow>
                                    </DataListItem>
                                </>
                            );
                        })
                    }
                </DataList>
            );
        }
    }
}
