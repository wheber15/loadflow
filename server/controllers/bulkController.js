import BulkOrder from '../models/BulkOrder.js';
import FloorSlot from '../models/FloorSlot.js';

/* =========================
   GET BULK ORDERS
========================= */
export const getBulkOrders =
  async (req, res) => {
    try {
      const orders =
        await BulkOrder.find()
          .sort({
            createdAt: -1,
          });

      res.json(orders);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          'Failed to fetch bulk orders',
      });
    }
  };

/* =========================
   CREATE BULK ORDER
========================= */
export const createBulkOrder =
  async (req, res) => {
    try {
      const {
        deliveryNumber,
        customerName,
        bulkQuantity,
        bulkType,
        notes,
        createdBy,
      } = req.body;

      if (
        !deliveryNumber ||
        !customerName ||
        !bulkQuantity ||
        !bulkType
      ) {
        return res.status(400).json({
          message:
            'Missing required fields',
        });
      }

      const bulkOrder =
        await BulkOrder.create({
          deliveryNumber,
          customerName,
          bulkQuantity,
          bulkType,
          notes,
          createdBy,
        });

      /* =========================
         SINGLE BULK
         CREATE FLOOR PLACEHOLDERS
      ========================= */

      if (
        bulkType === 'SINGLE'
      ) {
        const emptySlots =
          await FloorSlot.find({
            status: 'EMPTY',
          })
            .sort({
              row: 1,
              column: 1,
            })
            .limit(bulkQuantity);

        for (const slot of emptySlots) {
          slot.status =
            'WAITING_BULK';

          slot.isBulkPlaceholder =
            true;

          slot.bulkQuantity = 1;

          slot.bulkType =
            'SINGLE';

          slot.deliveryNumber =
            deliveryNumber;

          slot.customerName =
            customerName;

          await slot.save();
        }
      }

      res.status(201).json(
        bulkOrder
      );
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          'Failed to create bulk order',
      });
    }
  };

/* =========================
   ACTIVATE BULK ORDER
========================= */
export const activateBulkOrder =
  async (req, res) => {
    try {
      const order =
        await BulkOrder.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          message:
            'Bulk order not found',
        });
      }

      order.status =
        'ACTIVE';

      order.activatedAt =
        new Date();

      await order.save();

      /* =========================
         CREATE BULK PLACEHOLDERS
      ========================= */

      const emptySlots =
        await FloorSlot.find({
          status: 'EMPTY',
        })
          .sort({
            row: 1,
            column: 1,
          })
          .limit(
            order.bulkQuantity
          );

      for (const slot of emptySlots) {
        slot.status =
          'WAITING_BULK';

        slot.isBulkPlaceholder =
          true;

        slot.bulkQuantity = 1;

        slot.bulkType =
          order.bulkType;

        slot.deliveryNumber =
          order.deliveryNumber;

        slot.customerName =
          order.customerName;

        await slot.save();
      }

      res.json(order);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          'Failed to activate bulk order',
      });
    }
  };