import React from 'react'
import { useNavigate } from 'react-router';
import { logoutUser } from '~/appwrite/auth';
import { TripCard } from '../../../components';
import { allTrips } from '~/constants';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

const pageLayout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
           await logoutUser() 
           navigate("/sign-in")
    }
  return (
    <div className='mt-5'>
        <div className='flex justify-end'>
            <button
                onClick={() => handleLogout()}
                className='flex cursor-pointer gap-2 mb-5'
            >
                <img 
                    src="/assets/icons/logout.svg"
                    alt="logout"
                    className='size-6'
                    referrerPolicy='no-referrer'
                />
                <span className='p-16-semibold mr-10'>Logout</span>
            </button>
        </div>

        <ButtonComponent 
            type="button" 
            className="mx-auto button-class !h-11 !w-[200px] md:w-[240px] mb-7 "
            onClick={() => {navigate('/dashboard')}}
        >
                <img src="/assets/icons/users.svg" alt="users" className='size-5' />
                <span className="p-16-semibold text-white">Go to Dashboard</span>
        </ButtonComponent>
    
        <div>
            {allTrips.map(({id,name, imageUrls,itinerary,travelStyle,estimatedPrice}) => (
                <TripCard 
                    key={id} 
                    id={id.toString()} 
                    name={name} 
                    location={itinerary?.[0].location ?? []}
                    imageUrl={imageUrls[0]}
                    tags={[ travelStyle]}
                    price={estimatedPrice}
                />
            ))}
        </div>
    </div>
  )
}

export default pageLayout