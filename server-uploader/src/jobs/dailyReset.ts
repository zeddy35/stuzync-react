import cron from 'node-cron';
import { User } from '../models/User';

export function scheduleDailyReset() {
  cron.schedule('0 * * * *', async () => {
    const now = new Date();
    const users = await User.find({ dailyResetAt: { $lte: now } }).select('_id');
    for (const u of users) {
      await User.updateOne(
        { _id: u._id },
        { $set: { dailyUploadedBytes: 0, dailyResetAt: new Date(Date.now() + 24 * 3600 * 1000) } }
      );
    }
  });
}

