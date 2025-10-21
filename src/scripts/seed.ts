import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import Group from "@/models/Group";
import GroupMembership from "@/models/GroupMembership";
import GroupPost from "@/models/GroupPost";
import GroupMessage from "@/models/GroupMessage";

async function run() {
  await dbConnect();
  await mongoose.connection.dropDatabase();

  const u1 = await User.create({ firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", isVerified: true, roles: ["user"], mustCompleteProfile: false });
  const u2 = await User.create({ firstName: "Alan", lastName: "Turing", email: "alan@example.com", isVerified: true, roles: ["user"], mustCompleteProfile: false });

  const p1 = await Post.create({ author: u1._id, content: "Hello StuZync!" });
  await Post.create({ author: u2._id, content: "Learning together #zync" });
  await Post.updateOne({ _id: p1._id }, { $addToSet: { likes: u2._id } });

  const g = await Group.create({ name: "CS Study", description: "Algorithms", owner: u1._id, createdBy: u1._id });
  await GroupMembership.create({ group: g._id, user: u1._id, role: "admin" });
  await GroupMembership.create({ group: g._id, user: u2._id, role: "member" });
  await GroupPost.create({ group: g._id, author: u1._id, content: "Welcome to the group" });
  await GroupMessage.create({ group: g._id, author: u2._id, text: "Hi!" });

  console.log("Seeded");
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });

