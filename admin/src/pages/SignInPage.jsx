import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import axios from "@/api/axios";
import { toast } from "sonner";

const SignInPage = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.id]: e.target.value });
  };

  const handleSignIn = async () => {
    const promise = axios.post(`/organization/user/login`, {
      userEmail: loginData.email,
      password: loginData.password,
    });

    toast.promise(promise, {
      loading: "Checking user credentials...",
      success: (response) => {
        const hasOrganization = response.data?.isMember;
        if (hasOrganization) {
          sessionStorage.setItem("user", JSON.stringify(response.data.user));
          sessionStorage.setItem(
            "organization",
            JSON.stringify(response.data.organization)
          );
          sessionStorage.setItem("token", response.data.token);
          navigate("/dashboard");
        } else {
          return response.data?.message;
        }
        return "Sign in successful!";
      },
      error: (error) => {
        return (
          error.response?.data?.message || error.message || "Sign in failed"
        );
      },
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center m-auto py-10">
      <div className="flex flex-col items-center justify-center max-w-7xl h-full">
        <div className="flex flex-col lg:flex-row justify-between">
          <div className="w-full lg:w-1/2 bg-secondary/10 flex flex-col justify-center items-center p-12">
            <div className="max-w-md text-center">
              <div className="mb-8 flex justify-center">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/006/912/004/non_2x/secure-login-and-sign-up-concept-illustration-vector.jpg"
                  alt="Status Page Illustration"
                  width={300}
                  height={300}
                />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                Welcome Back!
              </h2>

              <p className="text-muted-foreground text-center">
                Manage your organization's effortlessly.
              </p>
            </div>
          </div>

          <div className="w-full flex justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-center">Sign In</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      value={loginData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      value={loginData.password}
                      onChange={handleChange}
                    />
                  </div>

                  {/* <div className="text-right">
                    <Button variant="link" size="sm" className="text-sm">
                      Forgot Password?
                    </Button>
                  </div> */}

                  <Button
                    type="submit"
                    className="w-full"
                    onClick={handleSignIn}
                  >
                    Sign In
                  </Button>

                  <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-muted-foreground/30"></div>
                    <span className="mx-4 text-muted-foreground text-sm">
                      or
                    </span>
                    <div className="flex-grow border-t border-muted-foreground/30"></div>
                  </div>
                  <div className="text-center mt-4">
                    <span className="text-muted-foreground text-sm">
                      Don't have an account?{" "}
                      <Button
                        variant="link"
                        size="sm"
                        className="text-primary"
                        onClick={() => navigate("/signup")}
                      >
                        Sign Up
                      </Button>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
