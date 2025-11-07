import React from 'react'
import { Outlet, redirect } from 'react-router'
import {SidebarComponent} from '@syncfusion/ej2-react-navigations'
import NavItems from '../../../components/NavItems'
import MobileSidebar from '../../../components/MobileSidebar'
import { account } from '~/appwrite/client'
import { getExistingUser, storageUserData } from '~/appwrite/auth'

type UserDoc = {
  $id: string;
  accountId: string;
  email: string;
  name: string;
  status?: string;
  createdAt: string;
};

export async function clientLoader() {
  try {
    const user = await account.get();
    if (!user || !user.$id) return redirect('/sign-in');

    const existingUser = await getExistingUser() as UserDoc;

    if (existingUser?.$id) {
      return existingUser;
    } else {
      return await storageUserData();
    }
  } catch (e) {
    console.log("error in clientLoader", e);
    return redirect("/sign-in");
  }
}



function AdminLayout() {
  return (
    <div className="admin-layout">
        <MobileSidebar />
        <aside className="w-full max-w-[270px] hidden lg:block">
            <SidebarComponent width={270} enableGestures={false}>
                <NavItems />
            </SidebarComponent>
        </aside>
        <aside className="children">
            <Outlet />
        </aside>
    </div>
  )
}

export default AdminLayout