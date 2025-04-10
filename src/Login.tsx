import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PacmanLoader } from 'react-spinners';
import axios from 'axios';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';

interface UserProfile {
  name: string;
  email: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [name, setUserName] = useState<string>('');
  const [email, setuserEmail] = useState<string>('');
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setisLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');

  const handleLogin = useGoogleLogin({
    onSuccess: (response) => {
      setUser(response);
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setAlertMessage('Login Failed');
      setShowAlert(true);
    }
  });

  useEffect(() => {
    if (!user) return;

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`);
        setProfile(response.data);
        const { name, email } = response.data;
        sessionStorage.setItem('Name', name);
        sessionStorage.setItem('Email', email);
        setUserName(name);
        setuserEmail(email);
        setisLoading(true);

        const url = `https://exskilence-suite-be.azurewebsites.net/user/${email}/`;
        const userData = await fetch(url);
        const data = await userData.json();

        if (data.exists) {
          const userType = data.Type.toLowerCase(); 
          sessionStorage.setItem('Type', userType);

          if (userType === 'admin') {
            navigate('/courses');
            sessionStorage.setItem("Admin", "True");
          }
        } else {
          alert('User not found. Please login again.');
        }
      } catch (error) {
        setisLoading(false);
        setAlertMessage("Login Failed");
        setShowAlert(true);
        console.error('Error fetching user profile data:', error);
      }
      setisLoading(false);
    };

    fetchUserProfile();
  }, [user, navigate]);

  const logOut = () => {
    googleLogout();
    setUser(null);
    setProfile(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); 
    handleLogin(); 
  };

  return (
    <div className="login vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #a2d9ff, #e9b9ff)', overflow: 'hidden' }}>
      <div className="background-shape" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="pt-0" viewBox="0 0 1440 320" style={{ width: '100%', height: '100%' }}>
          <path fill="#a2d9ff" fillOpacity="0.5" d="M0,288L20,240C40,192,80,96,120,64C160,32,200,64,240,69.3C280,75,320,53,360,74.7C400,96,440,160,480,154.7C520,149,560,75,600,48C640,21,680,43,720,48C760,53,800,43,840,53.3C880,64,920,96,960,133.3C1000,171,1040,213,1080,202.7C1120,192,1160,128,1200,106.7C1240,85,1280,107,1320,149.3C1360,192,1400,256,1420,288L1440,320L1440,0L1420,0C1400,0,1360,0,1320,0C1280,0,1240,0,1200,0C1160,0,1120,0,1080,0C1040,0,1000,0,960,0C920,0,880,0,840,0C800,0,760,0,720,0C680,0,640,0,600,0C560,0,520,0,480,0C440,0,400,0,360,0C320,0,280,0,240,0,200,0,160,0,120,0,80,0,40,0,20,0L0,0Z"></path>
        </svg>
      </div>
      <div className="container d-flex align-items-center justify-content-center">
        <div className="w-100" style={{ maxWidth: '400px' }}>
          <div className="card shadow-lg rounded-lg p-4" style={{ background: 'white' }}>
            <div className="card-body">
              <h2 className="text-center mb-5 pb-3 border-bottom border-gray-300" style={{ fontSize: '2rem', fontWeight: 'bold' }}>Login or Signup</h2>
              <p className="text-center mb-4" style={{ fontSize: '1rem' }}>Let's get started</p>

              <div className="text-center">
                {loading ? (
                  <div className="d-flex justify-content-center text-center align-items-center">
                    Signing in...
                  </div>
                ) : (
                  <button
                    onClick={handleClick}
                    className="btn btn-primary px-4 py-2 rounded-pill"
                    style={{ backgroundColor: '#007bff', border: 'none', color: 'white', transition: 'background-color 0.3s' }}
                  >
                    Sign in with Google
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
