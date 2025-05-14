
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '@/hooks/use-auth';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, Lock, MapPin, Phone, LogOut, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { state } = useAppContext();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    username: state.user?.username || '',
    address: state.user?.address || '',
    phoneNumber: state.user?.phoneNumber || '',
  });
  
  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/login');
    }
  }, [state.isAuthenticated, navigate]);
  
  useEffect(() => {
    if (state.user) {
      setProfileData({
        username: state.user.username || '',
        address: state.user.address || '',
        phoneNumber: state.user.phoneNumber || ''
      });
    }
  }, [state.user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveProfile = async () => {
    if (!state.user?.id) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profileData.username,
          address: profileData.address,
          phone_number: profileData.phoneNumber
        })
        .eq('id', state.user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated!",
        description: "Your profile information has been saved successfully."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile."
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!state.user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-agri-primary" />
            <p className="ml-2">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left panel - User info */}
            <div className="w-full md:w-1/3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-agri-light rounded-full p-6 mb-4">
                      <User size={48} className="text-agri-primary" />
                    </div>
                    <h2 className="text-xl font-bold">{state.user.username}</h2>
                    <p className="text-gray-600 text-sm">{state.user.email}</p>
                    
                    {state.user.isAdmin && (
                      <Badge variant="outline" className="mt-2 border-green-500 text-green-700">
                        Admin User
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Sign Out
                  </Button>
                  
                  {state.user.isAdmin && (
                    <Button 
                      variant="outline"
                      className="w-full border-agri-primary text-agri-primary hover:bg-agri-light"
                      onClick={() => navigate('/admin')}
                    >
                      Go to Admin Panel
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Right panel - Profile form */}
            <div className="w-full md:w-2/3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-gray-500" />
                        <Label htmlFor="username">Username</Label>
                      </div>
                      <Input
                        id="username"
                        name="username"
                        value={profileData.username}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                        <Label htmlFor="address">Address</Label>
                      </div>
                      <Textarea
                        id="address"
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        placeholder="Enter your address"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-gray-500" />
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                      </div>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isSaving}
                      className="bg-agri-primary hover:bg-agri-dark"
                    >
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
