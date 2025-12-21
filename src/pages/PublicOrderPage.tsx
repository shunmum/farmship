import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

const PublicOrderPage = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Package className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">注文フォーム</CardTitle>
          <CardDescription className="text-base mt-2">
            URL: {slug}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            この機能は現在準備中です。
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicOrderPage;
