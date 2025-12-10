const db = require('../db');
const levenshtein = require('../utils/levenshtein');

// ==========================
// SEARCH CONTROLLER
// ==========================
async function searchHandler(req, res) {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ results: [] });

    const likeQuery = `%${q.replace(/%/g, "")}%`;

    // ------------------------------
    // 1) LIKE SEARCH
    // ------------------------------
    const [likeRows] = await db.query(
      `SELECT 
          id, order_code, tray_type, serial_no, make, dimensions, size, status,
          'like' AS source,
          NULL AS score
       FROM orders
       WHERE 
          order_code LIKE ?
          OR tray_type LIKE ?
          OR serial_no LIKE ?
          OR make LIKE ?
          OR dimensions LIKE ?
          OR size LIKE ?
       LIMIT 50`,
      [likeQuery, likeQuery, likeQuery, likeQuery, likeQuery, likeQuery]
    );

    // ------------------------------
    // 2) OPTIONAL LEVENSHTEIN FUZZY SEARCH (for small queries)
    // ------------------------------
    let levRows = [];
    if (q.length <= 40) {
      const [candidates] = await db.query(`
        SELECT id, order_code, tray_type, serial_no, make, dimensions, size, status
        FROM orders
        LIMIT 200
      `);

      levRows = candidates
        .map((r) => {
          const textA = (r.tray_type || "").toLowerCase();
          const textB = (r.make || "").toLowerCase();
          const textC = (r.dimensions || "").toLowerCase();
          const textD = (r.size || "").toLowerCase();
          const query = q.toLowerCase();

          const dist = Math.min(
            levenshtein.distance(textA, query),
            levenshtein.distance(textB, query),
            levenshtein.distance(textC, query),
            levenshtein.distance(textD, query)
          );

          return { ...r, dist };
        })
        .filter((r) => r.dist <= 3)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 50)
        .map((r) => ({
          ...r,
          source: "lev",
          score: 1 / (1 + r.dist),
        }));
    }

    // ------------------------------
    // MERGE RESULTS (avoid duplicates)
    // ------------------------------
    const map = new Map();

    levRows.forEach((r) => map.set(r.id, r));
    likeRows.forEach((r) => {
      if (!map.has(r.id)) map.set(r.id, r);
    });

    // ------------------------------
    // SORT & FORMAT
    // ------------------------------
    const results = Array.from(map.values())
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 50);

    res.json({ results });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "search failed" });
  }
}

module.exports = { searchHandler };
