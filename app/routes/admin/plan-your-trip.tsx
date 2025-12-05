import React from 'react'
import { useNavigate, type LoaderFunctionArgs } from 'react-router';
import { logoutUser } from '~/appwrite/auth';
import { Header, TripCard } from '../../../components';
import { getAllTrips } from '~/appwrite/trips';
import { parseTripData } from '~/lib/utils';
import type { Route } from './+types/trips';


export const loader = async ({request}: LoaderFunctionArgs) => {

  const limit = 8;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10)
  const offset = (page - 1) * limit;


  const {allTrips, total} = await getAllTrips(limit, offset);

    return {
        trips: allTrips.map(({$id, tripDetails, imageUrls}) => ({
            id: $id,
            ...parseTripData(tripDetails),
            imageUrls: imageUrls ?? []
        })),
        total
    }
   
}

const planYourTrip = ({loaderData}: Route.ComponentProps) => {

    const navigate = useNavigate();
    const trips = loaderData.trips as Trip[] | [];

    const handleLogout = async () => {
           await logoutUser() 
           navigate("/sign-in")
    }

  return (
    <div className=''>
        <header className='relative'>
            <div className='flex justify-end'>
                <button onClick={handleLogout} className='flex gap-2'>
                    <img 
                        src="/assets/icons/logout.svg"
                        alt="logout"
                        className='size-6'
                        referrerPolicy='no-referrer'
                    />
                    <span className='p-16-semibold mr-10'>Logout</span>
                </button>
            </div>
            <img 
                src={"/public/assets/images/plan-your-trip-travel.webp"}
                alt="plan your trip"
                className={"relative h-[500px] w-full object-cover"}
            />
            <div className="absolute inset-0 ml-20 mt-26">
                <h1 className='text-bold text-4xl font-semibold bg-white/30 w-[260px] p-2 rounded-2xl'>Plan Your<br/> Trip With Ease</h1>
                <p className='font-semibold text-white mt-5 bg-black/50 p-3 w-[360px] rounded-2xl'>Customize your travel itenerary in minutes- <br/> pick your
                    destination,set your preferences, and explorer with confidence.
                </p>
                <button onClick={() =>navigate("/dashboard")} className='bg-blue-400 p-2 rounded-2xl text-white mt-5 text-[18px] text-semibold'>Get Started</button>
            </div>
        </header>
        <section>
            <div className="ml-20 mt-10">
                <h1 className='text-bold text-2xl font-semibold'>Featured Travel Destinations</h1>
                <p className='font-semibold text-gray-500 mt-4'>Check out some of the best places you can visit around the world</p>
            </div>
        </section>

        <section>
            <main className='all-users wrapper'>
                <section>
                    <div className='trip-grid mt-10'>
                        {trips.map(({id,name, imageUrls,itinerary,interests,travelStyle,estimatedPrice}) => (
                            <TripCard 
                                key={id} 
                                id={id} 
                                name={name} 
                                location={itinerary?.[0].location ?? []}
                                imageUrl={imageUrls[0]}
                                tags={[interests, travelStyle]}
                                price={estimatedPrice}
                            />
                        ))}
                    </div>
                
                </section>
                </main>
        </section>
    </div>
  )
}

export default planYourTrip;