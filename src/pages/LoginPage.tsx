
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Layout from '../components/Layout';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from '@/components/ui/use-toast';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, sendOTP, verifyOTP } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please enter both email and password"
      });
      return;
    }
    
    setLoading(true);
    
    // Special case for admin login - bypass OTP for demo
    const isAdminLogin = formData.email === 'admin@gmail.com' && formData.password === 'admin@123';
    
    if (isAdminLogin) {
      try {
        await signIn(formData.email, formData.password);
        navigate('/');
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message
        });
      } finally {
        setLoading(false);
      }
      return;
    }
    
    try {
      // Send OTP via email (in a real app)
      await sendOTP(formData.email);
      setOtpSent(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.otp) {
      toast({
        variant: "destructive",
        title: "OTP required",
        description: "Please enter the OTP"
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const isValid = await verifyOTP(formData.email, formData.otp);
      
      if (isValid) {
        // Proceed with login
        await signIn(formData.email, formData.password);
        navigate('/');
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Special case for admin login - bypass OTP for demo
  const isAdminLogin = formData.email === 'admin@gmail.com' && formData.password === 'admin@123';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <div className="text-center mb-6">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsHPUdeeW67M7jsF1y4JxssrQB4ab90-VRfA&s" 
                alt="Arul Jayam Machinery" 
                className="h-16 w-auto mx-auto mb-2" 
              />
              <h1 className="text-2xl font-bold text-agri-dark">Login to Your Account</h1>
              <p className="text-gray-600 mt-1">Access your orders and account details</p>
            </div>
            
            {!otpSent ? (
              <form onSubmit={handleSendOTP}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-agri-primary hover:bg-agri-dark"
                    disabled={loading}
                  >
                    {loading ? 'Sending OTP...' : isAdminLogin ? 'Login' : 'Send OTP'}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      placeholder="Enter the 6-digit code"
                      value={formData.otp}
                      onChange={handleInputChange}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      A verification code has been sent to your email address.
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-agri-primary hover:bg-agri-dark"
                    disabled={isVerifying}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify & Login'}
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="w-full text-agri-primary hover:bg-agri-light"
                    onClick={() => setOtpSent(false)}
                  >
                    Go Back
                  </Button>
                </div>
              </form>
            )}
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-agri-primary hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
