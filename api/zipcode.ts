export default async function handler(req: any, res: any) {
  const zipcode = (req.query.zipcode as string)?.replace(/[^0-9]/g, "");
  if (!zipcode || zipcode.length !== 7) {
    return res.status(400).json({ error: "invalid zipcode" });
  }
  const r = await fetch(
    `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`
  );
  const data = await r.json();
  res.setHeader("Cache-Control", "s-maxage=86400");
  res.json(data);
}
