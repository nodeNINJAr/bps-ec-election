import mongoose from "mongoose";

let connectingPromise: Promise<typeof mongoose> | null = null;

// Keyed off this module's own `mongoose` connection state rather than a
// cross-module global flag: in `next dev`, different route bundles each get
// their own copy of the mongoose module (and therefore their own Nomination
// model), so a global "already connected" flag set by one bundle doesn't
// mean another bundle's copy is actually connected. Checking
// mongoose.connection.readyState keeps each bundle self-consistent.
export function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }

  if (!connectingPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not set");
    }
    connectingPromise = mongoose
      .connect(uri, { dbName: process.env.MONGODB_DB || "bps_ec_election" })
      .finally(() => {
        connectingPromise = null;
      });
  }

  return connectingPromise;
}
