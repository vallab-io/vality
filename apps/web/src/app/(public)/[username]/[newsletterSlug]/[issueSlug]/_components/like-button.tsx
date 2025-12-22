"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addIssueLike } from "@/lib/api/public";

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

  useEffect(() => {
    setLikeCount(initialLikeCount);
  }, [initialLikeCount]);

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const newLikeCount = await addIssueLike(issueId);
      setLikeCount(newLikeCount);
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
      className="flex items-center gap-2 justify-start"
    >
      <Heart className="h-5 w-5 fill-foreground text-foreground" />
      <span className="text-sm font-medium">{likeCount}</span>
    </Button>
  );
}

