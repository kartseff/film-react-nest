export interface AppConfig {
  port: number;
  database: {
    driver: string;
    url: string;
    username: string;
    password: string;
  };
}

export function loadConfig(): AppConfig {
  const port = Number.parseInt(process.env.PORT ?? '3000', 10);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer');
  }

  return {
    port,
    database: {
      driver: process.env.DATABASE_DRIVER ?? 'postgres',
      url:
        process.env.DATABASE_URL ?? 'postgres://localhost:5432/film_react_nest',
      username: process.env.DATABASE_USERNAME ?? 'student',
      password: process.env.DATABASE_PASSWORD ?? 'student',
    },
  };
}
