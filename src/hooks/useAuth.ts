// モック版: Supabaseを使わず固定ユーザーを返す
export function useAuth() {
  const mockUser = {
    id: "mock-user-001",
    email: "wada@farm.example.com",
  };

  const signOut = async () => {
    // モックではログアウトしない
    return { error: null };
  };

  const signIn = async (_email: string, _password: string) => {
    return { data: { user: mockUser }, error: null };
  };

  const signUp = async () => {
    return { data: { user: mockUser }, error: null };
  };

  return {
    user: mockUser,
    session: null,
    loading: false,
    signIn,
    signUp,
    signOut,
  };
}
