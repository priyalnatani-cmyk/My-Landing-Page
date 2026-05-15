export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, name, email, phone } = req.body;

  const GOOGLE_FORM_ID  = "1FAIpQLSd9X0TzlTXTSZ3mFimYNFP-9sUoe7A8BuWKqKrdlBZ9t7ahUw";
  const ENTRY_NAME      = "entry.1818516291";
  const ENTRY_EMAIL     = "entry.1910041915";
  const ENTRY_PHONE     = "entry.1191086883";
  const TRACKING_SCRIPT = "https://script.google.com/macros/s/AKfycbwdFWPMqb6SLu6xjdR2TTXDhxTwYkzoDAeCL6pJBV-2tK22sWrG5NIQeMdaTb2G3mAn/exec";

  try {

    // ── VISITOR TRACKING ──
    if (type === "visitor") {
      const payload = JSON.stringify({
        time:      req.body.time      || new Date().toISOString(),
        page:      req.body.page      || "",
        referrer:  req.body.referrer  || "Direct",
        userAgent: req.body.userAgent || "",
      });

      // Try POST first, fall back to GET with params
      try {
        const postRes = await fetch(TRACKING_SCRIPT, {
          method: "POST",
          headers: { "Content-Type": "text/plain" }, // text/plain bypasses CORS preflight
          body: payload,
          redirect: "follow",
        });
        console.log("Visitor POST status:", postRes.status);
      } catch (postErr) {
        console.log("POST failed, trying GET fallback:", postErr.message);
        // GET fallback — encode data as query params
        const params = new URLSearchParams({
          time:      req.body.time      || new Date().toISOString(),
          page:      req.body.page      || "",
          referrer:  req.body.referrer  || "Direct",
          userAgent: req.body.userAgent || "",
        });
        await fetch(`${TRACKING_SCRIPT}?${params.toString()}`, {
          method: "GET",
          redirect: "follow",
        });
      }

      return res.status(200).json({ status: "visitor logged" });
    }

    // ── FORM SUBMISSION ──
    if (type === "form") {
      const formData = new URLSearchParams({
        [ENTRY_NAME]:  name  || "",
        [ENTRY_EMAIL]: email || "",
        [ENTRY_PHONE]: phone || "",
      });

      await fetch(
        `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
          redirect: "follow",
        }
      );
      return res.status(200).json({ status: "form submitted" });
    }

    return res.status(400).json({ error: "Unknown type" });

  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
