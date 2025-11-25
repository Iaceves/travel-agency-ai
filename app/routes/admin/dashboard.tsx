import React from 'react'
import { Header, StatsCard, TripCard } from '../../../components'
import type { Route } from './+types/dashboard';
import { getAllUsers, getUser } from '~/appwrite/auth';
import { getTripsByTravelStyle, getUserGrowthPerDay, getUsersAndTripsStats } from '~/appwrite/dashboard';
import { getAllTrips } from '~/appwrite/trips';
import { parseTripData } from '~/lib/utils';
import { Category, ChartComponent, ColumnSeries, DataLabel, Inject, Legend, SeriesCollectionDirective, SeriesDirective, SplineAreaSeries, Tooltip } from '@syncfusion/ej2-react-charts';
import { tripXAxis, tripyAxis, userXAxis, useryAxis } from '~/constants';




export const clientLoader = async () => {
    const [
        user, 
        dashboardStats,
        trips,
        userGrowth,
        tripsByTravelStyle,
        allUsers,
    
    ] = await Promise.all([
         getUser('userId'),
         getUsersAndTripsStats(),
         getAllTrips(4,0),
         getUserGrowthPerDay(),
         getTripsByTravelStyle(),
         getAllUsers(4,0)
    ])

    const allTrips = trips.allTrips.map(({$id, tripDetails, imageUrls}) => ({
        id: $id,
        ...(tripDetails ? parseTripData(tripDetails) : {}),
        imageUrls: imageUrls ?? [],
    }))

    

    const mappedUsers: UsersItineraryCount[] = allUsers.users.map((user) => ({
        imageUrl: user.imageUrl,
        name: user.name,
        count: user.itineraryCount,
        createdAt: user.$createdAt
    }))
    
    return {
        user, dashboardStats, allTrips,
        userGrowth, tripsByTravelStyle, allUsers: mappedUsers
    }
}

const dashboard = ({loaderData}: Route.ComponentProps) => {

    const user = loaderData.user as User | null;
    const {dashboardStats, allTrips, allUsers, userGrowth, tripsByTravelStyle} = loaderData;

  return (
    <main className='dashboard wrapper'>
        <Header
            title={`Welcome ${user?.name ?? "Guess" } 👋 `}
            description="Track activity, trends and popular destinations in real time"
        />
        <section className='flex flex-col gap-6'> 
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <StatsCard
                    headerTitle="Total Users"
                    total={dashboardStats.totalUsers}
                    currentMonthCount={dashboardStats.usersJoined.currentMonth}
                    lastMonthCount={dashboardStats.usersJoined.lastMonth}
                />
                <StatsCard
                    headerTitle="Total Trips"
                    total={dashboardStats.totalTrips}
                    currentMonthCount={dashboardStats.tripsCreated.currentMonth}
                    lastMonthCount={dashboardStats.tripsCreated.lastMonth}
                />
                <StatsCard
                    headerTitle="Active Users"
                    total={dashboardStats.userRole.total}
                    currentMonthCount={dashboardStats.usersJoined.currentMonth}
                    lastMonthCount={dashboardStats.usersJoined.lastMonth}
                />
            </div>
        </section>
        <section className='container'>
            <h1 className='text-xl font-semibold text-dark-100'>
                Created Trips
            </h1>
            <div className='trip-grid'>
                {allTrips.map((trip) => (
                    <TripCard 
                        key={trip.id}
                        id={trip.id.toString()}
                        name={trip.name!}
                        imageUrl={trip.imageUrls[0]}
                        location={trip.itinerary?.[0]?.location ?? ""}
                        tags={[trip.interests!, trip.travelStyle!]}
                        price={trip.estimatedPrice!}
                    />
                ))}
            </div>
        </section>

        <section className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
            <ChartComponent 
                id="chart-1"
                primaryXAxis={userXAxis}
                primaryYAxis={useryAxis}
                title="User Growth"
                tooltip={{enable: true}}
            >
                <SeriesCollectionDirective>
                    <SeriesDirective 
                        dataSource={userGrowth}
                        xName='day'
                        yName='count'
                        type='Column'
                        name="Column"
                        columnWidth={0.3}
                        cornerRadius={{topLeft: 10, topRight: 10}}
                    />
                    <SeriesDirective 
                        dataSource={userGrowth}
                        xName='day'
                        yName='count'
                        type='SplineArea'
                        name="Wave"
                        fill='rgba(71, 132,238, 0.3)'
                        border={{width: 2, color:'#4784EE'}}
                    />
                </SeriesCollectionDirective>
                <Inject services={[ColumnSeries, SplineAreaSeries, 
                    Category, DataLabel, Tooltip, Legend]} />
            </ChartComponent>

            <ChartComponent 
                id="chart-2"
                primaryXAxis={tripXAxis}
                primaryYAxis={tripyAxis}
                title="Trip Trends"
                tooltip={{enable: true}}
            >
                <SeriesCollectionDirective>
                    <SeriesDirective 
                        dataSource={tripsByTravelStyle}
                        xName='travelStyle'
                        yName='count'
                        type='Column'
                        name="Column"
                        columnWidth={0.3}
                        cornerRadius={{topLeft: 10, topRight: 10}}
                    />
                    
                </SeriesCollectionDirective>
                <Inject services={[ColumnSeries, SplineAreaSeries, 
                    Category, DataLabel, Tooltip, Legend]} />
            </ChartComponent>
        </section>

        <section className='user-trip wrapper'>

        </section>
    </main>
  )
}

export default dashboard