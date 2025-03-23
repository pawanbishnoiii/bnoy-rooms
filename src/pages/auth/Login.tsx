
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, LogIn, User2, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const { signIn, signInWithGoogle, signInWithFacebook, isAuthenticated, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Get the intended destination from location state or default to '/'
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // If user is already authenticated, redirect them based on role
    if (isAuthenticated && profile) {
      if (profile.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (profile.role === 'merchant') {
        navigate('/merchant/dashboard', { replace: true });
      } else if (profile.role === 'student') {
        navigate('/student/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, navigate, from, profile]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setError(null);
      setIsLoading(true);
      await signIn(values.email, values.password);
      setLoginSuccess(true);
      
      // Navigation will happen automatically in the useEffect when isAuthenticated becomes true
    } catch (error) {
      // Error is already handled in the signIn function
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
      // Redirect will happen automatically
    } catch (error) {
      // Error is already handled in the signInWithGoogle function
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setError(null);
      await signInWithFacebook();
      // Redirect will happen automatically
    } catch (error) {
      // Error is already handled in the signInWithFacebook function
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 animate-fade-in">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loginSuccess && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200 animate-fade-in">
                <AlertDescription className="flex items-center">
                  Login successful! Redirecting...
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="social">Social Login</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="animate-fade-in">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="you@example.com"
                                className="pl-10"
                                disabled={isLoading}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Password</FormLabel>
                            <Link to="/auth/reset-password" className="text-xs text-primary hover:underline">
                              Forgot password?
                            </Link>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="password"
                                placeholder="••••••••"
                                className="pl-10"
                                disabled={isLoading}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full relative overflow-hidden transition-all hover:shadow-md"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          Sign in
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="social" className="animate-fade-in">
                <div className="flex flex-col space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full relative overflow-hidden transition-all hover:bg-gray-100"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <User2 className="mr-2 h-4 w-4" />
                    Sign in with Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full relative overflow-hidden transition-all hover:bg-gray-100"
                    onClick={handleFacebookSignIn}
                    disabled={isLoading}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in with Facebook
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Link to="/auth/register" className="font-medium text-primary hover:underline">
                Register
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
