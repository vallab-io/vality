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
  Minus,
} from "lucide-react";
import { DividerNode } from "./divider-node";
import { cn } from "@/lib/utils";
import { $createImageNode } from "./image-node";
import { uploadIssueImage } from "@/lib/api/upload";
import { toast } from "sonner";

interface CommandItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  command: () => void;
}

interface SlashCommandPluginProps {
  issueId?: string;
}

export function SlashCommandPlugin({ issueId }: SlashCommandPluginProps = {}) {
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
        setShowMenu(false);
        setQuery("");
        
        // issueId가 없으면 에러 메시지
        if (!issueId) {
          toast.error("이미지 업로드를 위해서는 먼저 이슈를 저장해주세요.");
          return;
        }
        
        // 파일 입력 엘리먼트 생성
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/jpeg,image/jpg,image/png,image/gif,image/webp";
        fileInput.style.display = "none";
        
        const handleFileSelect = async (e: Event) => {
          const target = e.target as HTMLInputElement;
          const file = target.files?.[0];
          if (!file) {
            document.body.removeChild(fileInput);
            return;
          }

          // 파일 검증
          const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
          if (!validTypes.includes(file.type)) {
            toast.error("JPG, PNG, GIF, WEBP 형식만 업로드 가능합니다.");
            document.body.removeChild(fileInput);
            return;
          }

          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file.size > maxSize) {
            toast.error("이미지 크기는 5MB 이하여야 합니다.");
            document.body.removeChild(fileInput);
            return;
          }

          try {
            // 업로드 시작 토스트
            const uploadToast = toast.loading("이미지 업로드 중...");

            // 이미지 업로드
            const imageUrl = await uploadIssueImage(issueId, file);

            // 업로드 완료 토스트
            toast.dismiss(uploadToast);
            toast.success("이미지가 업로드되었습니다.");

            // 에디터에 이미지 삽입
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                const anchorNode = selection.anchor.getNode();
                const paragraph = anchorNode.getParent();

                if ($isParagraphNode(paragraph)) {
                  // 이미지 노드 생성
                  const imageNode = $createImageNode(imageUrl, file.name);

                  // 현재 paragraph를 이미지로 교체
                  paragraph.replace(imageNode);

                  // 이미지 다음에 새 paragraph 추가
                  const newParagraph = $createParagraphNode();
                  imageNode.insertAfter(newParagraph);
                  newParagraph.select();
                }
              }
            });
          } catch (error: any) {
            console.error("Image upload error:", error);
            toast.error(error.message || "이미지 업로드에 실패했습니다.");
          } finally {
            // 파일 입력 제거
            document.body.removeChild(fileInput);
          }
        };

        fileInput.addEventListener("change", handleFileSelect);
        document.body.appendChild(fileInput);
        
        // 파일 선택 다이얼로그 열기
        fileInput.click();
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

          // 커서 위치 계산 함수
          const calculateMenuPosition = () => {
            requestAnimationFrame(() => {
              const domSelection = window.getSelection();
              if (!domSelection || domSelection.rangeCount === 0) return;
              
              const range = domSelection.getRangeAt(0);
              
              // 커서 위치를 정확히 계산하기 위해 collapsed range 사용
              const clonedRange = range.cloneRange();
              clonedRange.collapse(true);
              
              const rect = clonedRange.getBoundingClientRect();
              
              // 뷰포트 기준 위치 (fixed positioning 사용)
              const viewportTop = rect.bottom;
              const viewportLeft = rect.left;
              
              // 메뉴 크기 추정 (실제로는 메뉴가 렌더링된 후에 정확히 알 수 있음)
              const menuHeight = 300; // max-h-[300px]
              const menuWidth = 280; // min-w-[280px]
              
              // 화면 밖으로 나가지 않도록 조정
              const windowHeight = window.innerHeight;
              const windowWidth = window.innerWidth;
              
              let finalTop = viewportTop + 5;
              let finalLeft = viewportLeft;
              
              // 하단이 화면 밖으로 나가면 위에 표시
              if (finalTop + menuHeight > windowHeight) {
                finalTop = rect.top - menuHeight - 5;
                // 위에도 공간이 없으면 화면 중앙에 표시
                if (finalTop < 0) {
                  finalTop = Math.max(10, (windowHeight - menuHeight) / 2);
                }
              }
              
              // 우측이 화면 밖으로 나가면 조정
              if (finalLeft + menuWidth > windowWidth) {
                finalLeft = windowWidth - menuWidth - 10;
              }
              
              // 좌측이 화면 밖으로 나가면 조정
              if (finalLeft < 0) {
                finalLeft = 10;
              }
              
              setMenuPosition({
                top: finalTop,
                left: finalLeft,
              });
            });
          };
          
          // '/' 입력 감지
          if (textContent[anchorOffset - 1] === "/" && anchorOffset === textContent.indexOf("/") + 1) {
            calculateMenuPosition();
            setShowMenu(true);
            setSelectedIndex(0);
            setQuery("");
          } 
          // '/' 이후 텍스트 입력 감지 (검색)
          else if (textContent.includes("/")) {
            const slashIndex = textContent.indexOf("/");
            if (anchorOffset > slashIndex) {
              const queryText = textContent.substring(slashIndex + 1, anchorOffset);
              setQuery(queryText);
              
              if (queryText.length > 0 || anchorOffset === slashIndex + 1) {
                calculateMenuPosition();
                setShowMenu(true);
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
    // 스크롤 가능한 내부 컨테이너 찾기 (overflow-y-auto 클래스를 가진 첫 번째 자식)
    let scrollContainer: HTMLElement | null = null;
    for (const child of Array.from(menuContainer.children)) {
      const childElement = child as HTMLElement;
      const computedStyle = getComputedStyle(childElement);
      if (computedStyle.overflowY === "auto" || computedStyle.overflowY === "scroll") {
        scrollContainer = childElement;
        break;
      }
    }
    
    // 스크롤 컨테이너를 찾지 못하면 메뉴 컨테이너 자체 사용
    if (!scrollContainer) {
      scrollContainer = menuContainer;
    }
    
    const buttons = scrollContainer.querySelectorAll("button");
    const selectedButton = buttons[index] as HTMLElement;
    if (!selectedButton) return;

    // 버튼의 상대적 위치 계산 (스크롤 컨테이너의 첫 번째 자식 기준)
    const buttonOffsetTop = selectedButton.offsetTop;
    const containerScrollTop = scrollContainer.scrollTop;
    const containerHeight = scrollContainer.clientHeight;
    const buttonHeight = selectedButton.offsetHeight;
    
    // 버튼이 보이는 영역 밖에 있는지 확인
    const buttonTop = buttonOffsetTop - containerScrollTop;
    const buttonBottom = buttonTop + buttonHeight;
    
    // 버튼이 컨테이너 상단 밖에 있으면 스크롤
    if (buttonTop < 0) {
      scrollContainer.scrollTop = buttonOffsetTop - 10; // 상단 여백
    }
    // 버튼이 컨테이너 하단 밖에 있으면 스크롤
    else if (buttonBottom > containerHeight) {
      scrollContainer.scrollTop = buttonOffsetTop - containerHeight + buttonHeight + 10; // 하단 여백
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
        // 스크롤 이동 (다음 프레임에서 실행하여 DOM 업데이트 대기)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToSelected(newIndex);
          });
        });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        const newIndex = selectedIndex < filteredCommands.length - 1 ? selectedIndex + 1 : 0;
        setSelectedIndex(newIndex);
        // 스크롤 이동 (다음 프레임에서 실행하여 DOM 업데이트 대기)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToSelected(newIndex);
          });
        });
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

  // selectedIndex가 변경될 때마다 스크롤
  useEffect(() => {
    if (showMenu && filteredCommands.length > 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToSelected(selectedIndex);
        });
      });
    }
  }, [showMenu, selectedIndex, filteredCommands.length]);

  // 메뉴가 표시될 때마다 위치 재계산
  useEffect(() => {
    if (showMenu) {
      const updatePosition = () => {
        const domSelection = window.getSelection();
        if (!domSelection || domSelection.rangeCount === 0) return;
        
        const range = domSelection.getRangeAt(0);
        const clonedRange = range.cloneRange();
        clonedRange.collapse(true);
        
        const rect = clonedRange.getBoundingClientRect();
        
        // 메뉴 크기 (실제 렌더링된 크기)
        const menuElement = menuRef.current;
        const menuHeight = menuElement?.offsetHeight || 300;
        const menuWidth = menuElement?.offsetWidth || 280;
        
        // 뷰포트 기준 위치
        let finalTop = rect.bottom + 5;
        let finalLeft = rect.left;
        
        // 화면 밖으로 나가지 않도록 조정
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        
        // 하단이 화면 밖으로 나가면 위에 표시
        if (finalTop + menuHeight > windowHeight) {
          finalTop = rect.top - menuHeight - 5;
          // 위에도 공간이 없으면 화면 중앙에 표시
          if (finalTop < 0) {
            finalTop = Math.max(10, (windowHeight - menuHeight) / 2);
          }
        }
        
        // 우측이 화면 밖으로 나가면 조정
        if (finalLeft + menuWidth > windowWidth) {
          finalLeft = windowWidth - menuWidth - 10;
        }
        
        // 좌측이 화면 밖으로 나가면 조정
        if (finalLeft < 0) {
          finalLeft = 10;
        }
        
        setMenuPosition({
          top: finalTop,
          left: finalLeft,
        });
      };
      
      // 즉시 위치 계산
      requestAnimationFrame(updatePosition);
      
      // 스크롤 이벤트 리스너 추가
      const handleScroll = () => {
        updatePosition();
      };
      
      window.addEventListener("scroll", handleScroll, true);
      const editorElement = document.querySelector('[contenteditable="true"]');
      const editorContainer = editorElement?.closest('.relative') || editorElement?.parentElement;
      if (editorContainer) {
        editorContainer.addEventListener("scroll", handleScroll, true);
      }
      
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        if (editorContainer) {
          editorContainer.removeEventListener("scroll", handleScroll, true);
        }
      };
    }
  }, [showMenu]);

  if (!showMenu || filteredCommands.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[280px] overflow-hidden rounded-lg border border-border bg-background shadow-lg"
      style={{
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
      }}
    >
      <div className="max-h-[300px] overflow-y-auto p-1">
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
