import pool from '../db/pool.js';

export async function getPickupDropPoints(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
         r.route_name,
         pp.stop_order,
         pp.pickup_name,
         pp.pickup_time,
         dp.drop_name,
         dp.drop_time
       FROM pickup_point pp
       JOIN route r ON pp.route_id = r.route_id
       LEFT JOIN drop_point dp
         ON dp.route_id = pp.route_id AND dp.stop_order = pp.stop_order
       ORDER BY r.route_id, pp.stop_order`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get pickup/drop points error:', err);
    res.status(500).json({ success: false, message: 'Unable to connect to database' });
  }
}
