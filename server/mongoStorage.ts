import mongoose, { Schema, Document } from "mongoose";
import {
  type User,
  type InsertUser,
  type Purchase,
  type InsertPurchase,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";

/* ---------- MongoDB Schemas ---------- */
interface IUser extends Document {
  username: string;
  password: string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);

interface IPurchase extends Document {
  userId: string;
  amountInvested: number;
  goldQuantity: number;
  pricePerGram: number;
  platformFee: number;
  totalAmount: number;
  createdAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>({
  userId: { type: String, required: true },
  amountInvested: { type: Number, required: true },
  goldQuantity: { type: Number, required: true },
  pricePerGram: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const PurchaseModel = mongoose.model<IPurchase>("Purchase", PurchaseSchema);

interface IChatMessage extends Document {
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  userId: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ChatMessageModel = mongoose.model<IChatMessage>(
  "ChatMessage",
  ChatMessageSchema
);

/* ---------- Storage Implementation ---------- */
export class MongoStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const doc = await UserModel.findById(id).lean();
    return doc ? (doc as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({ username }).lean();
    return doc ? (doc as User) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = new UserModel(insertUser);
    const saved = await user.save();
    return saved.toObject() as User;
  }

  // Purchase operations
async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
  const purchase = new PurchaseModel(insertPurchase);
  const saved = await purchase.save();
  return saved.toObject({ versionKey: false }) as unknown as Purchase;
}

  async getUserPurchases(userId: string): Promise<Purchase[]> {
    const docs = await PurchaseModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return docs as unknown as Purchase[];
  }

  async getUserTotalGold(userId: string): Promise<number> {
    const purchases = await PurchaseModel.find({ userId }).lean();
    return purchases.reduce(
      (total, p) => total + parseFloat(p.goldQuantity?.toString() || "0"),
      0
    );
  }

  // Chat operations
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
  const message = new ChatMessageModel(insertMessage);
  const saved = await message.save();
  return saved.toObject({ versionKey: false }) as unknown as ChatMessage;
}

  async getUserChatHistory(userId: string): Promise<ChatMessage[]> {
    const docs = await ChatMessageModel.find({ userId }).sort({ createdAt: 1 }).lean();
    return docs as unknown as ChatMessage[];
  }
}

/* ---------- MongoDB Connection Helper ---------- */
export async function connectDB() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/goldapp"
    );
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}
