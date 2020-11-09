
import cockpit from 'cockpit';
import React from 'react';
import {
    DataListItem,
    DataListItemRow,
    DataListItemCells,
    DataListCell,
} from '@patternfly/react-core';

// const _ = cockpit.gettext;

export class Patch extends React.Component {
    static async patches() {
        const xml = await cockpit.spawn(["zypper", "--xmlout", "list-patches"], { superuser : "require" });

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");

        const updates = xmlDoc.getElementsByTagName("update");

        const patches = [];
        for (let i = 0; i < updates.length; i++) {
            const update = updates[i];
            const data = {};

            data.name = update.getAttribute("name");
            data.edition = update.getAttribute("edition");
            data.category = update.getAttribute("category");
            data.severity = update.getAttribute("severity");

            data.summary = update.getElementsByTagName("summary")[0].textContent;
            data.description = update.getElementsByTagName("description")[0].textContent;

            patches.push(new Patch(data));
        }

        return patches;
    }

    constructor(data) {
        console.debug("Creating patch: ", data);
        super();
        this.state = data;
        this.state.selected = false;
    }

    render() {
        return (
            <DataListItem aria-labelledby="simple-item1">
                <DataListItemRow>
                    <DataListItemCells
                        dataListCells={[
                            <DataListCell key="primary content">
                                { this.state.name }
                            </DataListCell>,
                            <DataListCell key="secondary content">{ this.state.category }</DataListCell>
                        ]}
                    />
                </DataListItemRow>
            </DataListItem>
        );
    }
}
