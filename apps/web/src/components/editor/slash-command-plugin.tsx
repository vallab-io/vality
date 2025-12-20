"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $isTextNode,
  TextNode,
  $isParagraphNode,
} from "lexical";
import { $createHeadingNode } from "@lexical/rich-text";
import { $createListNode, $createListItemNode } from "@lexical/list";
import { $createQuoteNode } from "@lexical/rich-text";
import { useEffect, useState, useRef } from "react";
import { $getRoot, COMMAND_PRIORITY_LOW, KEY_ENTER_COMMAND } from "lexical";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  Minus,
} from "lucide-react";
import { DividerNode } from "./divider-node";
import { cn } from "@/lib/utils";

interface CommandItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  command: () => void;
}

export function SlashCommandPlugin() {
  const [editor] = useLexicalComposerContext();
  const [showMenu, setShowMenu] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [query, setQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const allCommands: CommandItem[] = [
    {
      title: "제목 1",
      description: "큰 제목",
      icon: Heading1,
      command: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const paragraph = anchorNode.getParent();
            
            if ($isParagraphNode(paragraph)) {
              const heading = $createHeadingNode("h1");
              paragraph.replace(heading);
              heading.select();
            }
          }
        });
        setShowMenu(false);
        setQuery("");
      },
    },
    {
      title: "제목 2",
      description: "중간 제목",
      icon: Heading2,
      command: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const paragraph = anchorNode.getParent();
            
            if ($isParagraphNode(paragraph)) {
              const heading = $createHeadingNode("h2");
              paragraph.replace(heading);
              heading.select();
            }
          }
        });
        setShowMenu(false);
        setQuery("");
      },
    },
    {
      title: "제목 3",
      description: "작은 제목",
      icon: Heading3,
      command: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const paragraph = anchorNode.getParent();
            
            if ($isParagraphNode(paragraph)) {
              const heading = $createHeadingNode("h3");
              paragraph.replace(heading);
              heading.select();
            }
          }
        });
        setShowMenu(false);
        setQuery("");
      },
    },
    {
      title: "글머리 기호",
      description: "글머리 기호 목록",
      icon: List,
      command: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const paragraph = anchorNode.getParent();
            
            if ($isParagraphNode(paragraph)) {
              const listItem = $createListItemNode();
              const list = $createListNode("bullet");
              list.append(listItem);
              paragraph.replace(list);
              listItem.select();
            }
          }
        });
        setShowMenu(false);
        setQuery("");
      },
    },
    {
      title: "번호 매기기",
      description: "번호 매기기 목록",
      icon: ListOrdered,
      command: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const paragraph = anchorNode.getParent();
            
            if ($isParagraphNode(paragraph)) {
              const listItem = $createListItemNode();
              const list = $createListNode("number");
              list.append(listItem);
              paragraph.replace(list);
              listItem.select();
            }
          }
        });
        setShowMenu(false);
        setQuery("");
      },
    },
    {
      title: "인용",
      description: "인용 블록",
      icon: Quote,
      command: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const paragraph = anchorNode.getParent();
            
            if ($isParagraphNode(paragraph)) {
              const quote = $createQuoteNode();
              paragraph.replace(quote);
              quote.select();
            }
          }
        });
        setShowMenu(false);
        setQuery("");
      },
    },
    {
      title: "구분선",
      description: "수평선",
      icon: Minus,
      command: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const paragraph = anchorNode.getParent();
            
            if ($isParagraphNode(paragraph)) {
              const divider = new DividerNode();
              paragraph.replace(divider);
              
              // 구분선 다음에 새 paragraph 추가
              const newParagraph = $createParagraphNode();
              divider.insertAfter(newParagraph);
              newParagraph.select();
            }
          }
        });
        setShowMenu(false);
        setQuery("");
      },
    },
    {
      title: "이미지",
      description: "이미지 삽입",
      icon: ImageIcon,
      command: () => {
        // 이미지 업로드는 나중에 구현
        setShowMenu(false);
        setQuery("");
      },
    },
    {
      title: "링크",
      description: "링크 삽입",
      icon: LinkIcon,
      command: () => {
        const url = window.prompt("링크 URL을 입력하세요:");
        if (url) {
          // TODO: 링크 노드 삽입 구현
        }
        setShowMenu(false);
        setQuery("");
      },
    },
  ];

  // 쿼리에 따라 명령어 필터링
  const filteredCommands = query
    ? allCommands.filter(
        (cmd) =>
          cmd.title.toLowerCase().includes(query.toLowerCase()) ||
          cmd.description.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands;

  // '/' 입력 감지 및 메뉴 표시
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setShowMenu(false);
          return;
        }

        const anchorNode = selection.anchor.getNode();
        const paragraph = anchorNode.getParent();

        if ($isParagraphNode(paragraph)) {
          const textContent = paragraph.getTextContent();
          const anchorOffset = selection.anchor.offset;

          // '/' 입력 감지
          if (textContent[anchorOffset - 1] === "/" && anchorOffset === textContent.indexOf("/") + 1) {
            const domSelection = window.getSelection();
            if (domSelection && domSelection.rangeCount > 0) {
              const range = domSelection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              
              setMenuPosition({
                top: rect.bottom + window.scrollY + 5,
                left: rect.left + window.scrollX,
              });
              setShowMenu(true);
              setSelectedIndex(0);
              setQuery("");
            }
          } 
          // '/' 이후 텍스트 입력 감지 (검색)
          else if (textContent.includes("/")) {
            const slashIndex = textContent.indexOf("/");
            if (anchorOffset > slashIndex) {
              const queryText = textContent.substring(slashIndex + 1, anchorOffset);
              setQuery(queryText);
              
              if (queryText.length > 0 || anchorOffset === slashIndex + 1) {
                const domSelection = window.getSelection();
                if (domSelection && domSelection.rangeCount > 0) {
                  const range = domSelection.getRangeAt(0);
                  const rect = range.getBoundingClientRect();
                  
                  setMenuPosition({
                    top: rect.bottom + window.scrollY + 5,
                    left: rect.left + window.scrollX,
                  });
                  setShowMenu(true);
                }
              }
            } else {
              setShowMenu(false);
            }
          } else {
            setShowMenu(false);
            setQuery("");
          }
        } else {
          setShowMenu(false);
        }
      });
    });
  }, [editor]);

  // 선택된 항목이 화면에 보이도록 스크롤
  const scrollToSelected = (index: number) => {
    if (!menuRef.current) return;

    const menuContainer = menuRef.current;
    const buttons = menuContainer.querySelectorAll("button");
    const selectedButton = buttons[index] as HTMLElement;
    if (!selectedButton) return;

    const containerRect = menuContainer.getBoundingClientRect();
    const buttonRect = selectedButton.getBoundingClientRect();

    // 버튼이 컨테이너 상단 밖에 있으면 스크롤
    if (buttonRect.top < containerRect.top) {
      menuContainer.scrollTop = selectedButton.offsetTop - menuContainer.offsetTop;
    }
    // 버튼이 컨테이너 하단 밖에 있으면 스크롤
    else if (buttonRect.bottom > containerRect.bottom) {
      menuContainer.scrollTop = selectedButton.offsetTop - menuContainer.offsetTop - (containerRect.height - buttonRect.height);
    }
  };

  // 키보드 네비게이션 - Lexical 커맨드 시스템 사용
  useEffect(() => {
    if (!showMenu) return;

    // Enter 키를 Lexical 커맨드로 등록하여 에디터 입력을 차단
    const removeEnterCommand = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        if (showMenu && filteredCommands.length > 0) {
          event?.preventDefault();
          filteredCommands[selectedIndex]?.command();
          return true; // 이벤트 처리 완료
        }
        return false; // 메뉴가 없으면 기본 동작 허용
      },
      COMMAND_PRIORITY_LOW
    );

    // 화살표 키와 Escape 키는 window 이벤트로 처리
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        const newIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredCommands.length - 1;
        setSelectedIndex(newIndex);
        // 스크롤 이동
        setTimeout(() => scrollToSelected(newIndex), 0);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        const newIndex = selectedIndex < filteredCommands.length - 1 ? selectedIndex + 1 : 0;
        setSelectedIndex(newIndex);
        // 스크롤 이동
        setTimeout(() => scrollToSelected(newIndex), 0);
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setShowMenu(false);
        setQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      removeEnterCommand();
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [editor, showMenu, selectedIndex, filteredCommands]);

  if (!showMenu || filteredCommands.length === 0) return null;

  return (
    <div
      className="fixed z-50 min-w-[280px] overflow-hidden rounded-lg border border-border bg-background shadow-lg"
      style={{
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
      }}
    >
      <div ref={menuRef} className="max-h-[300px] overflow-y-auto p-1">
        {filteredCommands.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={`${item.title}-${index}`}
              onClick={() => item.command()}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                index === selectedIndex
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
