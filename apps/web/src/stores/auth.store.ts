import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// 사용자 타입 정의
export interface User {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  bio: string | null;
  imageUrl: string | null;
}

// 인증 상태 타입
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// 사용자 정보 (localStorage에 저장)
export const userAtom = atomWithStorage<User | null>("user", null);

// 로딩 상태
export const authLoadingAtom = atom<boolean>(true);

// 인증 여부 파생 atom (user가 null이 아니면 인증됨)
export const isAuthenticatedAtom = atom((get) => {
  const user = get(userAtom);
  return user !== null;
});

// 전체 인증 상태 파생 atom
export const authStateAtom = atom<AuthState>((get) => ({
  user: get(userAtom),
  isAuthenticated: get(isAuthenticatedAtom),
  isLoading: get(authLoadingAtom),
}));

