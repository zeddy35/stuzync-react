// src/models/Conversation.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IConversation {
  participants: mongoose.Types.ObjectId[];     // DM: 2 kişi (ama çoklu da olabilir)
  participantsKey?: string | null;             // DM tekillik anahtarı (sorted ids join)
  lastMessageAt?: Date;
  group?: mongoose.Types.ObjectId | null;      // Grup sohbeti varsa
  createdAt?: Date;
  updatedAt?: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", index: true, required: true }],
    // Dahili alan: DM tekilleştirme için, select dışı tutalım
    participantsKey: { type: String, index: true, sparse: true, select: false },
    lastMessageAt: { type: Date, default: null },
    group: { type: Schema.Types.ObjectId, ref: "Group", default: null, index: true },
  },
  { timestamps: true }
);

/**
 * Validasyon:
 * - Grup yoksa en az 2 participant olsun
 */
conversationSchema.path("participants").validate(function (val: mongoose.Types.ObjectId[]) {
  if (!this.get("group") && (!Array.isArray(val) || val.length < 2)) {
    return false;
  }
  return true;
}, "A direct (non-group) conversation needs at least 2 participants.");

/**
 * Pre-validate:
 * - DM ise (group yok) participantsId'leri string'e çevirip sıralayıp participantsKey ata
 * - Grup ise participantsKey null kalsın
 */
conversationSchema.pre("validate", function (next) {
  const group = this.get("group");
  const participants = (this.get("participants") || []) as mongoose.Types.ObjectId[];
  if (!group && participants.length) {
    const key = participants.map(String).sort().join(":");
    this.set("participantsKey", key);
  } else {
    this.set("participantsKey", null);
  }
  next();
});

/**
 * Indexler:
 * - DM tekillik: participantsKey unique, fakat sparse (yalnızca DM belgeleri için)
 * - Sıralama için lastMessageAt
 */
conversationSchema.index({ participantsKey: 1 }, { unique: true, sparse: true });
conversationSchema.index({ lastMessageAt: -1 });

/**
 * JSON dönüşümünde dahili alanları gizle
 */
conversationSchema.set("toJSON", {
  transform(_doc, ret:any) {
    // __v varsa kaldır
    if (ret.__v !== undefined) delete ret.__v;
    // participantsKey zaten select:false ama yine de temizlik
    if (ret.participantsKey !== undefined) delete ret.participantsKey;
    return ret;
  }
});

/**
 * Yardımcı statik: 2+ kullanıcıyla DM’i bul/oluştur.
 * - Aynı ikili için ikinci kez oluşturmaz.
 * - lastMessageAt başlangıçta now olabilir.
 */
conversationSchema.statics.upsertDM = async function (
  userIds: Array<mongoose.Types.ObjectId | string>
) {
  if (!Array.isArray(userIds) || userIds.length < 2) {
    throw new Error("upsertDM needs at least two userIds");
  }
  const key = userIds.map(String).sort().join(":");
  return this.findOneAndUpdate(
    { participantsKey: key, group: null },
    {
      $setOnInsert: {
        participants: userIds,
        participantsKey: key,
        group: null,
        lastMessageAt: new Date()
      }
    },
    { new: true, upsert: true }
  ).populate("participants", "firstName lastName profilePic");
};

export interface ConversationModel extends mongoose.Model<IConversation> {
  upsertDM(userIds: Array<mongoose.Types.ObjectId | string>): Promise<IConversation>;
}

export default (models.Conversation as ConversationModel) ||
  model<IConversation, ConversationModel>("Conversation", conversationSchema);
