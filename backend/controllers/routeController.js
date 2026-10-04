import pool from '../db/pool.js';

export async function getRoutes(req, res) {
  try {
    const [routes] = await pool.query(
      `SELECT
         r.route_id,
         r.route_name,
         r.start_location,
         r.end_location,
         r.distance_km,
         b.bus_number
       FROM route r
       JOIN bus b ON r.bus_id = b.bus_id
       ORDER BY r.route_id`
    );

    const [stops] = await pool.query(
      `SELECT pickup_id, pickup_name, stop_order, route_id
       FROM pickup_point
       ORDER BY route_id, stop_order`
    );

    const data = routes.map((route) => ({
      ...route,
      stops: stops
        .filter((s) => s.route_id === route.route_id)
        .map((s) => ({ pickupId: s.pickup_id, name: s.pickup_name, order: s.stop_order })),
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('Get routes error:', err);
    res.status(500).json({ success: false, message: 'Unable to connect to database' });
  }
}

export async function getBusCapacity(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
         r.route_id,
         r.route_name,
         b.bus_number,
         b.capacity,
         COUNT(DISTINCT st.student_id) AS assigned_students,
         b.capacity - COUNT(DISTINCT st.student_id) AS available_seats
       FROM route r
       JOIN bus b ON r.bus_id = b.bus_id
       JOIN pickup_point pp ON r.route_id = pp.route_id
       JOIN student_transport st ON pp.pickup_id = st.pickup_id
       GROUP BY r.route_id, r.route_name, b.bus_number, b.capacity
       ORDER BY r.route_id`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get bus capacity error:', err);
    res.status(500).json({ success: false, message: 'Unable to connect to database' });
  }
}
