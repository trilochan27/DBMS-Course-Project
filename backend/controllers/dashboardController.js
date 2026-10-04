import pool from '../db/pool.js';

export async function getStats(req, res) {
  try {
    const counts = {};
    const queries = {
      students: 'SELECT COUNT(*) AS c FROM student',
      buses: 'SELECT COUNT(*) AS c FROM bus',
      routes: 'SELECT COUNT(*) AS c FROM route',
      drivers: 'SELECT COUNT(*) AS c FROM driver',
      pickupPoints: 'SELECT COUNT(*) AS c FROM pickup_point',
      dropPoints: 'SELECT COUNT(*) AS c FROM drop_point',
      transportAssignments: 'SELECT COUNT(*) AS c FROM student_transport',
      pickupRecords: 'SELECT COUNT(*) AS c FROM pickup_record',
      transportFees: 'SELECT COUNT(*) AS c FROM transport_fee',
    };

    const entries = Object.entries(queries);
    const results = await Promise.all(
      entries.map(([, sql]) => pool.query(sql))
    );

    entries.forEach(([key], i) => {
      counts[key] = results[i][0][0].c;
    });

    res.json({ success: true, data: counts });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Unable to connect to database' });
  }
}
