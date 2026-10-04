import pool from '../db/pool.js';

export async function getTransportFees(req, res) {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const params = [];
    let whereClause = '';
    if (search.trim()) {
      whereClause = 'WHERE s.student_name LIKE ? OR tf.payment_status LIKE ?';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM transport_fee tf JOIN student s ON tf.student_id = s.student_id ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT
         tf.fee_id,
         s.student_name,
         tf.amount,
         tf.due_date,
         tf.payment_date,
         tf.payment_status
       FROM transport_fee tf
       JOIN student s ON tf.student_id = s.student_id
       ${whereClause}
       ORDER BY tf.fee_id
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
    console.error('Get transport fees error:', err);
    res.status(500).json({ success: false, message: 'Unable to connect to database' });
  }
}
