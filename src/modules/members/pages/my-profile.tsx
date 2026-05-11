import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';

const MyProfile: React.FC = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      // Redirect to the member's own profile
      navigate(`/members/profile/${userData.uid}`);
    } else {
      navigate('/login');
    }
  }, [userData, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your profile...</p>
      </div>
    </div>
  );
};

export default MyProfile;