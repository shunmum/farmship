import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tractor } from "lucide-react";

const DEMO_EMAIL = "demo@farmship.example";
const DEMO_PASSWORD = "demo123456";

const AuthPage = () => {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);

    const { error } = await signIn(DEMO_EMAIL, DEMO_PASSWORD);

    if (error) {
      toast({
        title: "ログインエラー",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80">
            <Tractor className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">FarmShip</CardTitle>
          <CardDescription>農作物配送管理システム</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleDemoLogin} disabled={loading}>
            {loading ? "ログイン中..." : "デモを始める"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
