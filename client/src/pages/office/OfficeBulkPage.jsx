import {
  useEffect,
  useState,
} from 'react';

import api from '../../api/axios';

import TopBar from '../../components/layout/TopBar';

import { useAuth } from '../../context/AuthContext';

const OfficeBulkPage = () => {
  const {
    user,
    updateActivity,
  } = useAuth();

  /* =========================
     FORM
  ========================= */

  const [
    deliveryNumber,
    setDeliveryNumber,
  ] = useState('');

  const [
    customerName,
    setCustomerName,
  ] = useState('');

  const [
    bulkQuantity,
    setBulkQuantity,
  ] = useState(1);

  const [
    bulkType,
    setBulkType,
  ] = useState('SINGLE');

  const [
    notes,
    setNotes,
  ] = useState('');

  /* =========================
     UI
  ========================= */

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    bulkOrders,
    setBulkOrders,
  ] = useState([]);

  /* =========================
     ACTIVITY
  ========================= */

  useEffect(() => {
    updateActivity(
      'OFFICE_BULK'
    );
  }, []);

  /* =========================
     FETCH ORDERS
  ========================= */

  const fetchBulkOrders =
    async () => {
      try {
        const { data } =
          await api.get(
            '/bulk-orders'
          );

        setBulkOrders(data);
      } catch (error) {
        console.log(error);
      }
    };

  useEffect(() => {
    fetchBulkOrders();

    const interval =
      setInterval(() => {
        fetchBulkOrders();
      }, 5000);

    return () =>
      clearInterval(
        interval
      );
  }, []);

  /* =========================
     CREATE BULK
  ========================= */

  const handleCreate =
    async () => {
      try {
        if (
          !deliveryNumber ||
          !customerName
        ) {
          return alert(
            'Complete all required fields'
          );
        }

        setLoading(true);

        await api.post(
          '/bulk-orders',
          {
            deliveryNumber,

            customerName,

            bulkQuantity,

            bulkType,

            notes,

            createdBy:
              user.name,
          }
        );

        /* RESET */

        setDeliveryNumber('');

        setCustomerName('');

        setBulkQuantity(1);

        setBulkType(
          'SINGLE'
        );

        setNotes('');

        await fetchBulkOrders();

        alert(
          'Bulk order created'
        );
      } catch (error) {
        console.log(error);

        alert(
          error.response?.data
            ?.message ||
            'Failed to create bulk order'
        );
      } finally {
        setLoading(false);
      }
    };

  /* =========================
     STATUS COLORS
  ========================= */

  const getStatusColor =
    (status) => {
      switch (status) {
        case 'WAITING':
          return 'bg-yellow-500 text-black';

        case 'ACTIVE':
          return 'bg-orange-500 text-black';

        case 'READY':
          return 'bg-green-500 text-black';

        case 'ASSIGNED':
          return 'bg-blue-500 text-white';

        case 'COMPLETE':
          return 'bg-cyan-500 text-black';

        default:
          return 'bg-zinc-700 text-white';
      }
    };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* TOPBAR */}

      <TopBar />

      {/* HEADER */}

      <div className="mb-10">
        <h1 className="text-5xl font-black text-orange-500">
          OFFICE BULK CONTROL
        </h1>

        <p className="text-zinc-500 mt-2 text-xl">
          Warehouse preload
          staging system
        </p>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        {/* LEFT */}

        <div className="xl:col-span-1 bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
          <h2 className="text-3xl font-black mb-6">
            Add Bulk Delivery
          </h2>

          {/* DELIVERY */}

          <div className="mb-5">
            <label className="block mb-2 font-bold text-zinc-400">
              Delivery Number
            </label>

            <input
              type="text"
              value={
                deliveryNumber
              }
              onChange={(e) =>
                setDeliveryNumber(
                  e.target.value
                )
              }
              placeholder="9107189158"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-xl outline-none"
            />
          </div>

          {/* CUSTOMER */}

          <div className="mb-5">
            <label className="block mb-2 font-bold text-zinc-400">
              Customer Name
            </label>

            <input
              type="text"
              value={
                customerName
              }
              onChange={(e) =>
                setCustomerName(
                  e.target.value
                )
              }
              placeholder="Customer..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-xl outline-none"
            />
          </div>

          {/* QUANTITY */}

          <div className="mb-5">
            <label className="block mb-2 font-bold text-zinc-400">
              Bulk Quantity
            </label>

            <input
              type="number"
              min="1"
              value={
                bulkQuantity
              }
              onChange={(e) =>
                setBulkQuantity(
                  Number(
                    e.target.value
                  )
                )
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-xl outline-none"
            />
          </div>

          {/* TYPE */}

          <div className="mb-5">
            <label className="block mb-2 font-bold text-zinc-400">
              Bulk Type
            </label>

            <select
              value={bulkType}
              onChange={(e) =>
                setBulkType(
                  e.target.value
                )
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-xl outline-none"
            >
              <option value="SINGLE">
                SINGLE
              </option>

              <option value="WITH_PICKING">
                WITH PICKING
              </option>
            </select>
          </div>

          {/* NOTES */}

          <div className="mb-6">
            <label className="block mb-2 font-bold text-zinc-400">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Optional notes..."
              rows="4"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-lg outline-none resize-none"
            />
          </div>

          {/* BUTTON */}

          <button
            onClick={
              handleCreate
            }
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 h-16 rounded-2xl text-xl font-black"
          >
            {loading
              ? 'CREATING...'
              : 'CREATE BULK ORDER'}
          </button>
        </div>

        {/* RIGHT */}

        <div className="xl:col-span-2 bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black">
              Active Bulk Orders
            </h2>

            <div className="bg-orange-500 text-black px-5 py-2 rounded-2xl font-black">
              {
                bulkOrders.length
              }{' '}
              ORDERS
            </div>
          </div>

          <div className="space-y-4 max-h-[850px] overflow-y-auto">
            {bulkOrders.map(
              (order) => (
                <div
                  key={order._id}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                    {/* LEFT */}

                    <div>
                      <h2 className="text-3xl font-black">
                        {
                          order.customerName
                        }
                      </h2>

                      <p className="text-zinc-500 mt-2">
                        Delivery:{' '}
                        {
                          order.deliveryNumber
                        }
                      </p>

                      <div className="flex flex-wrap gap-3 mt-5">
                        <div className="bg-orange-500 text-black px-4 py-2 rounded-2xl font-black">
                          {
                            order.bulkQuantity
                          }{' '}
                          BULK
                        </div>

                        <div className="bg-zinc-800 px-4 py-2 rounded-2xl font-black">
                          {
                            order.bulkType
                          }
                        </div>

                        <div
                          className={`px-4 py-2 rounded-2xl font-black ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {
                            order.status
                          }
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mt-5 bg-zinc-800 rounded-2xl p-4 text-zinc-300">
                          {
                            order.notes
                          }
                        </div>
                      )}
                    </div>

                    {/* RIGHT */}

                    <div className="text-right">
                      <p className="text-zinc-500 text-sm">
                        Created By
                      </p>

                      <p className="font-black text-xl mt-1">
                        {
                          order.createdBy
                        }
                      </p>

                      <p className="text-zinc-500 text-sm mt-5">
                        Created
                      </p>

                      <p className="font-bold mt-1">
                        {new Date(
                          order.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeBulkPage;