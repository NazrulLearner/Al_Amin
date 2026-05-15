import { db } from "../../services/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";

/**
 * 🔥 MANUAL CONTROL SWITCH
 * true  = allow seeding
 * false = block everything
 */
const ENABLE_SEED = true;

// ⚠️ ONE TIME GUARD (avoid duplicate data)
const SEED_KEY = "somity_users_seed_done";

const users = [
{
    uid: "7fluIEW9elh3EabX7FVdFk2u8ph1",
    email: "worldfamous319@gmail.com",
    firstName: "Mister",
    middleName: "",
    lastName: "Khan",
    fullName: "Mister Khan",
    phone: "",
    photoURL: "",
    memberId: "AM009",
    role: "super-admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
  },
]

const seedUsers = async () => {
  try {
    console.log("🚀 Seeder started...");

    if (!ENABLE_SEED) {
      console.log("❌ SEED DISABLED (ENABLE_SEED = false)");
      return;
    }

    // prevent duplicate run
    if (localStorage.getItem(SEED_KEY)) {
      console.log("⚠️ Already seeded. Blocked.");
      return;
    }

    for (const user of users) {
      const id = crypto.randomUUID();

      await setDoc(doc(db, "users", id), user);

      console.log("✔ Added:", user.email);
    }

    localStorage.setItem(SEED_KEY, "true");

    console.log("✅ Seeding completed successfully");
  } catch (err) {
    console.error("❌ Seeder error:", err);
  }
};

export default seedUsers;