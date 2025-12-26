"use client";

import { JSX } from "react";
import {
  DecoratorNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width?: number;
    height?: number;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width?: number;
  __height?: number;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__key
    );
  }

  constructor(
    src: string,
    altText: string,
    width?: number,
    height?: number,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText, width, height } = serializedNode;
    return new ImageNode(src, altText, width, height);
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      type: "image",
      version: 1,
    };
  }

  createDOM(): HTMLElement {
    const img = document.createElement("img");
    img.src = this.__src;
    img.alt = this.__altText;
    if (this.__width) {
      img.width = this.__width;
    }
    if (this.__height) {
      img.height = this.__height;
    }
    // 이메일/아카이브 넓이에 맞게 최대 너비 제한 (약 600px)
    img.className = "max-w-[600px] w-full h-auto rounded-lg my-4";
    return img;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <img
        src={this.__src}
        alt={this.__altText}
        width={this.__width}
        height={this.__height}
        className="max-w-[600px] w-full h-auto rounded-lg my-4"
      />
    );
  }

  setWidthAndHeight(width: number, height: number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }
}

export function $createImageNode(
  src: string,
  altText: string = "",
  width?: number,
  height?: number
): ImageNode {
  return new ImageNode(src, altText, width, height);
}

