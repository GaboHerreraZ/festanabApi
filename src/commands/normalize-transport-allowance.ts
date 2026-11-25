import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import connectDB from "../config/database";
import { Hour } from "../components/event/model/hour.model";
import { Event } from "../components/event/model/event.model";

/**
 * One-off: strip the embedded transport allowance out of `Hour.total` for events
 * that have NOT been settled yet.
 *
 * Records written before the allowance moved out of the hour record carry it
 * inside their `total` and in their own `auxiliaryTrasport`. The roll-up treats
 * such a day as already paid (`legacyDays`), which is correct for the money but
 * makes a mixed event read as "1 day" when the employee worked two, and leaves the
 * old per-record overpayment in place when the same day appears in two events.
 *
 * Subtracting the stored allowance from the stored total is exactly neutral for an
 * employee whose days all live in one event: the roll-up then adds the same amount
 * back as a per-day line. The only totals that move are the ones the old bug
 * double-paid — the same day claimed by a second event — which is the correction.
 *
 * Only events whose status is NOT `completed` are touched — that is the status that
 * locks editing, so it is the real "already closed" signal. Holding an
 * `EventBilling` snapshot is NOT: `setEventBilling` rebuilds the snapshot every
 * time someone presses Liquidar, so an in-flight event can have one.
 *
 * Dry run by default, and --apply writes a JSON backup of every (total,
 * auxiliaryTrasport) it changes so the write can be undone.
 *
 *   npm run normalize-aux           # report only
 *   npm run normalize-aux -- --apply
 */

const APPLY = process.argv.includes("--apply");

const run = async () => {
  await connectDB();

  const openEventIds = await Event.distinct("_id", {
    status: { $ne: "completed" },
  });
  const open = new Set(openEventIds.map((id: any) => String(id)));

  const candidates = await Hour.find({
    auxiliaryTrasport: { $gt: 0 },
  }).lean();

  console.log(
    `${APPLY ? "APLICANDO" : "SIMULACION (sin escribir)"} — ${
      candidates.length
    } registros con auxilio embebido, ${open.size} eventos sin liquidar\n`
  );

  const backup: any[] = [];

  const byEvent = new Map<string, any[]>();
  for (const hour of candidates) {
    const key = String(hour.eventId ?? "");
    const list = byEvent.get(key) ?? [];
    list.push(hour);
    byEvent.set(key, list);
  }

  let touched = 0;
  let skipped = 0;
  let moved = 0;

  for (const [eventId, hours] of byEvent) {
    if (!open.has(eventId)) {
      skipped += hours.length;
      console.log(`evento ${eventId}: COMPLETADO, se omiten ${hours.length}`);
      continue;
    }

    console.log(`evento ${eventId}: ${hours.length} registro(s)`);

    for (const hour of hours) {
      const aux = hour.auxiliaryTrasport ?? 0;
      const before = hour.total ?? 0;
      const after = before - aux;

      console.log(
        `  ${hour._id} ${hour.employee} total ${before} -> ${after} (aux ${aux} -> 0)`
      );

      if (after < 0) {
        console.log(`    OMITIDO: el total quedaria negativo, revisar a mano`);
        skipped += 1;
        continue;
      }

      backup.push({
        _id: String(hour._id),
        eventId,
        employee: hour.employee,
        total: before,
        auxiliaryTrasport: aux,
      });

      if (APPLY) {
        await Hour.updateOne(
          { _id: hour._id },
          { $set: { total: after, auxiliaryTrasport: 0 } }
        );
      }

      touched += 1;
      moved += aux;
    }
  }

  if (APPLY && backup.length) {
    const file = path.join(
      process.cwd(),
      `normalize-aux-backup-${Date.now()}.json`
    );
    fs.writeFileSync(file, JSON.stringify(backup, null, 2), "utf8");
    console.log(`\nRespaldo del estado anterior: ${file}`);
  }

  console.log(
    `\n${
      APPLY ? "Actualizados" : "Se actualizarian"
    } ${touched} registro(s); ${skipped} omitido(s). ${moved} COP salen de los totales por registro y se pagan como linea por dia.`
  );

  if (!APPLY) console.log("Nada se escribio. Repetir con --apply.");

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Fallo:", error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
