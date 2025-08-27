import { Accessor } from "solid-js";
import { AppObjectElement, AppObjectTreeNodeBase, AppObjectTreeBase } from "./AppObjectTreeBase";
import { useConnectionList } from "../utility/metadataLoaders";
import { StoredConnection } from "dbgate-types";
import { openedConnections, setOpenedConnections } from "../core/appstate";

export class ConnectionTreeNode extends AppObjectTreeNodeBase {

    constructor(public data: StoredConnection) {
        console.log('CREATE')
        super()
        this.element = () => ({
            icon: "icon connection",
            title: this.data.displayName,
            extInfo: this.isOpened ? 'OPENED' : this.data.engine,
        });
    }

    get isOpened() {
        return openedConnections().includes(this.data._id);
    }

    get isExpanded(): Accessor<boolean> {
        return () => this.isOpened;
    }

    onClick() {
        if (!this.isOpened) {
            setOpenedConnections((x) => [...x, this.data._id]);
        }
    }

    get children(): Accessor<AppObjectTreeNodeBase[]> {
        return () => [
            new DatabaseTreeNode(),
            new DatabaseTreeNode(),
        ];
    }
}

export class DatabaseTreeNode extends AppObjectTreeNodeBase {
    constructor() {
        super()
        this.element = () => ({
            icon: "icon database",
            title: 'DB XXX',
        });
    }
}

export class ConnectionsObjectTree extends AppObjectTreeBase {
    private connections = useConnectionList();

    get children(): Accessor<AppObjectTreeNodeBase[]> {
        return () => this.connections()?.map(conn => this.getOrCreateNode(conn._id, () => new ConnectionTreeNode(conn))) ?? [];
    }
}
