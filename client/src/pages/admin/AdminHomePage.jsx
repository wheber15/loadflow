import {
  Link,
} from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

import TopBar from '../../components/layout/TopBar';

const cards = [
  {
    title: 'Floor Control',
    path: '/floor',
    roles: [
      'SUPERVISOR',
      'MANAGER',
      'ADMIN',
    ],

    description:
      'Manage warehouse floor operations and pallet positions.',
  },

  {
    title: 'Picker Mode',
    path: '/picker',
    roles: [
      'PICKER',
      'ADMIN',
    ],

    description:
      'Scan pallets and manage active picking sessions.',
  },

  {
    title: 'Dashboard',
    path: '/dashboard',
    roles: [
      'MANAGER',
      'ADMIN',
    ],

    description:
      'View warehouse analytics and operational KPIs.',
  },

  {
    title: 'Truck Management',
    path: '/',
    roles: [
      'SUPERVISOR',
      'MANAGER',
      'ADMIN',
    ],

    description:
      'Manage active loads and dispatch operations.',
  },

  {
    title: 'User Management',
    path: '/admin/users',
    roles: ['ADMIN'],

    description:
      'Create and manage warehouse user accounts.',
  },
];

const AdminHomePage = () => {
  const { user } =
    useAuth();

  const allowedCards =
    cards.filter((card) =>
      card.roles.includes(
        user.role
      )
    );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* TOPBAR */}

      <TopBar />

      {/* HEADER */}

      <div className="mb-10">
        <h1 className="text-5xl font-black text-orange-500">
          LOADFLOW CONTROL
        </h1>

        <p className="text-zinc-500 mt-2 text-xl">
          Warehouse Execution
          Platform
        </p>
      </div>

      {/* USER */}

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <p className="text-zinc-500 font-bold">
              Logged in as
            </p>

            <h2 className="text-4xl font-black mt-2">
              {user.name}
            </h2>

            <div className="inline-flex mt-4 bg-orange-500 text-black px-5 py-2 rounded-2xl font-black">
              {user.role}
            </div>
          </div>

          {/* STATUS */}

          <div className="bg-zinc-900 rounded-3xl p-5 min-w-[260px]">
            <p className="text-zinc-500 font-bold">
              System Status
            </p>

            <div className="flex items-center gap-3 mt-4">
              <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>

              <p className="font-black text-xl">
                ONLINE
              </p>
            </div>

            <p className="text-zinc-500 mt-3 text-sm">
              Warehouse system
              operational
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {allowedCards.map(
          (card) => (
            <Link
              key={card.title}
              to={card.path}
              className="bg-zinc-950 border border-zinc-800 hover:border-orange-500 hover:-translate-y-1 transition-all rounded-3xl p-8"
            >
              <h2 className="text-3xl font-black">
                {card.title}
              </h2>

              <p className="text-zinc-500 mt-4 leading-relaxed">
                {
                  card.description
                }
              </p>

              <div className="mt-6 inline-flex bg-orange-500 text-black px-4 py-2 rounded-2xl font-black">
                OPEN MODULE
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  );
};

export default AdminHomePage;