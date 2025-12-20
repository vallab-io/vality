"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { MarkNode } from "@lexical/mark";
import { DividerNode } from "./divider-node";
import { ImageNode, $createImageNode } from "./image-node";
import { $createParagraphNode } from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $getRoot } from "lexical";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SlashCommandPlugin } from "./slash-command-plugin";
import { ListPatternPlugin } from "./list-pattern-plugin";
import { ImageUploadPlugin } from "./image-upload-plugin";

interface ValityEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  issueId?: string; // 이미지 업로드를 위한 이슈 ID
}

// Placeholder 컴포넌트
function Placeholder({placeholder}: { placeholder: string }) {
  const [editor] = useLexicalComposerContext();
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    return editor.registerUpdateListener(({editorState}) => {
      editorState.read(() => {
        const root = $getRoot();
        const isEmptyEditor = root.getTextContent()
          .trim() === "";
        setIsEmpty(isEmptyEditor);
      });
    });
  }, [editor]);

  if (!isEmpty) return null;

  return (<div className="pointer-events-none absolute left-4 top-3 text-muted-foreground/50">
      {placeholder}
    </div>);
}

// 에디터 초기 상태 설정
function OnChange({onChange}: { onChange: (content: string) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({editorState}) => {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null);
        onChange(htmlString);
      });
    });
  }, [editor, onChange]);

  return null;
}

// 초기 HTML 콘텐츠 로드
function InitialContentPlugin({content}: { content: string }) {
  const [editor] = useLexicalComposerContext();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized && content) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(content, "text/html");
        
        // img 태그를 찾아서 ImageNode로 변환
        const images = dom.querySelectorAll("img");
        if (images.length > 0) {
          // 이미지가 있으면 DOM을 수정하여 ImageNode로 변환
          images.forEach((img) => {
            const src = img.getAttribute("src");
            const alt = img.getAttribute("alt") || "";
            const width = img.getAttribute("width") ? parseInt(img.getAttribute("width")!) : undefined;
            const height = img.getAttribute("height") ? parseInt(img.getAttribute("height")!) : undefined;
            
            if (src) {
              // img 태그를 data-lexical-image 속성을 가진 span으로 변환
              const span = document.createElement("span");
              span.setAttribute("data-lexical-image", "true");
              span.setAttribute("data-src", src);
              span.setAttribute("data-alt", alt);
              if (width) span.setAttribute("data-width", width.toString());
              if (height) span.setAttribute("data-height", height.toString());
              img.parentNode?.replaceChild(span, img);
            }
          });
        }
        
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        
        // data-lexical-image 속성을 가진 span을 ImageNode로 변환
        const processedNodes: any[] = [];
        for (const node of nodes) {
          if (node.getType() === "text") {
            const textNode = node as any;
            const textContent = textNode.getTextContent();
            // HTML에서 이미지 추출
            if (textContent.includes("data-lexical-image")) {
              const imgRegex = /data-src="([^"]+)"/g;
              let match;
              while ((match = imgRegex.exec(textContent)) !== null) {
                const src = match[1];
                const altMatch = textContent.match(/data-alt="([^"]*)"/);
                const alt = altMatch ? altMatch[1] : "";
                const widthMatch = textContent.match(/data-width="(\d+)"/);
                const heightMatch = textContent.match(/data-height="(\d+)"/);
                const width = widthMatch ? parseInt(widthMatch[1]) : undefined;
                const height = heightMatch ? parseInt(heightMatch[1]) : undefined;
                processedNodes.push($createImageNode(src, alt, width, height));
                processedNodes.push($createParagraphNode());
              }
            } else {
              processedNodes.push(node);
            }
          } else {
            processedNodes.push(node);
          }
        }
        
        // 이미지가 HTML에 직접 포함된 경우 처리
        if (content.includes("<img")) {
          const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
          let match;
          const imageNodes: any[] = [];
          while ((match = imgRegex.exec(content)) !== null) {
            const src = match[1];
            const altMatch = content.substring(match.index).match(/alt="([^"]*)"/);
            const alt = altMatch ? altMatch[1] : "";
            const widthMatch = content.substring(match.index).match(/width="(\d+)"/);
            const heightMatch = content.substring(match.index).match(/height="(\d+)"/);
            const width = widthMatch ? parseInt(widthMatch[1]) : undefined;
            const height = heightMatch ? parseInt(heightMatch[1]) : undefined;
            imageNodes.push($createImageNode(src, alt, width, height));
          }
          
          if (imageNodes.length > 0) {
            // 이미지가 있으면 이미지 노드와 기존 노드를 병합
            const finalNodes: any[] = [];
            let contentIndex = 0;
            
            for (const imageNode of imageNodes) {
              // 이미지 앞의 텍스트 노드 추가
              if (contentIndex < processedNodes.length) {
                finalNodes.push(...processedNodes.slice(contentIndex));
              }
              finalNodes.push(imageNode);
              finalNodes.push($createParagraphNode());
              contentIndex++;
            }
            
            // 남은 노드 추가
            if (contentIndex < processedNodes.length) {
              finalNodes.push(...processedNodes.slice(contentIndex));
            }
            
            root.append(...finalNodes);
          } else {
            root.append(...processedNodes);
          }
        } else {
          root.append(...processedNodes);
        }
      });
      setIsInitialized(true);
    }
  }, [editor, content, isInitialized]);

  return null;
}

const theme = {
  heading: {
    h1: "text-3xl font-bold mt-8 mb-4",
    h2: "text-2xl font-semibold mt-8 mb-4",
    h3: "text-xl font-semibold mt-6 mb-3",
    h4: "text-lg font-semibold mt-4 mb-2",
  }, text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "rounded bg-muted px-1.5 py-0.5 text-sm font-mono",
  }, link: "text-primary underline hover:text-primary/80", list: {
    nested: {
      listitem: "ml-4",
    }, ol: "list-decimal ml-4", ul: "list-disc ml-4",
  }, quote: "border-l-4 border-primary/30 pl-4 my-4 italic text-muted-foreground",
};

const initialConfig = {
  namespace: "ValityEditor", theme, onError: (error: Error) => {
    console.error("Lexical error:", error);
  }, nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, LinkNode, MarkNode, DividerNode, ImageNode,],
};

export function ValityEditor({
                               content, onChange, placeholder = "'/'를 눌러주세요", className, issueId,
                             }: ValityEditorProps) {
  return (<LexicalComposer initialConfig={initialConfig}>
      <div className={cn("relative", className)}>
        <RichTextPlugin
          contentEditable={<ContentEditable
            className={cn("prose prose-neutral dark:prose-invert max-w-none focus:outline-none", "min-h-[400px] px-4 py-3", "relative")}
          />}
          placeholder={<Placeholder placeholder={placeholder}/>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin/>
        <ListPlugin/>
        <LinkPlugin/>
        <OnChange onChange={onChange}/>
        <InitialContentPlugin content={content}/>
        <SlashCommandPlugin issueId={issueId} />
        <ListPatternPlugin/>
        {issueId && <ImageUploadPlugin issueId={issueId} />}
      </div>
    </LexicalComposer>);
}

