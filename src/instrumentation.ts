// Runs once on server startup. Catches unhandled async errors that would
// otherwise bubble up as a generic "Internal Server Error" with no log.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    process.on("unhandledRejection", (reason) => {
      console.error("[unhandledRejection]", reason);
    });
    process.on("uncaughtException", (err) => {
      console.error("[uncaughtException]", err);
    });
    console.log("[instrumentation] Server error handlers registered");
  }
}
