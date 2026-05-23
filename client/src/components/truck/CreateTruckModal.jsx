import { useState } from 'react';
import api from '../../api/axios';

const CreateTruckModal = ({ onClose, refresh }) => {
  const [truckNumber, setTruckNumber] = useState('');
  const [routeName, setRouteName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post('/trucks', {
        truckNumber,
        routeName,
      });

      refresh();

      onClose();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          'Failed to create truck'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleCreate}
        className="bg-zinc-900 rounded-3xl p-6 w-full max-w-md border border-zinc-800"
      >
        <h2 className="text-3xl font-bold text-orange-500 mb-6">
          Create Truck
        </h2>

        <input
          type="text"
          placeholder="Truck Number"
          value={truckNumber}
          onChange={(e) =>
            setTruckNumber(e.target.value)
          }
          className="w-full bg-zinc-800 p-4 rounded-xl mb-4 text-white"
          required
        />

        <input
          type="text"
          placeholder="Route Name"
          value={routeName}
          onChange={(e) =>
            setRouteName(e.target.value)
          }
          className="w-full bg-zinc-800 p-4 rounded-xl mb-6 text-white"
          required
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-4 rounded-xl font-bold"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 py-4 rounded-xl font-bold"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTruckModal;