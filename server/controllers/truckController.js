import Truck from '../models/Truck.js';

/* GET ALL TRUCKS */
export const getTrucks = async (
  req,
  res
) => {
  try {
    const trucks =
      await Truck.find().sort({
        createdAt: -1,
      });

    res.json(trucks);
  } catch (error) {
    res.status(500).json({
      message:
        'Failed to fetch trucks',
    });
  }
};

/* CREATE TRUCK */
export const createTruck = async (
  req,
  res
) => {
  try {
    const {
      truckNumber,
      routeName,
    } = req.body;

    const truck =
      await Truck.create({
        truckNumber,
        routeName,
        maxPallets: 26,
        status: 'BUILDING',
      });

    res.status(201).json(truck);
  } catch (error) {
    res.status(500).json({
      message:
        'Failed to create truck',
    });
  }
};

/* UPDATE STATUS */
export const updateTruckStatus =
  async (req, res) => {
    try {
      const truck =
        await Truck.findById(
          req.params.id
        );

      if (!truck) {
        return res.status(404).json({
          message:
            'Truck not found',
        });
      }

      truck.status =
        req.body.status;

      await truck.save();

      res.json(truck);
    } catch (error) {
      res.status(500).json({
        message:
          'Failed to update status',
      });
    }
  };