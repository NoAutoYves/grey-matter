from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection, return_db_connection
from routes.Extensions import limiter
import os

admin_logs_bp = Blueprint('admin_logs', __name__)

NGINX_ERROR_LOG = "/var/log/nginx/error.log"
NGINX_MAX_LINES = 500


def admin_required():
    if 'user_id' not in session:
        return False
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT is_admin FROM users WHERE user_id = %s", (session['user_id'],))
        result = cursor.fetchone()
        return result and result[0]
    finally:
        cursor.close()
        return_db_connection(conn)


@admin_logs_bp.route("/admin/error-logs", methods=["GET"])
@limiter.limit("120 per minute")
def list_error_logs():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = min(100, max(10, int(request.args.get("per_page", 50))))
    except ValueError:
        return jsonify({"error": "Invalid pagination"}), 400

    level = request.args.get("level")
    source = request.args.get("source")
    search = request.args.get("search")

    offset = (page - 1) * per_page
    where = []
    params = []

    if level and level != "all":
        where.append("level = %s")
        params.append(level)
    if source and source != "all":
        where.append("source = %s")
        params.append(source)
    if search:
        where.append("(message ILIKE %s OR stack_trace ILIKE %s)")
        params.append(f"%{search}%")
        params.append(f"%{search}%")

    where_sql = f"WHERE {' AND '.join(where)}" if where else ""

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(f"SELECT COUNT(*) FROM error_logs {where_sql}", params)
        total = cursor.fetchone()[0]

        cursor.execute(f"""
            SELECT error_id, user_id, level, source, message, stack_trace,
                   endpoint, method, ip_address, user_agent, extra, created_at
            FROM error_logs
            {where_sql}
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """, params + [per_page, offset])

        rows = cursor.fetchall()
        return jsonify({
            "total": total,
            "page": page,
            "per_page": per_page,
            "logs": [
                {
                    "error_id": r[0],
                    "user_id": r[1],
                    "level": r[2],
                    "source": r[3],
                    "message": r[4],
                    "stack_trace": r[5],
                    "endpoint": r[6],
                    "method": r[7],
                    "ip_address": r[8],
                    "user_agent": r[9],
                    "extra": r[10],
                    "created_at": r[11].isoformat() if r[11] else None,
                }
                for r in rows
            ]
        }), 200
    finally:
        cursor.close()
        return_db_connection(conn)


@admin_logs_bp.route("/admin/error-logs/<int:error_id>", methods=["DELETE"])
@limiter.limit("30 per minute")
def delete_error_log(error_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM error_logs WHERE error_id = %s RETURNING error_id", (error_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Log entry not found"}), 404
        conn.commit()
        return jsonify({"success": True}), 200
    finally:
        cursor.close()
        return_db_connection(conn)


@admin_logs_bp.route("/admin/error-logs", methods=["DELETE"])
@limiter.limit("5 per minute")
def clear_error_logs():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM error_logs")
        deleted = cursor.rowcount
        conn.commit()
        return jsonify({"success": True, "deleted": deleted}), 200
    finally:
        cursor.close()
        return_db_connection(conn)


@admin_logs_bp.route("/admin/error-logs/nginx", methods=["GET"])
@limiter.limit("30 per minute")
def nginx_error_logs():
    """Read /var/log/nginx/error.log. Requires the gunicorn user to be in the 'adm'
    group, or the log to be world-readable. See flags at the bottom."""
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    if not os.path.exists(NGINX_ERROR_LOG):
        return jsonify({"error": "Nginx error log not found", "path": NGINX_ERROR_LOG}), 404

    if not os.access(NGINX_ERROR_LOG, os.R_OK):
        return jsonify({
            "error": "Permission denied reading nginx log",
            "hint": "Run on VPS: sudo usermod -a -G adm <gunicorn-user> && sudo systemctl restart greymatter",
        }), 403

    try:
        with open(NGINX_ERROR_LOG, "r", errors="replace") as f:
            all_lines = f.readlines()

        tail = all_lines[-NGINX_MAX_LINES:]
        return jsonify({
            "path": NGINX_ERROR_LOG,
            "total_lines": len(all_lines),
            "returned": len(tail),
            "lines": [ln.rstrip("\n") for ln in reversed(tail)],
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to read log: {e}"}), 500


@admin_logs_bp.route("/admin/activity", methods=["GET"])
@limiter.limit("120 per minute")
def list_activity():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = min(200, max(20, int(request.args.get("per_page", 100))))
    except ValueError:
        return jsonify({"error": "Invalid pagination"}), 400

    action_filter = request.args.get("action")
    search = request.args.get("search")

    offset = (page - 1) * per_page
    where = []
    params = []

    if action_filter and action_filter != "all":
        where.append("al.action = %s")
        params.append(action_filter)
    if search:
        where.append("(al.details ILIKE %s OR u.email ILIKE %s OR al.ip_address::text ILIKE %s)")
        params.extend([f"%{search}%"] * 3)

    where_sql = f"WHERE {' AND '.join(where)}" if where else ""

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            f"SELECT COUNT(*) FROM activity_logs al LEFT JOIN users u ON al.user_id = u.user_id {where_sql}",
            params,
        )
        total = cursor.fetchone()[0]

        cursor.execute(f"""
            SELECT al.log_id, al.created_at, al.user_id, u.email, al.action,
                   al.details, al.ip_address, al.user_agent
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.user_id
            {where_sql}
            ORDER BY al.created_at DESC
            LIMIT %s OFFSET %s
        """, params + [per_page, offset])

        rows = cursor.fetchall()
        return jsonify({
            "total": total,
            "page": page,
            "per_page": per_page,
            "activities": [
                {
                    "log_id": r[0],
                    "created_at": r[1].isoformat() if r[1] else None,
                    "user_id": r[2],
                    "user_email": r[3] or "System",
                    "action": r[4],
                    "details": r[5],
                    "ip_address": r[6],
                    "user_agent": r[7],
                }
                for r in rows
            ]
        }), 200
    finally:
        cursor.close()
        return_db_connection(conn)


@admin_logs_bp.route("/admin/activity/actions", methods=["GET"])
@limiter.limit("120 per minute")
def list_activity_actions():
    """Distinct action values for the filter dropdown."""
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT DISTINCT action FROM activity_logs ORDER BY action")
        return jsonify({"actions": [r[0] for r in cursor.fetchall() if r[0]]}), 200
    finally:
        cursor.close()
        return_db_connection(conn)