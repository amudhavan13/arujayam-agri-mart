
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/components/ui/sonner';
import { LogOut, Camera, User } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { user, isAuthenticated } = state;
  
  // Redirect if not logged in
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view your profile');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.profilePicture || '');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSaveProfile = () => {
    if (!formData.username || !formData.email || !formData.phoneNumber || !formData.address) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // Save user profile
    if (user) {
      dispatch({
        type: 'SET_USER',
        payload: {
          ...user,
          username: formData.username,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          profilePicture: avatarUrl,
        }
      });
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    }
  };
  
  const handleChangePassword = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    // In a real app, this would call an API to change password
    toast.success('Password changed successfully');
    setFormData({
      ...formData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsChangingPassword(false);
  };
  
  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
    navigate('/');
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload the file to a server
      // For demo, we'll use a fake URL
      const fakeUrl = URL.createObjectURL(file);
      setAvatarUrl(fakeUrl);
      toast.success('Profile picture updated');
    }
  };
  
  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-agri-dark mb-6">Your Profile</h1>
        
        <div className="bg-white rounded-lg shadow-md">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full justify-start border-b p-0 rounded-none">
              <TabsTrigger value="profile" className="flex-1 sm:flex-none py-3 px-6 data-[state=active]:border-b-2 data-[state=active]:border-agri-primary rounded-none">
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="flex-1 sm:flex-none py-3 px-6 data-[state=active]:border-b-2 data-[state=active]:border-agri-primary rounded-none">
                Security
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-2 border-agri-muted">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-agri-light text-agri-primary text-4xl">
                        <User />
                      </AvatarFallback>
                    </Avatar>
                    
                    {isEditing && (
                      <label 
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-agri-primary text-white p-2 rounded-full cursor-pointer"
                      >
                        <Camera size={18} />
                        <input 
                          id="avatar-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleAvatarChange}
                        />
                      </label>
                    )}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <h2 className="font-semibold text-lg">{user.username}</h2>
                    <p className="text-gray-600 text-sm">{user.email}</p>
                    {user.isAdmin && (
                      <Badge className="mt-2 bg-agri-primary">Admin</Badge>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    className="mt-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </Button>
                </div>
                
                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Profile Information</h2>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} variant="outline">
                        Edit
                      </Button>
                    ) : (
                      <div className="space-x-2">
                        <Button onClick={() => setIsEditing(false)} variant="outline">
                          Cancel
                        </Button>
                        <Button onClick={handleSaveProfile}>
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="p-6">
              <h2 className="text-lg font-semibold mb-4">Change Password</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    disabled={!isChangingPassword}
                  />
                </div>
                
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    disabled={!isChangingPassword}
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={!isChangingPassword}
                  />
                </div>
                
                <div>
                  {!isChangingPassword ? (
                    <Button onClick={() => setIsChangingPassword(true)}>
                      Change Password
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button onClick={() => setIsChangingPassword(false)} variant="outline">
                        Cancel
                      </Button>
                      <Button onClick={handleChangePassword}>
                        Save New Password
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
