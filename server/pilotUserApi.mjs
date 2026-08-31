const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let body = "";
  for await (const chunk of req) { body += chunk; if (body.length > 20_000) throw new Error("Payload quá lớn."); }
  return body ? JSON.parse(body) : {};
}

async function supabaseAdmin(pathname, method, body) {
  const response = await fetch(`${supabaseUrl}${pathname}`, { method, headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json", ...(body ? { Prefer: "return=representation" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error_description || data.msg || "Supabase Admin API lỗi.");
  return data;
}

async function requireSuperAdmin(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token || !supabaseUrl || !serviceRoleKey) throw new Error("Không thể xác thực quyền quản trị.");
  const identityResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${token}` } });
  const identity = await identityResponse.json().catch(() => null);
  if (!identityResponse.ok || !identity?.id) throw new Error("Phiên đăng nhập không hợp lệ.");
  const profiles = await supabaseAdmin(`/rest/v1/profiles?id=eq.${encodeURIComponent(identity.id)}&select=id,role`, "GET");
  if (!Array.isArray(profiles) || profiles[0]?.role !== "super_admin") throw new Error("Chỉ Super Admin có quyền quản lý tài khoản.");
  return { userId: identity.id };
}

function validRole(role) { return role === "super_admin" || role === "director" || role === "leader" || role === "advisor"; }
function validBudget(value) { return Number.isInteger(value) && value >= 0 && value <= 50000; }

export async function handlePilotUsers(req, res) {
  try {
    const actor = await requireSuperAdmin(req);
    const payload = await readJson(req);
    if (!validRole(payload.role) || typeof payload.teamId !== "string" || !payload.teamId || typeof payload.displayName !== "string" || payload.displayName.trim().length < 1 || !validBudget(payload.xpBalance)) throw new Error("Dữ liệu tài khoản không hợp lệ.");
    const teams = await supabaseAdmin(`/rest/v1/teams?id=eq.${encodeURIComponent(payload.teamId)}&select=id`, "GET");
    if (!Array.isArray(teams) || !teams.length) throw new Error("Team được chọn không tồn tại.");
    if (req.method === "POST") {
      const email = String(payload.email || "").trim().toLowerCase();
      const password = String(payload.password || "");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) throw new Error("Email hợp lệ và mật khẩu tối thiểu 8 ký tự là bắt buộc.");
      const authUser = await supabaseAdmin("/auth/v1/admin/users", "POST", { email, password, email_confirm: true });
      try { await supabaseAdmin("/rest/v1/profiles", "POST", { id: authUser.id, email, display_name: payload.displayName.trim(), role: payload.role, primary_team_id: payload.teamId, xp_balance: payload.xpBalance, is_active: true }); }
      catch (error) { await supabaseAdmin(`/auth/v1/admin/users/${encodeURIComponent(authUser.id)}`, "DELETE").catch(() => undefined); throw error; }
      return sendJson(res, 201, { account: { id: authUser.id, email, displayName: payload.displayName.trim(), role: payload.role, teamId: payload.teamId, teamName: "", isActive: true, xpBalance: payload.xpBalance, createdAt: new Date().toISOString() } });
    }
    if (req.method === "PATCH") {
      const userId = String(payload.userId || "");
      if (!userId) throw new Error("Thiếu tài khoản cần cập nhật.");
      if (userId === actor.userId && payload.role !== "super_admin") throw new Error("Khóa an toàn: Bạn không thể tự thay đổi vai trò Super Admin của chính mình.");
      const updated = await supabaseAdmin(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, "PATCH", { display_name: payload.displayName.trim(), role: payload.role, primary_team_id: payload.teamId, xp_balance: payload.xpBalance, is_active: payload.isActive !== false });
      const account = Array.isArray(updated) ? updated[0] : updated;
      return sendJson(res, 200, { account: account ? { id: account.id, email: account.email, displayName: account.display_name, role: account.role, teamId: account.primary_team_id, teamName: "", isActive: account.is_active, xpBalance: account.xp_balance, createdAt: account.created_at } : null });
    }
    sendJson(res, 405, { error: "Method không được hỗ trợ." });
  } catch (error) {
    sendJson(res, /quyền|xác thực|Phiên/.test(error instanceof Error ? error.message : "") ? 403 : 400, { error: error instanceof Error ? error.message : "Không thể quản lý tài khoản." });
  }
}
