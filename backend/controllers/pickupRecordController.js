import pool from '../db/pool.js';

export async function getPickupRecords(req, res) {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const params = [];
    let whereClause = '';
    if (search.trim()) {
      whereClause = 'WHERE s.student_name LIKE ? OR pr.status LIKE ?';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM pickup_record pr JOIN student s ON pr.student_id = s.student_id ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT
         pr.record_id,
         s.student_name,
         pr.pickup_date,
         pr.pickup_time,
         pr.status,
         pr.remarks
       FROM pickup_record pr
       JOIN student s ON pr.student_id = s.student_id
       ${whereClause}
       ORDER BY pr.pickup_date DESC, pr.record_id DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countRows[0].total,
        totalPages: Math.ceil(countRows[0].total / limitNum) || 1,
      },
    });
  } catch (err) {
    console.error('Get pickup records error:', err);
    res.status(500).json({ success: false, message: 'Unable to connect to database' });
  }
}
