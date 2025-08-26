import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, CheckCircle } from "lucide-react";
import { insertUserSchema } from "@shared/schema";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      firstName: "",
      lastName: "",
      terms: false,
    },
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    const { confirmPassword, terms, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-brand-500 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">SecureVault</h2>
            <p className="mt-2 text-gray-600">Your personal secure file storage</p>
          </div>

          {isLogin ? (
            /* Login Form */
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Sign in to your account</h3>
              <form className="space-y-6" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <div>
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    type="text"
                    {...loginForm.register("username")}
                    data-testid="input-login-username"
                    className="mt-1"
                    placeholder="Enter your username"
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-sm text-red-600 mt-1">{loginForm.formState.errors.username.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    {...loginForm.register("password")}
                    data-testid="input-login-password"
                    className="mt-1"
                    placeholder="Enter your password"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-700"
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  data-testid="link-register"
                  className="text-sm text-brand-600 hover:text-brand-500"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </div>
          ) : (
            /* Register Form */
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Create your account</h3>
              <form className="space-y-6" onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="register-firstName">First name</Label>
                    <Input
                      id="register-firstName"
                      type="text"
                      {...registerForm.register("firstName")}
                      data-testid="input-register-firstname"
                      className="mt-1"
                      placeholder="John"
                    />
                    {registerForm.formState.errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">{registerForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="register-lastName">Last name</Label>
                    <Input
                      id="register-lastName"
                      type="text"
                      {...registerForm.register("lastName")}
                      data-testid="input-register-lastname"
                      className="mt-1"
                      placeholder="Doe"
                    />
                    {registerForm.formState.errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">{registerForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="register-username">Username</Label>
                  <Input
                    id="register-username"
                    type="text"
                    {...registerForm.register("username")}
                    data-testid="input-register-username"
                    className="mt-1"
                    placeholder="Choose a username"
                  />
                  {registerForm.formState.errors.username && (
                    <p className="text-sm text-red-600 mt-1">{registerForm.formState.errors.username.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="register-email">Email address</Label>
                  <Input
                    id="register-email"
                    type="email"
                    {...registerForm.register("email")}
                    data-testid="input-register-email"
                    className="mt-1"
                    placeholder="user@example.com"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    {...registerForm.register("password")}
                    data-testid="input-register-password"
                    className="mt-1"
                    placeholder="Create a password"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">{registerForm.formState.errors.password.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                </div>

                <div>
                  <Label htmlFor="register-confirmPassword">Confirm password</Label>
                  <Input
                    id="register-confirmPassword"
                    type="password"
                    {...registerForm.register("confirmPassword")}
                    data-testid="input-register-confirm-password"
                    className="mt-1"
                    placeholder="Confirm your password"
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="register-terms"
                    checked={registerForm.watch("terms")}
                    onCheckedChange={(checked) => registerForm.setValue("terms", !!checked)}
                    data-testid="checkbox-terms"
                  />
                  <Label htmlFor="register-terms" className="text-sm">
                    I agree to the <a href="#" className="text-brand-600 hover:text-brand-500">Terms of Service</a> and{" "}
                    <a href="#" className="text-brand-600 hover:text-brand-500">Privacy Policy</a>
                  </Label>
                </div>
                {registerForm.formState.errors.terms && (
                  <p className="text-sm text-red-600">{registerForm.formState.errors.terms.message}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-700"
                  disabled={registerMutation.isPending}
                  data-testid="button-register"
                >
                  {registerMutation.isPending ? "Creating account..." : "Create account"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  data-testid="link-login"
                  className="text-sm text-brand-600 hover:text-brand-500"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Hero */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:bg-gradient-to-br lg:from-brand-600 lg:to-brand-700 lg:px-12">
        <div className="text-white">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-4">Secure File Storage</h2>
            <p className="text-xl text-brand-100 mb-8">
              Store all your files safely in the cloud with enterprise-grade security
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-300" />
              </div>
              <div>
                <h3 className="font-medium">End-to-End Encryption</h3>
                <p className="text-brand-100 text-sm">Your files are encrypted and secure</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-300" />
              </div>
              <div>
                <h3 className="font-medium">Unlimited File Types</h3>
                <p className="text-brand-100 text-sm">Store images, videos, documents, and more</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-300" />
              </div>
              <div>
                <h3 className="font-medium">Access Anywhere</h3>
                <p className="text-brand-100 text-sm">Sync across all your devices</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
