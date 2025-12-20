"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $isParagraphNode,
  $isTextNode,
  KEY_SPACE_COMMAND,
  COMMAND_PRIORITY_LOW,
  $createTextNode,
  $getRoot,
} from "lexical";
import { $createListNode, $createListItemNode } from "@lexical/list";
import { useEffect } from "react";

export function ListPatternPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_SPACE_COMMAND,
      (event: KeyboardEvent | null) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        const anchorNode = selection.anchor.getNode();
        
        // 텍스트 노드인지 확인
        if (!$isTextNode(anchorNode)) {
          return false;
        }

        const paragraph = anchorNode.getParent();
        if (!$isParagraphNode(paragraph)) {
          return false;
        }

        const textContent = paragraph.getTextContent();
        const anchorOffset = selection.anchor.offset;

        // "- " 패턴 감지 (글머리 기호)
        // 스페이스바를 누르기 전에는 "-"만 있고 offset은 1
        if (textContent.slice(0, anchorOffset) === "-" && anchorOffset === 1) {
          event?.preventDefault();
          
          editor.update(() => {
            // "-" 텍스트 제거하고 리스트로 변환
            const listItem = $createListItemNode();
            const list = $createListNode("bullet");
            list.append(listItem);
            
            paragraph.replace(list);
            listItem.select();
          });
          
          return true;
        }

        // "숫자. " 패턴 감지 (번호 매기기)
        // 스페이스바를 누르기 전에는 "숫자."만 있음
        const numberedPattern = /^(\d+)\.$/;
        const textBeforeCursor = textContent.slice(0, anchorOffset);
        const match = textBeforeCursor.match(numberedPattern);
        
        if (match && anchorOffset === match[0].length) {
          event?.preventDefault();
          
          editor.update(() => {
            // "숫자." 텍스트 제거하고 리스트로 변환
            const listItem = $createListItemNode();
            const list = $createListNode("number");
            list.append(listItem);
            
            paragraph.replace(list);
            listItem.select();
          });
          
          return true;
        }

        return false; // 기본 동작 허용
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}
