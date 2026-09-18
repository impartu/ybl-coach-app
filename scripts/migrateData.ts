// One-time migration: copies your legacy flat Firestore data into the new
// multi-tenant /teams/{teamId}/... structure. Run locally with Bun — see the
// bottom of this file (or the README note) for the exact command.
//
// This talks to TWO separate Firebase projects at once (source + destination),
// so it uses two independent `initializeApp` calls rather than importing
// `firebase.ts` from the app itself.

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';

// ---------------------------------------------------------------------------
// 1. CONFIGURE ME
// ---------------------------------------------------------------------------

// Pre-filled from your original firebase.ts (the "ybl-manager" project).
// Double-check this is still the project your legacy data lives in.
const SOURCE_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDkmkpt8hfobMqt_KS9x9cj4dFVfspPhXo",
  authDomain: "ybl-manager.firebaseapp.com",
  projectId: "ybl-manager",
  storageBucket: "ybl-manager.firebasestorage.app",
  messagingSenderId: "664793941403",
  appId: "1:664793941403:web:c9206cf8d7dd3e25c78d3e",
  measurementId: "G-8L716RX1EP",
};

// Pre-filled from your current firebase.ts (the "ybl-coach-app" project).
const DEST_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBRpjFghg9CQx5BEdciCwRtD2PXJR8W-WU",
  authDomain: "ybl-coach-app.firebaseapp.com",
  projectId: "ybl-coach-app",
  storageBucket: "ybl-coach-app.firebasestorage.app",
  messagingSenderId: "400781229040",
  appId: "1:400781229040:web:f328415349c18d95673b35",
  measurementId: "G-YHQC9XET26",
};

// Paste the destination team's ID here before running.
// Create the team first (Dashboard -> "Create Team"), then copy the id
// out of the URL: http://localhost:3000/team/<THIS_IS_THE_ID>
const TARGET_TEAM_ID = 'HNt1W1hiIrFcXT1WH6OL';

// Legacy favorites collection name. Verified against your live "ybl-manager"
// project: 'favorites' has real data (1 doc), 'saved_favorites' has none.
const LEGACY_FAVORITES_COLLECTION = 'favorites';

// Safety switch: with DRY_RUN = true, the script only reads from the source
// project and logs what it *would* write, without touching the destination.
// Flip to false once the logged output looks right.
const DRY_RUN = false;

// ---------------------------------------------------------------------------
// 2. MIGRATION LOGIC (shouldn't need to touch anything below this line)
// ---------------------------------------------------------------------------

async function migrateRoster(sourceDb: Firestore, destDb: Firestore) {
  console.log('\n--- Roster ---');
  const legacySnap = await getDoc(doc(sourceDb, 'team_settings', 'current_roster'));

  if (!legacySnap.exists()) {
    console.log('No legacy roster found at team_settings/current_roster. Skipping.');
    return;
  }

  const data = legacySnap.data();
  const roster = Array.isArray(data.roster) ? data.roster : [];
  const assignSettings = data.assignSettings ?? null;

  console.log(`Found legacy roster with ${roster.length} player(s).`);

  if (DRY_RUN) {
    console.log('[DRY RUN] Would write to teams/%s/roster/current', TARGET_TEAM_ID);
    return;
  }

  await setDoc(doc(destDb, 'teams', TARGET_TEAM_ID, 'roster', 'current'), {
    roster,
    ...(assignSettings ? { assignSettings } : {}),
    updatedAt: serverTimestamp(),
  });
  console.log(`Migrated roster (${roster.length} players) -> teams/${TARGET_TEAM_ID}/roster/current`);
}

