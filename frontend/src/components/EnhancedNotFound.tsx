// components/EnhancedNotFound.tsx
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface NotFoundState {
  message?: string;
  attemptedUrl?: string;
}

export default function EnhancedNotFound() {
  const location = useLocation();
  const state = location.state as NotFoundState;

  return (
    <div className=" flex items-center justify-center  p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-3xl">404</CardTitle>
            <CardTitle className="text-xl mt-2">Page Not Found</CardTitle>
            <CardDescription className="mt-2">
              {state?.message || "The page you're looking for doesn't exist."}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {state?.attemptedUrl && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-medium">Attempted URL:</p>
              <p className="text-sm text-muted-foreground font-mono break-all">
                {state.attemptedUrl}
              </p>
            </div>
          )}
          
          <p className="text-muted-foreground">
            You can try going back or use the navigation below.
          </p>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link to={"/browse"}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              browse
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto flex-1">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Homepage
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}