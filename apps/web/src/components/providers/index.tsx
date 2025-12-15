"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider as JotaiProvider, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { userAtom, authLoadingAtom } from "@/stores/auth.store";
import { getCurrentUser } from "@/lib/api/auth";

interface ProvidersProps {
  children: React.ReactNode;
}

// 인증 상태 초기화 컴포넌트
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setUser = useSetAtom(userAtom);
  const setAuthLoading = useSetAtom(authLoadingAtom);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // localStorage에서 accessToken 확인
        const accessToken = localStorage.getItem("accessToken");
        
        if (!accessToken) {
          // accessToken이 없으면 user도 null로 설정
          setUser(null);
          setAuthLoading(false);
          setIsInitialized(true);
          return;
        }

        // accessToken이 있으면 /auth/me 호출하여 user 정보 가져오기
        try {
          const user = await getCurrentUser();
          setUser(user);
        } catch (error) {
          // 인증 실패 시 (토큰 만료 등) localStorage 정리
          console.error("Failed to get current user:", error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      } finally {
        setAuthLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [setUser, setAuthLoading]);

  // 초기화 완료 전까지는 로딩 상태 유지
  if (!isInitialized) {
    return null; // 또는 로딩 스피너 표시
  }

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 데이터가 오래됐다고 판단하는 시간 (5분)
            staleTime: 5 * 60 * 1000,
            // 캐시 유지 시간 (10분)
            gcTime: 10 * 60 * 1000,
            // 실패 시 재시도 횟수
            retry: 1,
            // 윈도우 포커스 시 자동 리페치 비활성화
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>{children}</AuthInitializer>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </JotaiProvider>
  );
}

