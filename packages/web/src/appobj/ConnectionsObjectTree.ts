import { Accessor } from "solid-js";
import { AppObjectElement, AppObjectTreeNodeBase, AppObjectTreeBase } from "./AppObjectTreeContract";
import { useConnectionList } from "../utility/metadataLoaders";
import { StoredConnection } from "dbgate-types";

export class ConnectionTreeNode implements AppObjectTreeNodeBase {
    element: AppObjectElement;
    children: Accessor<AppObjectTreeNodeBase[]>;

    constructor(public data: StoredConnection) {
        this.element = {
            icon: "icon connection",
            title: this.data.displayName,
            extInfo: this.data.engine,
        };
        this.children = () => [];
    }
}

export class ConnectionsObjectTree implements AppObjectTreeBase {
    private connections = useConnectionList();

    get children(): Accessor<AppObjectTreeNodeBase[]> {
        return () => this.connections()?.map(conn => new ConnectionTreeNode(conn)) ?? [];
    }
}
