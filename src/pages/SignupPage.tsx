
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Layout from '../components/Layout';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from '@/components/ui/sonner';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useAppContext();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setOtpSent(true);
      setIsSubmitting(false);
      toast.success('OTP sent to your email address');
    }, 1500);
  };
  
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.otp) {
      toast.error('Please enter the OTP');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create a new user object
      const newUser = {
        id: `user-${Date.now()}`,
        username: formData.username,
        email: formData.email,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        isAdmin: false
      };
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: newUser });
      toast.success('Account created successfully!');
      navigate('/');
      
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <div className="text-center mb-6">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsHPUdeeW67M7jsF1y4JxssrQB4ab90-VRfA&s" 
                alt="Arul Jayam Machinery" 
                className="h-16 w-auto mx-auto mb-2" 
              />
              <h1 className="text-2xl font-bold text-agri-dark">Create Your Account</h1>
              <p className="text-gray-600 mt-1">Join ARUL JAYAM MACHINERY</p>
            </div>
            
            {!otpSent ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-agri-primary hover:bg-agri-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Sign Up'}
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify Email & Create Account'}
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
                Already have an account?{' '}
                <Link to="/login" className="text-agri-primary hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignupPage;
