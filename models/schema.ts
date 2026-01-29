import mongoose, { Schema, model, models } from "mongoose";

// --- User Schema ---
const UserSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, select: false }, // Select false to exclude by default
        image: { type: String },
        role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
        emailVerified: { type: Date, default: null },
        provider: { type: String, default: "credentials" },
        verificationToken: { type: String },
        verificationTokenExpires: { type: Date },
    },
    { timestamps: true },
);

// --- Team Schema ---
const TeamSchema = new Schema(
    {
        name: { type: String, required: true },
        shortName: { type: String, required: true, uppercase: true, unique: true }, // ISO 3166-1 alpha-2 code (e.g. BR, FR)
        flagUrl: { type: String }, // URL to flag image
        group: { type: String }, // e.g., "A", "B"...
    },
    { timestamps: true },
);

// --- Match Schema ---
const MatchSchema = new Schema(
    {
        homeTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
        awayTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
        kickOff: { type: Date, required: true },
        homeScore: { type: Number, default: null },
        awayScore: { type: Number, default: null },
        status: {
            type: String,
            enum: ["SCHEDULED", "LIVE", "FINISHED"],
            default: "SCHEDULED",
        },
        venue: { type: String },
        stage: { type: String, required: true }, // e.g., "Group Stage", "Final"
        isKnockout: { type: Boolean, default: false },
        wentToPenalties: { type: Boolean, default: false },
        penaltyWinner: { type: Schema.Types.ObjectId, ref: "Team" },
        winner: { type: Schema.Types.ObjectId, ref: "Team" }, // Null if draw
    },
    { timestamps: true },
);

// --- Prediction Schema ---
const PredictionSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        match: { type: Schema.Types.ObjectId, ref: "Match", required: true },
        homeScore: { type: Number, required: true },
        awayScore: { type: Number, required: true },
        penaltyPrediction: { type: Boolean, default: false }, // true = "Yes", false = "No"
        predictedWinner: { type: Schema.Types.ObjectId, ref: "Team" }, // User's pick for winner if penalties
        points: { type: Number, default: 0 },
    },
    { timestamps: true },
);

// --- Group (League) Schema ---
const GroupSchema = new Schema(
    {
        name: { type: String, required: true },
        code: { type: String, unique: true, required: true },
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        isPrivate: { type: Boolean, default: true },
        members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true },
);

// --- System Settings Schema ---
const SystemSettingsSchema = new Schema(
    {
        key: { type: String, required: true, unique: true },
        value: { type: Schema.Types.Mixed, required: true },
    },
    { timestamps: true },
);

// Prevent overwriting models if they are already compiled (Next.js hot reload issue)
export const User = models.User || model("User", UserSchema);
export const Team = models.Team || model("Team", TeamSchema);
// Force schema update if hot reload kept old version without new fields
if (models.Match && (!models.Match.schema.paths.wentToPenalties || !models.Match.schema.paths.isKnockout || !models.Match.schema.paths.penaltyWinner || !models.Match.schema.paths.winner)) {
    delete models.Match;
}
export const Match = models.Match || model("Match", MatchSchema);

// Force schema update if hot reload kept old version without penaltyPrediction
if (models.Prediction && (!models.Prediction.schema.paths.penaltyPrediction || !models.Prediction.schema.paths.predictedWinner)) {
    delete models.Prediction;
}
export const Prediction = models.Prediction || model("Prediction", PredictionSchema);
export const Group = models.Group || model("Group", GroupSchema);
export const SystemSettings = models.SystemSettings || model("SystemSettings", SystemSettingsSchema);
