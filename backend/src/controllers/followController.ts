import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';

export async function getFollowStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // User info injected by ensureAuth middleware
  const me = (req as any).user.id;
  const target = parseInt(req.params.targetId, 10);

  try {
    const [rows]: any = await pool.query(
      'SELECT 1 FROM seguidores WHERE seguidor_id = ? AND seguido_id = ? LIMIT 1',
      [me, target]
    );
    return res.json({ isFollowing: rows.length > 0 });
  } catch (err) {
    return next(err);
  }
}

export async function toggleFollow(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const me = (req as any).user.id;
  const target = parseInt(req.params.targetId, 10);

  try {
    const [rows]: any = await pool.query(
      'SELECT 1 FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?',
      [me, target]
    );

    if (rows.length > 0) {
      await pool.query(
        'DELETE FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?',
        [me, target]
      );
      return res.json({ followed: false });
    } else {
      await pool.query(
        'INSERT INTO seguidores (seguidor_id, seguido_id) VALUES (?, ?)',
        [me, target]
      );
      return res.json({ followed: true });
    }
  } catch (err) {
    return next(err);
  }
}
