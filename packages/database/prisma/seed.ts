import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Velora database...');

  // 1. Create or Upsert Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@velora.io' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'demo@velora.io',
      name: 'Alpha Quant',
      settings: {
        create: {
          oddsFormat: 'decimal',
          defaultStake: 100.0,
          riskTolerancePercent: 5.0,
          kellyFraction: 0.25,
          trackedBookmakers: ['pinnacle', 'draftkings', 'fanduel'],
          trackedSports: ['BASKETBALL', 'FOOTBALL', 'SOCCER'],
        },
      },
    },
  });

  // 2. Initial Bankroll Ledger Deposit if none exists
  const existingLedger = await prisma.bankrollLedger.findFirst({
    where: { userId: demoUser.id },
  });

  if (!existingLedger) {
    await prisma.bankrollLedger.create({
      data: {
        userId: demoUser.id,
        type: 'DEPOSIT',
        amount: 10000.0,
        balanceAfter: 10000.0,
      },
    });
  }

  // 3. Create Bookmakers
  const bookmakerData = [
    { key: 'pinnacle', name: 'Pinnacle' },
    { key: 'draftkings', name: 'DraftKings' },
    { key: 'fanduel', name: 'FanDuel' },
    { key: 'betmgm', name: 'BetMGM' },
  ];

  const bookmakers = [];
  for (const b of bookmakerData) {
    const bm = await prisma.bookmaker.upsert({
      where: { key: b.key },
      update: { name: b.name },
      create: b,
    });
    bookmakers.push(bm);
  }

  // 4. Create Leagues & Events
  const nbaLeague = await prisma.league.create({
    data: {
      sport: 'BASKETBALL',
      name: 'NBA',
      country: 'USA',
    },
  });

  const nflLeague = await prisma.league.create({
    data: {
      sport: 'FOOTBALL',
      name: 'NFL',
      country: 'USA',
    },
  });

  const event1 = await prisma.event.create({
    data: {
      leagueId: nbaLeague.id,
      externalId: 'nba_bos_lal_20260720',
      homeTeam: 'Boston Celtics',
      awayTeam: 'LA Lakers',
      startTime: new Date(Date.now() + 3600 * 4 * 1000), // +4h
      status: 'SCHEDULED',
    },
  });

  const event2 = await prisma.event.create({
    data: {
      leagueId: nflLeague.id,
      externalId: 'nfl_kc_sf_20260720',
      homeTeam: 'Kansas City Chiefs',
      awayTeam: 'San Francisco 49ers',
      startTime: new Date(Date.now() + 3600 * 24 * 1000), // +24h
      status: 'SCHEDULED',
    },
  });

  // 5. Create Markets & Selections
  const market1 = await prisma.market.create({
    data: {
      eventId: event1.id,
      bookmakerId: bookmakers[0].id, // Pinnacle
      marketType: 'h2h',
      status: 'open',
      selections: {
        create: [
          {
            name: 'Boston Celtics',
            priceDecimal: 1.85,
            priceAmerican: -118,
            impliedProbability: 0.5405,
          },
          {
            name: 'LA Lakers',
            priceDecimal: 2.05,
            priceAmerican: +105,
            impliedProbability: 0.4878,
          },
        ],
      },
    },
    include: { selections: true },
  });

  console.log('✅ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
