import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { useLoginUser, useRegisterUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Lock, Mail, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
});

export default function Login() {
  const [_, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", username: "", password: "" },
  });

  const onLogin = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.token, res.user);
        setLocation("/");
      },
      onError: (err: any) => {
        toast({
          title: "AUTHENTICATION FAILED",
          description: err.response?.data?.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    });
  };

  const onRegister = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.token, res.user);
        setLocation("/");
      },
      onError: (err: any) => {
        toast({
          title: "REGISTRATION FAILED",
          description: err.response?.data?.message || "Could not create account",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardHeader className="space-y-1 pb-6 border-b border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <CardTitle className="font-mono text-xl">PROOFSTORE TERMINAL</CardTitle>
            </div>
            <CardDescription className="font-mono text-xs">
              SECURE ACCESS REQUIRED
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="font-mono text-xs">AUTHENTICATE</TabsTrigger>
                <TabsTrigger value="register" className="font-mono text-xs">INITIALIZE</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-mono text-xs">IDENTIFIER (EMAIL)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        className="pl-9 font-mono text-sm" 
                        placeholder="operator@domain.com"
                        {...loginForm.register("email")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-mono text-xs">PASSPHRASE</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type="password"
                        className="pl-9 font-mono text-sm tracking-widest" 
                        {...loginForm.register("password")}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full font-mono font-bold tracking-widest mt-6"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "VERIFYING..." : "ACCESS"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="font-mono text-xs">IDENTIFIER (EMAIL)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="reg-email" 
                        className="pl-9 font-mono text-sm" 
                        placeholder="operator@domain.com"
                        {...registerForm.register("email")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-username" className="font-mono text-xs">CALLSIGN (USERNAME)</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="reg-username" 
                        className="pl-9 font-mono text-sm" 
                        placeholder="OPERATOR_1"
                        {...registerForm.register("username")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="font-mono text-xs">PASSPHRASE (MIN 8)</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="reg-password" 
                        type="password"
                        className="pl-9 font-mono text-sm tracking-widest" 
                        {...registerForm.register("password")}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full font-mono font-bold tracking-widest mt-6"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "GENERATING..." : "INITIALIZE PROTOCOL"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="hidden lg:flex flex-col justify-between p-12 bg-secondary/30 border-l border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(var(--primary)_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold font-mono text-primary mb-4">DECENTRALIZED ANCHOR</h2>
          <p className="text-muted-foreground max-w-md font-mono text-sm leading-relaxed">
            Cryptographic file certification via Sui blockchain. Immutable, timestamped, verifiable.
            Your files are hashed client-side. The source bytes never touch our servers unencrypted.
          </p>
        </div>
        
        <div className="relative z-10 font-mono text-xs text-muted-foreground/50 space-y-1">
          <p>SYS.STATUS: ONLINE</p>
          <p>NET.RPC: MAINNET_BETA</p>
          <p>NODE.SYNC: CONFIRMED</p>
        </div>
      </div>
    </div>
  );
}
