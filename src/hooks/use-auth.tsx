
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useAppContext } from '@/context/AppContext';
import { toast } from '@/hooks/use-toast';

// Define the auth context type
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { dispatch } = useAppContext();
  
  // Store OTPs (in a real app, this would be stored securely in the backend)
  const [otps, setOtps] = useState<Record<string, string>>({});

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (data) {
              dispatch({ 
                type: 'LOGIN_SUCCESS', 
                payload: {
                  id: session.user.id,
                  username: data.username,
                  email: session.user.email || '',
                  address: data.address || '',
                  phoneNumber: data.phone_number || '',
                  profilePicture: data.profile_picture || '',
                  isAdmin: data.is_admin || false
                }
              });
            }
          }, 0);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (data) {
            dispatch({ 
              type: 'LOGIN_SUCCESS', 
              payload: {
                id: session.user.id,
                username: data.username,
                email: session.user.email || '',
                address: data.address || '',
                phoneNumber: data.phone_number || '',
                profilePicture: data.profile_picture || '',
                isAdmin: data.is_admin || false
              }
            });
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  // Generate a random 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Sign up function with metadata
  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData.username,
            address: userData.address,
            phoneNumber: userData.phoneNumber
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message
      });
    }
  };

  // Send OTP function (simulated email sending)
  const sendOTP = async (email: string) => {
    try {
      // For a real app, this would be sent via a secure backend service
      const otp = generateOTP();
      
      // In a real implementation, this would be a call to your Edge Function
      // For now, we'll just store it in state (not secure for production)
      setOtps(prev => ({ ...prev, [email]: otp }));
      
      // Simulate email sending (in real app, use Supabase Edge Function)
      console.log(`OTP for ${email}: ${otp}`);
      
      toast({
        title: "OTP sent!",
        description: `A verification code has been sent to ${email}`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: error.message
      });
    }
  };

  // Verify OTP function
  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      // In a real app, verify via backend
      const storedOTP = otps[email];
      
      if (!storedOTP) {
        toast({
          variant: "destructive",
          title: "OTP Expired",
          description: "Please request a new OTP"
        });
        return false;
      }
      
      if (storedOTP !== otp) {
        toast({
          variant: "destructive",
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect"
        });
        return false;
      }
      
      // Clear the OTP after successful verification
      setOtps(prev => {
        const newOtps = { ...prev };
        delete newOtps[email];
        return newOtps;
      });
      
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message
      });
      return false;
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Login successful!",
        description: "Welcome back!"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message
      });
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      dispatch({ type: 'LOGOUT' });
      toast({
        title: "Logged out successfully"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message
      });
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    sendOTP,
    verifyOTP,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
