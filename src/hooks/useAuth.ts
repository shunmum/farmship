export function useAuth() {
  const demoUser = {
    id: "demo-user-001",
    email: "demo@farmship.example",
  };

  const signOut = async () => {
    return { error: null };
  };

  const signIn = async (_email: string, _password: string) => {
    return { data: { user: demoUser }, error: null };
  };

  const signUp = async () => {
    return { data: { user: demoUser }, error: null };
  };

  return {
    user: demoUser,
    session: null,
    loading: false,
    signIn,
    signUp,
    signOut,
  };
}
