import React, { useState } from "react";
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
import axios from "@/api/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SetUpPage = () => {
  const [userSignedUp, setUserSignedUp] = useState(false);
  const navigate = useNavigate();

  const SignUpContent = () => {
    const [userData, setUserData] = useState({
      name: "",
      email: "",
      password: "",
      company: "",
    });

    const handleChange = (e) => {
      setUserData({ ...userData, [e.target.id]: e.target.value });
    };

    const handleEmailSignup = async (e) => {
      e.preventDefault();

      const promise = axios.post(`/user/signup`, userData);

      toast.promise(promise, {
        loading: "please wait...",
        success: (response) => {
          setUserSignedUp(true);
          sessionStorage.setItem("user", JSON.stringify(response.data.user));
          sessionStorage.setItem("token", response.data.token);
          navigate("/dashboard");
          return response.data?.message;
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
            <div className="w-full lg:min-w-[50%] lg:w-1/2 bg-secondary/10 flex flex-col justify-center items-center p-12">
              <div className="max-w-md text-center">
                <div className="mb-8 flex justify-center">
                  <img
                    src="https://img.freepik.com/free-vector/sign-up-concept-illustration_114360-7875.jpg?t=st=1732896511~exp=1732900111~hmac=4920b386c5e5d0484ebd9bf1971f36437eb1104015fd297f6f6288d569eafb08&w=826"
                    alt="Status Page Illustration"
                    width={500}
                    height={300}
                    className="object-contain"
                  />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-foreground">
                  Let's Get Started
                </h2>

                <p className="text-muted-foreground text-center">
                  Sign up to create your organization's
                </p>
              </div>
            </div>

            <div className="w-full flex items-center justify-center p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-center">
                    Create Your Account
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <form onSubmit={handleEmailSignup} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          type="name"
                          value={userData.name}
                          onChange={handleChange}
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={userData.password}
                          onChange={handleChange}
                          placeholder="Create a password"
                        />
                      </div>

                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Select
                          value={userData.company}
                          onValueChange={(value) =>
                            setUserData((prevData) => ({
                              ...prevData,
                              company: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a company type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asa">ASA</SelectItem>
                            <SelectItem value="papl">PAPL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button type="submit" className="w-full">
                        Sign Up with Email
                      </Button>
                      <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-muted-foreground/30"></div>
                        <span className="mx-4 text-muted-foreground text-sm">
                          or
                        </span>
                        <div className="flex-grow border-t border-muted-foreground/30"></div>
                      </div>
                      <p className="text-center text-sm text-muted-foreground mt-2">
                        Already have an account?{" "}
                        <button
                          type="button"
                          className="text-primary underline"
                          onClick={() => navigate("/")}
                        >
                          Sign In
                        </button>
                      </p>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return <SignUpContent />;
};

export default SetUpPage;
