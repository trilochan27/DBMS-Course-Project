import pool from '../db/pool.js';

const PHONE_REGEX = /^[0-9]{10,15}$/;

export async function getStudents(req, res) {
  try {
    const { search = '', course = '', page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const where = [];
    const params = [];

    if (search.trim()) {
      where.push('(student_id LIKE ? OR student_name LIKE ? OR parent_name LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }
    if (course.trim()) {
      where.push('class = ?');
      params.push(course.trim());
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM student ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT
         student_id,
         student_name,
         class AS course,
         section,
         parent_name,
         parent_contact
       FROM student
       ${whereClause}
       ORDER BY student_id
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ success: false, message: 'Unable to connect to database' });
  }
}

export async function getCourses(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT class AS course FROM student ORDER BY class'
    );
    res.json({ success: true, data: rows.map((r) => r.course) });
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ success: false, message: 'Unable to connect to database' });
  }
}

export async function getStudentById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT
         student_id, student_name, class AS course, section,
         parent_name, parent_contact
       FROM student WHERE student_id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Get student by id error:', err);
    res.status(500).json({ success: false, message: 'Unable to connect to database' });
  }
}

export async function createStudent(req, res) {
  try {
    const { studentId, studentName, course, section, parentName, parentContact } = req.body;

    if (!studentId || !studentName || !course || !section || !parentName || !parentContact) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }
    if (!PHONE_REGEX.test(String(parentContact).trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number' });
    }

    const [existing] = await pool.query(
      'SELECT student_id FROM student WHERE student_id = ?',
      [studentId.trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Student ID already exists' });
    }

    await pool.query(
      `INSERT INTO student
         (student_id, student_name, class, section, parent_name, parent_contact)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [studentId.trim(), studentName.trim(), course.trim(), section.trim(), parentName.trim(), String(parentContact).trim()]
    );

    const [rows] = await pool.query(
      `SELECT student_id, student_name, class AS course, section, parent_name, parent_contact
       FROM student WHERE student_id = ?`,
      [studentId.trim()]
    );

    res.status(201).json({ success: true, message: 'Student added successfully', data: rows[0] });
  } catch (err) {
    console.error('Create student error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Student ID already exists' });
    }
    res.status(500).json({ success: false, message: 'Unable to connect to database' });
  }
}

export async function deleteStudent(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT student_id FROM student WHERE student_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const [[st], [pr], [fee]] = await Promise.all([
      pool.query('SELECT COUNT(*) AS c FROM student_transport WHERE student_id = ?', [id]),
      pool.query('SELECT COUNT(*) AS c FROM pickup_record WHERE student_id = ?', [id]),
      pool.query('SELECT COUNT(*) AS c FROM transport_fee WHERE student_id = ?', [id]),
    ]);

    const hasDependents = st[0].c > 0 || pr[0].c > 0 || fee[0].c > 0;
    if (hasDependents) {
      return res.status(409).json({
        success: false,
        message: 'This student has related transport records. Delete dependent records first.',
        details: {
          studentTransport: st[0].c,
          pickupRecords: pr[0].c,
          transportFees: fee[0].c,
        },
      });
    }

    await pool.query('DELETE FROM student WHERE student_id = ?', [id]);

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Delete student error:', err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({
        success: false,
        message: 'This student has related transport records. Delete dependent records first.',
      });
    }
    res.status(500).json({ success: false, message: 'Unable to connect to database' });
  }
}
