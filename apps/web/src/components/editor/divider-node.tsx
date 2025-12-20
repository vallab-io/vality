"use client";

import { DecoratorNode, NodeKey, SerializedLexicalNode } from "lexical";

export type SerializedDividerNode = SerializedLexicalNode & {
  type: "divider";
  version: 1;
};

export class DividerNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return "divider";
  }

  static clone(node: DividerNode): DividerNode {
    return new DividerNode(node.__key);
  }

  static importJSON(_serializedNode: SerializedDividerNode): DividerNode {
    return new DividerNode();
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  exportJSON(): SerializedDividerNode {
    return {
      ...super.exportJSON(),
      type: "divider",
      version: 1,
    };
  }

  createDOM(): HTMLElement {
    const hr = document.createElement("hr");
    hr.className = "my-8 border-t border-border";
    return hr;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return <hr className="my-8 border-t border-border" />;
  }
}

