import pool from '../db/pool.js';

export async function getBuses(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
         b.bus_id,
         b.bus_number,
         b.capacity,
         b.bus_model,
         b.status,
         d.driver_name,
         d.phone AS driver_phone
       FROM bus b
       JOIN driver d ON b.driver_id = d.driver_id
       ORDER BY b.bus_id`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get buses error:', err);
    res.status(500).json({ success: false, message: 'Unable to connect to database' });
  }
}
