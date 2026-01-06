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
        const root = $getRoot();
        root.clear();
        
        const parser = new DOMParser();
        const finalNodes: any[] = [];
        
        // HTML을 <hr>과 <img> 태그로 분할
        const htmlParts = content.split(/(<hr[^>]*>|<img[^>]+>)/gi);
        
        for (const part of htmlParts) {
          if (!part.trim()) continue;
          
          // <hr> 태그 처리
          if (part.match(/^<hr/i)) {
            finalNodes.push(new DividerNode());
            continue;
          }
          
          // <img> 태그 처리
          if (part.match(/^<img/i)) {
            const srcMatch = part.match(/src="([^"]+)"/);
            const altMatch = part.match(/alt="([^"]*)"/);
            const widthMatch = part.match(/width="(\d+)"/);
            const heightMatch = part.match(/height="(\d+)"/);
            
            if (srcMatch) {
              const src = srcMatch[1];
              const alt = altMatch ? altMatch[1] : "";
              const width = widthMatch ? parseInt(widthMatch[1]) : undefined;
              const height = heightMatch ? parseInt(heightMatch[1]) : undefined;
              finalNodes.push($createImageNode(src, alt, width, height));
            }
            continue;
          }
          
          // 일반 HTML 콘텐츠 처리
          const dom = parser.parseFromString(part, "text/html");
          const domNodes = $generateNodesFromDOM(editor, dom);
          finalNodes.push(...domNodes);
        }
        
        if (finalNodes.length > 0) {
          root.append(...finalNodes);
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

