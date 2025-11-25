import React from 'react'
import { useNavigate } from 'react-router';
import { logoutUser } from '~/appwrite/auth';

const pageLayout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
           await logoutUser() 
           navigate("/sign-in")
    }
  return (
    <div>
        <button
            onClick={() => handleLogout()}
            className='cursor-pointer'
        >
            <img 
                src="/assets/icons/logout.svg"
                alt="logout"
                className='size-6'
                referrerPolicy='no-referrer'
                />
        </button>
        <button onClick={() => {navigate('/dashboard')}}>
            Dashboard
        </button>
    </div>
  )
}

export default pageLayout