async function migrateGames(sourceDb: Firestore, destDb: Firestore) {
  console.log('\n--- Games ---');
  const legacySnap = await getDocs(collection(sourceDb, 'games'));

  if (legacySnap.empty) {
    console.log('No legacy games found in the "games" collection. Skipping.');
    return;
  }

  console.log(`Found ${legacySnap.size} legacy game(s).`);

  if (DRY_RUN) {
    console.log('[DRY RUN] Would write each to teams/%s/games/{documentId} (same IDs preserved)', TARGET_TEAM_ID);
    return;
  }

  let migrated = 0;
  for (const legacyDoc of legacySnap.docs) {
    const data = legacyDoc.data();
    await setDoc(doc(destDb, 'teams', TARGET_TEAM_ID, 'games', legacyDoc.id), {
      roster: Array.isArray(data.roster) ? data.roster : [],
      timestamp: data.timestamp ?? serverTimestamp(),
    });
    migrated++;
  }
  console.log(`Migrated ${migrated} game(s) -> teams/${TARGET_TEAM_ID}/games/{documentId}`);
}

async function migrateFavorites(sourceDb: Firestore, destDb: Firestore) {
  console.log('\n--- Favorites ---');
  const legacySnap = await getDocs(collection(sourceDb, LEGACY_FAVORITES_COLLECTION));

  if (legacySnap.empty) {
    console.log(`No legacy favorites found in "${LEGACY_FAVORITES_COLLECTION}". Skipping.`);
    console.log('(If you expected favorites here, try setting LEGACY_FAVORITES_COLLECTION to "favorites" instead.)');
    return;
  }

  console.log(`Found ${legacySnap.size} legacy favorite(s).`);

  if (DRY_RUN) {
    console.log('[DRY RUN] Would write each to teams/%s/favorites/{documentId} (same IDs preserved)', TARGET_TEAM_ID);
    return;
  }

  let migrated = 0;
  for (const legacyDoc of legacySnap.docs) {
    const data = legacyDoc.data();
    await setDoc(doc(destDb, 'teams', TARGET_TEAM_ID, 'favorites', legacyDoc.id), {
      name: data.name ?? 'Untitled Favorite',
      gridState: data.gridState ?? {},
      createdAt: data.createdAt ?? serverTimestamp(),
    });
    migrated++;
  }
  console.log(`Migrated ${migrated} favorite(s) -> teams/${TARGET_TEAM_ID}/favorites/{documentId}`);
}

async function main() {
  if (!TARGET_TEAM_ID || TARGET_TEAM_ID === 'PASTE_YOUR_TEAM_ID_HERE') {
    throw new Error(
      'TARGET_TEAM_ID is not set. Create a team in the app first (Dashboard -> Create Team), ' +
      'copy its id from the URL (/team/<id>), and paste it into TARGET_TEAM_ID at the top of this script.'
    );
  }

  console.log(`Source project: ${SOURCE_FIREBASE_CONFIG.projectId}`);
  console.log(`Destination project: ${DEST_FIREBASE_CONFIG.projectId}`);
  console.log(`Target team: ${TARGET_TEAM_ID}`);
  console.log(DRY_RUN ? 'Mode: DRY RUN (no writes will be made)' : 'Mode: LIVE (writes will be made)');

  const sourceApp: FirebaseApp = initializeApp(SOURCE_FIREBASE_CONFIG, 'source');
  const destApp: FirebaseApp = initializeApp(DEST_FIREBASE_CONFIG, 'destination');
  const sourceDb = getFirestore(sourceApp);
  const destDb = getFirestore(destApp);

  if (!DRY_RUN) {
    const teamSnap = await getDoc(doc(destDb, 'teams', TARGET_TEAM_ID));
    if (!teamSnap.exists()) {
      throw new Error(
        `No team found at teams/${TARGET_TEAM_ID} in ${DEST_FIREBASE_CONFIG.projectId}. ` +
        'Double-check the id, or create the team in the app first.'
      );
    }
    console.log(`Confirmed destination team exists: "${teamSnap.data().name}"`);
  }

  await migrateRoster(sourceDb, destDb);
  await migrateGames(sourceDb, destDb);
  await migrateFavorites(sourceDb, destDb);

  console.log('\nDone.');
  if (DRY_RUN) {
    console.log('This was a dry run — no data was written. Set DRY_RUN = false and re-run to actually migrate.');
  }
  process.exit(0);
}

main().catch((error) => {
  console.error('\nMigration failed:', error);
  process.exit(1);
});
