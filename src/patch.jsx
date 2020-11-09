
import cockpit from 'cockpit';

export class Patch {
    static async patches() {
        const xml = await cockpit.spawn(["zypper", "--xmlout", "list-patches"], { superuser : "require" });

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");

        const updates = xmlDoc.getElementsByTagName("update");

        const patches = [];
        for (let i = 0; i < updates.length; i++) {
            const update = updates[i];

            patches.push(new Patch(
                update.getAttribute("name"),
                update.getAttribute("edition"),
                update.getAttribute("category"),
                update.getAttribute("severity"),
                update.getElementsByTagName("summary")[0].textContent,
                update.getElementsByTagName("description")[0].textContent
            ));
        }

        return patches;
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
