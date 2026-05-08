import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on('error', (err): void => {
  console.log('Redis client error');
  // console.log('Redis client error - ', err);
  // NOTE: ECONNREFUSED is when the process of redis is not on in backgraound
  // as one of the processes
});

(async (): Promise<void> => {
  try {
    await redisClient.connect();
    // console.log("connect succesfully!");
  } catch (err) {
    console.log('Failed to connect to Redis:', err);
  }
})();

export default redisClient;
