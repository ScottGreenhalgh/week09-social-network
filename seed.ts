import { connect } from "@/utils/connect";

const db = connect();

const emptyAllTables = async () => {
  try {
    await db.query("BEGIN");

    await db.query("TRUNCATE TABLE social_profile RESTART IDENTITY CASCADE");
    await db.query("TRUNCATE TABLE social_posts RESTART IDENTITY CASCADE");

    await db.query("COMMIT");
    console.log("All tables have been emptied.");
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error emptying tables:", error);
  }
};

emptyAllTables();
