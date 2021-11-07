import level = require("level");

const db = level("./.db_data");

const main = async () => {
  const res = await db.get("name");
  console.log(res);
};

main();
