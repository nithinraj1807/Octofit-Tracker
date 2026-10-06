import mongoose from 'mongoose';
import Activity from '../models/Activity.js';
import Leaderboard from '../models/Leaderboard.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import { connectDatabase } from '../config/database.js';

async function seedDatabase() {
  console.log('Seed the octofit_db database with test data');

  try {
    await connectDatabase();
    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Activity.deleteMany({}),
      Leaderboard.deleteMany({}),
      Workout.deleteMany({}),
    ]);

    const users = await User.insertMany([
      { username: 'maya.chen', firstName: 'Maya', lastName: 'Chen', email: 'maya.chen@example.com' },
      { username: 'alex.rivera', firstName: 'Alex', lastName: 'Rivera', email: 'alex.rivera@example.com' },
      { username: 'jordan.brooks', firstName: 'Jordan', lastName: 'Brooks', email: 'jordan.brooks@example.com' },
      { username: 'sam.taylor', firstName: 'Sam', lastName: 'Taylor', email: 'sam.taylor@example.com' },
    ]);

    const teams = await Team.insertMany([
      {
        name: 'Swift Striders',
        description: 'A team that builds endurance one run at a time.',
        members: [users[0]._id, users[1]._id],
      },
      {
        name: 'Peak Performers',
        description: 'Strength, consistency, and steady progress.',
        members: [users[2]._id, users[3]._id],
      },
    ]);

    const teamByUser = new Map<string, typeof teams[number]>();
    for (const user of users.slice(0, 2)) teamByUser.set(user._id.toString(), teams[0]);
    for (const user of users.slice(2)) teamByUser.set(user._id.toString(), teams[1]);

    await Promise.all(users.map((user) =>
      User.updateOne({ _id: user._id }, { team: teamByUser.get(user._id.toString())?._id }),
    ));

    const activities = await Activity.insertMany([
      { user: users[0]._id, activityType: 'running', title: 'After-school 5K', durationMinutes: 31, distanceKm: 5, caloriesBurned: 310, pointsEarned: 50 },
      { user: users[0]._id, activityType: 'walking', title: 'Campus steps', durationMinutes: 25, distanceKm: 1.8, caloriesBurned: 90, pointsEarned: 18 },
      { user: users[1]._id, activityType: 'running', title: 'River trail run', durationMinutes: 24, distanceKm: 4, caloriesBurned: 260, pointsEarned: 40 },
      { user: users[2]._id, activityType: 'strength', title: 'Bodyweight circuit', durationMinutes: 35, caloriesBurned: 220, pointsEarned: 35 },
      { user: users[2]._id, activityType: 'walking', title: 'Weekend neighborhood walk', durationMinutes: 40, distanceKm: 2.7, caloriesBurned: 130, pointsEarned: 24 },
      { user: users[3]._id, activityType: 'cycling', title: 'Neighborhood bike ride', durationMinutes: 38, distanceKm: 9, caloriesBurned: 280, pointsEarned: 38 },
    ]);

    const pointsByUser = new Map<string, number>();
    for (const activity of activities) {
      const userId = activity.user.toString();
      pointsByUser.set(userId, (pointsByUser.get(userId) ?? 0) + activity.pointsEarned);
    }

    await Promise.all(users.map((user) =>
      User.updateOne({ _id: user._id }, { points: pointsByUser.get(user._id.toString()) ?? 0 }),
    ));

    await Promise.all(teams.map((team) => {
      const teamPoints = team.members.reduce(
        (total, memberId) => total + (pointsByUser.get(memberId.toString()) ?? 0),
        0,
      );
      return Team.updateOne({ _id: team._id }, { points: teamPoints });
    }));

    const rankedUsers = [...users].sort((first, second) =>
      (pointsByUser.get(second._id.toString()) ?? 0) - (pointsByUser.get(first._id.toString()) ?? 0),
    );

    await Leaderboard.insertMany(rankedUsers.map((user, index) => ({
      user: user._id,
      team: teamByUser.get(user._id.toString())?._id,
      period: 'weekly',
      points: pointsByUser.get(user._id.toString()) ?? 0,
      rank: index + 1,
    })));

    await Workout.insertMany([
      { name: 'Easy Start Walk', description: 'A relaxed walk to build a daily movement habit.', difficulty: 'beginner', durationMinutes: 20, activityTypes: ['walking'] },
      { name: 'Run and Recover', description: 'Alternate a comfortable jog with short recovery walks.', difficulty: 'beginner', durationMinutes: 30, activityTypes: ['running', 'walking'] },
      { name: 'Full-body Basics', description: 'A simple circuit of bodyweight strength exercises.', difficulty: 'intermediate', durationMinutes: 25, activityTypes: ['strength'] },
    ]);

    console.log('Seeded users, teams, activities, leaderboard, and workouts');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedDatabase();
