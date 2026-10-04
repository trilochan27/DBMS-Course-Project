import pool from '../db/pool.js';

export async function getTransport(req, res) {
  try {
    const { search = '' } = req.query;
    const params = [];
    let whereClause = '';
    if (search.trim()) {
      whereClause = 'WHERE s.student_id LIKE ? OR s.student_name LIKE ? OR r.route_name LIKE ?';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    const [rows] = await pool.query(
      `SELECT
         s.student_id,
         s.student_name,
         pp.pickup_name,
         dp.drop_name,
         r.route_name,
         b.bus_number,
         d.driver_name
       FROM student s
       JOIN student_transport st ON s.student_id = st.student_id
       JOIN pickup_point pp ON st.pickup_id = pp.pickup_id
       JOIN drop_point dp ON st.drop_id = dp.drop_id
       JOIN route r ON pp.route_id = r.route_id
       JOIN bus b ON r.bus_id = b.bus_id
       JOIN driver d ON b.driver_id = d.driver_id
       ${whereClause}
       ORDER BY s.student_id`,
      params
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get transport error:', err);
    res.status(500).json({ success: false, message: 'Unable to connect to database' });
  }
}
