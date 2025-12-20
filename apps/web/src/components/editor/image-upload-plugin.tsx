"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $isParagraphNode,
} from "lexical";
import { useEffect, useRef } from "react";
import { $createImageNode } from "./image-node";
import { uploadIssueImage } from "@/lib/api/upload";
import { toast } from "sonner";

interface ImageUploadPluginProps {
  issueId: string;
}

export function ImageUploadPlugin({ issueId }: ImageUploadPluginProps) {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // 파일 입력 엘리먼트 생성
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/jpeg,image/jpg,image/png,image/gif,image/webp";
    fileInput.style.display = "none";
    fileInputRef.current = fileInput;
    
    // DOM에 먼저 추가 (click()이 작동하려면 DOM에 있어야 함)
    document.body.appendChild(fileInput);
    
    console.log("File input created and added to DOM", { fileInput, issueId });

    const handleFileSelect = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      // 파일 검증
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("JPG, PNG, GIF, WEBP 형식만 업로드 가능합니다.");
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("이미지 크기는 5MB 이하여야 합니다.");
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
        // 파일 입력 초기화
        target.value = "";
      }
    };

    fileInput.addEventListener("change", handleFileSelect);

    // Paste 이벤트 처리
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          // 파일 검증
          const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
          if (!validTypes.includes(file.type)) {
            toast.error("JPG, PNG, GIF, WEBP 형식만 업로드 가능합니다.");
            continue;
          }

          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file.size > maxSize) {
            toast.error("이미지 크기는 5MB 이하여야 합니다.");
            continue;
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
          }
        }
      }
    };

    // Drag & Drop 이벤트 처리
    const handleDrop = async (e: DragEvent) => {
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      if (!file.type.startsWith("image/")) return;

      e.preventDefault();

      // 파일 검증
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("JPG, PNG, GIF, WEBP 형식만 업로드 가능합니다.");
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("이미지 크기는 5MB 이하여야 합니다.");
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
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    // 이벤트 리스너 등록
    const contentEditable = editor.getRootElement();
    if (contentEditable) {
      contentEditable.addEventListener("paste", handlePaste);
      contentEditable.addEventListener("drop", handleDrop);
      contentEditable.addEventListener("dragover", handleDragOver);
    }

    // 파일 입력을 전역으로 노출 (slash command에서 사용)
    // DOM에 추가된 후에 함수 등록
    const triggerFileInput = () => {
      const input = fileInputRef.current;
      console.log("triggerFileInput called", { 
        input, 
        hasParent: !!input?.parentNode,
        parentIsBody: input?.parentNode === document.body,
        isConnected: input?.isConnected
      });
      
      if (input && input.isConnected) {
        try {
          console.log("Calling input.click()");
          // 사용자 상호작용 이벤트 내에서 실행되므로 작동해야 함
          input.click();
        } catch (error) {
          console.error("Error clicking file input:", error);
          toast.error("파일 선택 다이얼로그를 열 수 없습니다.");
        }
      } else {
        console.error("File input not ready", { 
          input, 
          parent: input?.parentNode,
          parentIsBody: input?.parentNode === document.body,
          isConnected: input?.isConnected
        });
        toast.error("이미지 업로드 준비 중입니다. 잠시 후 다시 시도해주세요.");
      }
    };
    
    (window as any).__valityImageUpload = triggerFileInput;
    
    console.log("ImageUploadPlugin initialized", { issueId, fileInput, hasFunction: !!(window as any).__valityImageUpload });

    return () => {
      fileInput.removeEventListener("change", handleFileSelect);
      if (fileInput.parentNode === document.body) {
        document.body.removeChild(fileInput);
      }
      if (contentEditable) {
        contentEditable.removeEventListener("paste", handlePaste);
        contentEditable.removeEventListener("drop", handleDrop);
        contentEditable.removeEventListener("dragover", handleDragOver);
      }
      delete (window as any).__valityImageUpload;
    };
  }, [editor, issueId]);

  return null;
}

