export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, name, email, phone } = req.body;

  // ✅ Your real values — already filled in
  const GOOGLE_FORM_ID  = "1FAIpQLSd9X0TzlTXTSZ3mFimYNFP-9sUoe7A8BuWKqKrdlBZ9t7ahUw";
  const ENTRY_NAME      = "entry.1818516291";
  const ENTRY_EMAIL     = "entry.1910041915";
  const ENTRY_PHONE     = "entry.1191086883";
  const TRACKING_SCRIPT = "https://script.google.com/macros/s/AKfycbwdFWPMqb6SLu6xjdR2TTXDhxTwYkzoDAeCL6pJBV-2tK22sWrG5NIQeMdaTb2G3mAn/exec";

  try {

    // ── VISITOR → Google Sheet via Apps Script ──
    if (type === "visitor") {
      await fetch(TRACKING_SCRIPT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          time:      new Date().toISOString(),
          page:      req.body.page      || "",
          referrer:  req.body.referrer  || "Direct",
          userAgent: req.body.userAgent || "",
        }),
      });
      return res.status(200).json({ status: "visitor logged" });
    }

    // ── FORM SUBMISSION → Google Forms ──
    if (type === "form") {
      const formData = new URLSearchParams({
        [ENTRY_NAME]:  name,
        [ENTRY_EMAIL]: email,
        [ENTRY_PHONE]: phone,
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
    return res.status(500).json({ error: "Server error" });
  }
}
