import { PrismaClient, UserRole, GroupRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding for Volunteer Organization...");

  // Clear existing data (in reverse order of dependencies)
  await prisma.eventSubscription.deleteMany();
  await prisma.event.deleteMany();
  await prisma.userGroup.deleteMany();
  await prisma.group.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleared existing data");

  // Hash passwords
  const hashedPassword = await bcrypt.hash("123456", 12);

  // Create Site Admin (also Gaming Group Admin)
  const siteAdmin = await prisma.user.create({
    data: {
      email: "admin@bakke.me",
      name: "Site Admin",
      password: hashedPassword,
      role: UserRole.ADMIN,
      active: true,
      emailVerified: new Date(),
      accountStatus: "APPROVED",
      gdprConsentVersion: "1.0",
      gdprConsentDate: new Date(),
    },
  });

  // Create Group Admins
  const gamingAdmin = siteAdmin; // Site admin is also gaming admin

  const socialAdmin = await prisma.user.create({
    data: {
      email: "social.admin@bakke.me",
      name: "Social Adminary",
      password: hashedPassword,
      role: UserRole.USER,
      active: true,
      emailVerified: new Date(),
      accountStatus: "APPROVED",
      gdprConsentVersion: "1.0",
      gdprConsentDate: new Date(),
    },
  });

  const communityAdmin = await prisma.user.create({
    data: {
      email: "community.admin@bakke.me",
      name: "Community Main-Adminer",
      password: hashedPassword,
      role: UserRole.USER,
      active: true,
      emailVerified: new Date(),
      accountStatus: "APPROVED",
      gdprConsentVersion: "1.0",
      gdprConsentDate: new Date(),
    },
  });

  const communityCoAdmin = await prisma.user.create({
    data: {
      email: "community.coadmin@bakke.me",
      name: "Community Co-Adminer",
      password: hashedPassword,
      role: UserRole.USER,
      active: true,
      emailVerified: new Date(),
      accountStatus: "APPROVED",
      gdprConsentVersion: "1.0",
      gdprConsentDate: new Date(),
    },
  });

  // Create Regular Users
  const user1 = await prisma.user.create({
    data: {
      email: "alex.volunteer@bakke.me",
      name: "Alex Volunteera",
      password: hashedPassword,
      role: UserRole.USER,
      active: true,
      emailVerified: new Date(),
      accountStatus: "APPROVED",
      gdprConsentVersion: "1.0",
      gdprConsentDate: new Date(),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "jessica.helper@bakke.me",
      name: "Jessica Helper",
      password: hashedPassword,
      role: UserRole.USER,
      active: true,
      emailVerified: new Date(),
      accountStatus: "APPROVED",
      gdprConsentVersion: "1.0",
      gdprConsentDate: new Date(),
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "chris.volunteer@bakke.me",
      name: "Chris Volunteery",
      password: hashedPassword,
      role: UserRole.USER,
      active: true,
      emailVerified: new Date(),
      accountStatus: "APPROVED",
      gdprConsentVersion: "1.0",
      gdprConsentDate: new Date(),
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: "maria.helper@bakke.me",
      name: "Maria Helperson",
      password: hashedPassword,
      role: UserRole.USER,
      active: true,
      emailVerified: new Date(),
      accountStatus: "APPROVED",
      gdprConsentVersion: "1.0",
      gdprConsentDate: new Date(),
    },
  });

  const user5 = await prisma.user.create({
    data: {
      email: "tom.volunteer@bakke.me",
      name: "Tom Volunteerson",
      password: hashedPassword,
      role: UserRole.USER,
      active: true,
      emailVerified: new Date(),
      accountStatus: "APPROVED",
      gdprConsentVersion: "1.0",
      gdprConsentDate: new Date(),
    },
  });

  console.log(
    "👥 Created 10 users (1 site admin, 4 group admins, 5 regular users)"
  );

  // Create Groups
  const gamingGroup = await prisma.group.create({
    data: {
      name: "Gaming Volunteers",
      description:
        "Volunteers who organize gaming events, LAN parties, and gaming tournaments for the community",
      createdBy: gamingAdmin.id,
    },
  });

  const socialGroup = await prisma.group.create({
    data: {
      name: "Social Activities",
      description:
        "Organizing social gatherings like bowling, rock climbing, golf, and other recreational activities",
      createdBy: socialAdmin.id,
    },
  });

  const communityGroup = await prisma.group.create({
    data: {
      name: "Community Outreach",
      description:
        "Volunteers focused on community service, charity events, food drives, and local support initiatives",
      createdBy: communityAdmin.id,
    },
  });

  // Create a hidden group for testing visibility
  const hiddenGroup = await prisma.group.create({
    data: {
      name: "Special Operations",
      description:
        "Confidential volunteer operations and exclusive events for selected members only",
      createdBy: siteAdmin.id,
      visible: false, // Hidden group
    },
  });

  console.log("📚 Created 4 volunteer groups (3 visible, 1 hidden)");

  // Add users to groups
  await prisma.userGroup.createMany({
    data: [
      // Gaming Group
      {
        userId: gamingAdmin.id,
        groupId: gamingGroup.id,
        role: GroupRole.ADMIN,
      },
      { userId: user1.id, groupId: gamingGroup.id, role: GroupRole.MEMBER },
      { userId: user2.id, groupId: gamingGroup.id, role: GroupRole.MEMBER },
      { userId: user3.id, groupId: gamingGroup.id, role: GroupRole.MEMBER },

      // Social Group
      {
        userId: socialAdmin.id,
        groupId: socialGroup.id,
        role: GroupRole.ADMIN,
      },
      { userId: user1.id, groupId: socialGroup.id, role: GroupRole.MEMBER },
      { userId: user4.id, groupId: socialGroup.id, role: GroupRole.MEMBER },
      { userId: user5.id, groupId: socialGroup.id, role: GroupRole.MEMBER },
      {
        userId: gamingAdmin.id,
        groupId: socialGroup.id,
        role: GroupRole.MEMBER,
      },

      // Community Outreach Group (has 2 admins)
      {
        userId: communityAdmin.id,
        groupId: communityGroup.id,
        role: GroupRole.ADMIN,
      },
      {
        userId: communityCoAdmin.id,
        groupId: communityGroup.id,
        role: GroupRole.ADMIN,
      },
      { userId: user2.id, groupId: communityGroup.id, role: GroupRole.MEMBER },
      { userId: user3.id, groupId: communityGroup.id, role: GroupRole.MEMBER },
      { userId: user4.id, groupId: communityGroup.id, role: GroupRole.MEMBER },
      { userId: user5.id, groupId: communityGroup.id, role: GroupRole.MEMBER },
      {
        userId: socialAdmin.id,
        groupId: communityGroup.id,
        role: GroupRole.MEMBER,
      },

      // Hidden Special Operations Group (limited membership)
      {
        userId: siteAdmin.id,
        groupId: hiddenGroup.id,
        role: GroupRole.ADMIN,
      },
      { userId: user1.id, groupId: hiddenGroup.id, role: GroupRole.MEMBER },
      { userId: user2.id, groupId: hiddenGroup.id, role: GroupRole.MEMBER },
    ],
  });

  console.log("🤝 Added users to groups");

  // Helper function to create future dates
  const createFutureDate = (daysFromNow: number, hours: number = 19) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hours, 0, 0, 0);
    return date;
  };

  // Helper function to create past dates
  const createPastDate = (daysAgo: number, hours: number = 19) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hours, 0, 0, 0);
    return date;
  };

  const createFutureDateEnd = (startDate: Date, durationHours: number = 2) => {
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + durationHours);
    return endDate;
  };

  // Gaming Group Events (3 future, 2 past)

  // Past Gaming Events
  const pastLanPlanningStart = createPastDate(45, 19);
  const pastLanPlanning = await prisma.event.create({
    data: {
      title: "LAN Party Planning Meeting",
      description:
        "Planning session for our upcoming major LAN party event. Discussing games, prizes, and logistics.",
      startDate: pastLanPlanningStart,
      endDate: createFutureDateEnd(pastLanPlanningStart, 2),
      location: "Community Center, Meeting Room B",
      groupId: gamingGroup.id,
      createdBy: gamingAdmin.id,
    },
  });

  const pastLanPartyStart = createPastDate(30, 10);
  const pastLanParty = await prisma.event.create({
    data: {
      title: "Epic Gaming LAN Party",
      description:
        "Major LAN party with tournaments in CS:GO, League of Legends, and retro games. Prizes and food provided!",
      startDate: pastLanPartyStart,
      endDate: createFutureDateEnd(pastLanPartyStart, 12),
      location: "Tech Hub Gaming Arena",
      groupId: gamingGroup.id,
      createdBy: gamingAdmin.id,
    },
  });

  // Future Gaming Events
  const mondayMeetStart = createFutureDate(3, 19);
  const mondayMeet = await prisma.event.create({
    data: {
      title: "Monday Gaming Meet-up",
      description:
        "Weekly casual gaming session. Bring your favorite games or try something new!",
      startDate: mondayMeetStart,
      endDate: createFutureDateEnd(mondayMeetStart, 3),
      location: "Gaming Lounge, Downtown",
      groupId: gamingGroup.id,
      createdBy: gamingAdmin.id,
    },
  });

  const wednesdayPlanningStart = createFutureDate(12, 18);
  const wednesdayPlanning = await prisma.event.create({
    data: {
      title: "Wednesday Planning Meeting",
      description:
        "Monthly planning meeting to organize upcoming gaming events and tournaments.",
      startDate: wednesdayPlanningStart,
      endDate: createFutureDateEnd(wednesdayPlanningStart, 2),
      location: "Community Center, Conference Room",
      groupId: gamingGroup.id,
      createdBy: gamingAdmin.id,
    },
  });

  const bigLanPartyStart = createFutureDate(25, 9);
  const bigLanParty = await prisma.event.create({
    data: {
      title: "Summer Gaming Championship LAN",
      description:
        "Our biggest LAN party of the year! Multiple tournaments, streaming setup, and amazing prizes!",
      startDate: bigLanPartyStart,
      endDate: createFutureDateEnd(bigLanPartyStart, 14),
      location: "Convention Center, Hall A",
      groupId: gamingGroup.id,
      createdBy: gamingAdmin.id,
    },
  });

  // Social Activities Group Events (3 future, 2 past)

  // Past Social Events
  const pastBowlingStart = createPastDate(20, 18);
  const pastBowling = await prisma.event.create({
    data: {
      title: "Strike Night Bowling",
      description:
        "Fun bowling night with pizza and drinks. Great for meeting new volunteers!",
      startDate: pastBowlingStart,
      endDate: createFutureDateEnd(pastBowlingStart, 3),
      location: "Lucky Strike Bowling Alley",
      groupId: socialGroup.id,
      createdBy: socialAdmin.id,
    },
  });

  const pastClimbingStart = createPastDate(10, 16);
  const pastClimbing = await prisma.event.create({
    data: {
      title: "Rock Climbing Adventure",
      description:
        "Indoor rock climbing session followed by dinner. All skill levels welcome!",
      startDate: pastClimbingStart,
      endDate: createFutureDateEnd(pastClimbingStart, 4),
      location: "Vertical Adventures Climbing Gym",
      groupId: socialGroup.id,
      createdBy: socialAdmin.id,
    },
  });

  // Future Social Events
  const futureBowlingStart = createFutureDate(8, 19);
  const futureBowling = await prisma.event.create({
    data: {
      title: "Team Bowling Tournament",
      description:
        "Competitive bowling tournament with team prizes and celebration dinner.",
      startDate: futureBowlingStart,
      endDate: createFutureDateEnd(futureBowlingStart, 3),
      location: "Strike Zone Bowling Center",
      groupId: socialGroup.id,
      createdBy: socialAdmin.id,
    },
  });

  const futureGolfStart = createFutureDate(15, 8);
  const futureGolf = await prisma.event.create({
    data: {
      title: "Morning Golf Outing",
      description:
        "Relaxing golf morning followed by brunch. Equipment rentals available.",
      startDate: futureGolfStart,
      endDate: createFutureDateEnd(futureGolfStart, 5),
      location: "Greenfield Golf Course",
      groupId: socialGroup.id,
      createdBy: socialAdmin.id,
    },
  });

  const futureClimbingStart = createFutureDate(22, 17);
  const futureClimbing = await prisma.event.create({
    data: {
      title: "Outdoor Rock Climbing Expedition",
      description:
        "Guided outdoor climbing experience for intermediate climbers. Transportation provided.",
      startDate: futureClimbingStart,
      endDate: createFutureDateEnd(futureClimbingStart, 6),
      location: "Canyon Cliff Climbing Area",
      groupId: socialGroup.id,
      createdBy: socialAdmin.id,
    },
  });

  console.log("📅 Created Gaming and Social events");

  // Community Outreach Group Events (5 future, 4 past)

  // Past Community Events
  const pastFoodDriveStart = createPastDate(60, 9);
  const pastFoodDrive = await prisma.event.create({
    data: {
      title: "Winter Food Drive",
      description:
        "Community food collection for local food bank. Collected over 500 items!",
      startDate: pastFoodDriveStart,
      endDate: createFutureDateEnd(pastFoodDriveStart, 8),
      location: "City Mall, Main Entrance",
      groupId: communityGroup.id,
      createdBy: communityAdmin.id,
    },
  });

  const pastParkCleanupStart = createPastDate(40, 8);
  const pastParkCleanup = await prisma.event.create({
    data: {
      title: "Spring Park Cleanup",
      description:
        "Volunteer cleanup of Central Park. Tools and lunch provided. Made a real difference!",
      startDate: pastParkCleanupStart,
      endDate: createFutureDateEnd(pastParkCleanupStart, 6),
      location: "Central Park, East Entrance",
      groupId: communityGroup.id,
      createdBy: communityAdmin.id,
    },
  });

  const pastSeniorCenterStart = createPastDate(25, 14);
  const pastSeniorCenter = await prisma.event.create({
    data: {
      title: "Senior Center Tech Help",
      description:
        "Helped seniors learn to use smartphones and tablets. Very rewarding experience!",
      startDate: pastSeniorCenterStart,
      endDate: createFutureDateEnd(pastSeniorCenterStart, 4),
      location: "Sunset Senior Living Center",
      groupId: communityGroup.id,
      createdBy: communityAdmin.id,
    },
  });

  const pastBloodDriveStart = createPastDate(15, 10);
  const pastBloodDrive = await prisma.event.create({
    data: {
      title: "Community Blood Drive",
      description:
        "Organized blood donation event. Helped save lives in our community!",
      startDate: pastBloodDriveStart,
      endDate: createFutureDateEnd(pastBloodDriveStart, 6),
      location: "Community Center, Main Hall",
      groupId: communityGroup.id,
      createdBy: communityAdmin.id,
    },
  });

  // Future Community Events
  const futureLibraryStart = createFutureDate(5, 15);
  const futureLibrary = await prisma.event.create({
    data: {
      title: "Children's Reading Program",
      description:
        "Help children with reading skills at the local library. Training provided for new volunteers.",
      startDate: futureLibraryStart,
      endDate: createFutureDateEnd(futureLibraryStart, 3),
      location: "City Library, Children's Section",
      groupId: communityGroup.id,
      createdBy: communityAdmin.id,
    },
  });

  const futureHabitatStart = createFutureDate(11, 8);
  const futureHabitat = await prisma.event.create({
    data: {
      title: "Habitat for Humanity Build",
      description:
        "Help build homes for families in need. No construction experience required!",
      startDate: futureHabitatStart,
      endDate: createFutureDateEnd(futureHabitatStart, 8),
      location: "Maple Street Construction Site",
      groupId: communityGroup.id,
      createdBy: communityAdmin.id,
    },
  });

  const futureFoodKitchenStart = createFutureDate(18, 11);
  const futureFoodKitchen = await prisma.event.create({
    data: {
      title: "Soup Kitchen Volunteer Day",
      description:
        "Serve meals to those in need. Prepare, serve, and clean up. Very fulfilling work.",
      startDate: futureFoodKitchenStart,
      endDate: createFutureDateEnd(futureFoodKitchenStart, 5),
      location: "Hope Mission Kitchen",
      groupId: communityGroup.id,
      createdBy: communityAdmin.id,
    },
  });

  const futureBeachCleanupStart = createFutureDate(26, 9);
  const futureBeachCleanup = await prisma.event.create({
    data: {
      title: "Coastal Cleanup Day",
      description:
        "Environmental cleanup of local beaches and waterways. Help protect marine life!",
      startDate: futureBeachCleanupStart,
      endDate: createFutureDateEnd(futureBeachCleanupStart, 6),
      location: "Seaside Beach, Pier Parking",
      groupId: communityGroup.id,
      createdBy: communityAdmin.id,
    },
  });

  const futureCharityRunStart = createFutureDate(33, 7);
  const futureCharityRun = await prisma.event.create({
    data: {
      title: "Charity Fun Run Organization",
      description:
        "Help organize and run a charity 5K event. Registration, water stations, and finish line support.",
      startDate: futureCharityRunStart,
      endDate: createFutureDateEnd(futureCharityRunStart, 7),
      location: "Riverside Park, Starting Line",
      groupId: communityGroup.id,
      createdBy: communityAdmin.id,
    },
  });

  console.log("📅 Created Community Outreach events");

  // Special Operations Group Events (3 future: 2 hidden, 1 visible)

  // Hidden event 1
  const secretMissionStart = createFutureDate(7, 20);
  const secretMission = await prisma.event.create({
    data: {
      title: "Classified Operation Alpha",
      description:
        "Confidential mission briefing and execution. Need-to-know basis only.",
      startDate: secretMissionStart,
      endDate: createFutureDateEnd(secretMissionStart, 3),
      location: "Secure Location TBD",
      groupId: hiddenGroup.id,
      createdBy: siteAdmin.id,
      visible: false, // Hidden event
    },
  });

  // Hidden event 2
  const covertTrainingStart = createFutureDate(14, 18);
  const covertTraining = await prisma.event.create({
    data: {
      title: "Advanced Tactical Training",
      description:
        "Specialized training session for experienced operatives. Equipment will be provided.",
      startDate: covertTrainingStart,
      endDate: createFutureDateEnd(covertTrainingStart, 4),
      location: "Training Facility - Sector 7",
      groupId: hiddenGroup.id,
      createdBy: siteAdmin.id,
      visible: false, // Hidden event
    },
  });

  // Visible event in hidden group
  const teamBuildingStart = createFutureDate(21, 16);
  const teamBuilding = await prisma.event.create({
    data: {
      title: "Team Building Workshop",
      description:
        "Trust exercises and team coordination activities. Open to all group members.",
      startDate: teamBuildingStart,
      endDate: createFutureDateEnd(teamBuildingStart, 3),
      location: "Mountain Retreat Center",
      groupId: hiddenGroup.id,
      createdBy: siteAdmin.id,
      visible: true, // Visible event in hidden group
    },
  });

  console.log("📅 Created Special Operations events (2 hidden, 1 visible)");

  // Make one random existing event hidden for testing
  const hiddenBowlingStart = createFutureDate(8, 19);
  const hiddenBowlingEvent = await prisma.event.update({
    where: { id: futureBowling.id },
    data: {
      title: "Secret Team Bowling Tournament",
      description:
        "Exclusive bowling tournament for select members only. Invitation required.",
      visible: false, // Make this event hidden
    },
  });

  console.log("📅 Updated one random event to be hidden for testing");

  // Create Event Subscriptions with realistic volunteer participation
  await prisma.eventSubscription.createMany({
    data: [
      // Gaming Events - Popular with gaming enthusiasts
      { userId: user1.id, eventId: mondayMeet.id },
      { userId: user2.id, eventId: mondayMeet.id },
      { userId: user5.id, eventId: mondayMeet.id },
      { userId: siteAdmin.id, eventId: wednesdayPlanning.id },
      { userId: user1.id, eventId: wednesdayPlanning.id },
      { userId: user3.id, eventId: bigLanParty.id },
      { userId: user4.id, eventId: bigLanParty.id },
      { userId: user5.id, eventId: bigLanParty.id },

      // Social Events - Broad appeal
      { userId: siteAdmin.id, eventId: futureBowling.id },
      { userId: user2.id, eventId: futureBowling.id },
      { userId: user3.id, eventId: futureBowling.id },
      { userId: socialAdmin.id, eventId: futureGolf.id },
      { userId: user1.id, eventId: futureGolf.id },
      { userId: user4.id, eventId: futureClimbing.id },
      { userId: user5.id, eventId: futureClimbing.id },

      // Community Events - High volunteer engagement
      { userId: siteAdmin.id, eventId: futureLibrary.id },
      { userId: user1.id, eventId: futureLibrary.id },
      { userId: user2.id, eventId: futureLibrary.id },
      { userId: communityAdmin.id, eventId: futureHabitat.id },
      { userId: user3.id, eventId: futureHabitat.id },
      { userId: user4.id, eventId: futureHabitat.id },
      { userId: user5.id, eventId: futureHabitat.id },
      { userId: user1.id, eventId: futureFoodKitchen.id },
      { userId: user2.id, eventId: futureFoodKitchen.id },
      { userId: siteAdmin.id, eventId: futureBeachCleanup.id },
      { userId: user3.id, eventId: futureBeachCleanup.id },
      { userId: user4.id, eventId: futureCharityRun.id },
      { userId: user5.id, eventId: futureCharityRun.id },

      // Special Operations Events - Limited access
      { userId: siteAdmin.id, eventId: secretMission.id },
      { userId: user1.id, eventId: secretMission.id },
      { userId: user2.id, eventId: covertTraining.id },
      { userId: siteAdmin.id, eventId: teamBuilding.id },
      { userId: user1.id, eventId: teamBuilding.id },
      { userId: user2.id, eventId: teamBuilding.id },
    ],
  });

  console.log("✅ Created event subscriptions");

  console.log("\n🎉 Database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(
    "- 10 Users (1 Site Admin, 3 Group Admins, 6 Regular volunteers)"
  );
  console.log(
    "- 4 Groups (3 visible: Gaming, Social, Community + 1 hidden: Special Operations)"
  );
  console.log("- 22 Events total:");
  console.log("  • Gaming: 5 events (3 future + 2 past)");
  console.log("  • Social: 5 events (3 future + 2 past, 1 hidden)");
  console.log("  • Community: 9 events (5 future + 4 past)");
  console.log("  • Special Ops: 3 events (all future, 2 hidden + 1 visible)");
  console.log("- 34 Event subscriptions across all groups");
  console.log(
    "- Visibility testing: 1 hidden group, 3 hidden events, 1 random hidden event"
  );
  console.log("\n🔐 Login credentials:");
  console.log("- Site Admin: admin@bakke.me / 123456");
  console.log("- Gaming Admin: admin@bakke.me / 123456 (same as site admin)");
  console.log("- Social Admin: social.admin@bakke.me / 123456");
  console.log("- Community Admin: community.admin@bakke.me / 123456");
  console.log("- Community Co-Admin: community.coadmin@bakke.me / 123456");
  console.log("- Sample User: alex.volunteer@bakke.me / 123456");
}

main()
  .catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
