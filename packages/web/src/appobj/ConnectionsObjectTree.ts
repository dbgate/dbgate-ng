import { Accessor } from "solid-js";
import { AppObjectElement, AppObjectTreeNode, AppObjectTreeContract } from "./AppObjectTreeContract";
import { useConnectionList } from "../utility/metadataLoaders";
import { StoredConnection } from "dbgate-types";

export class ConnectionTreeNode implements AppObjectTreeNode {
    element: AppObjectElement;
    children: Accessor<AppObjectTreeNode[]>;

    constructor(public data: StoredConnection) {
        this.element = {
            icon: "icon connection",
            title: this.data.displayName,
        };
        this.children = () => [];
    }
}

export class ConnectionsObjectTree implements AppObjectTreeContract {
    get children(): Accessor<AppObjectTreeNode[]> {
        const connections = useConnectionList();
        return () => connections()?.map(conn => {
            return new ConnectionTreeNode(conn);
        }) ?? [];
    }

}