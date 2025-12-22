"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LikeButtonProps {
  issueId: string;
  initialLikeCount?: number;
}

export function LikeButton({ 
  issueId, 
  initialLikeCount = 0 
}: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      // TODO: 백엔드 API 연동
      // const response = await likeIssue(issueId);
      // setLikeCount(response.likeCount);

      // Medium clap 방식: 클릭할 때마다 계속 증가
      setLikeCount((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleLike}
      disabled={isLoading}
      className="flex items-center gap-2 font-semibold"
    >
      <Heart className="h-5 w-5 fill-foreground text-foreground" />
      <span>{likeCount}</span>
    </Button>
  );
}

