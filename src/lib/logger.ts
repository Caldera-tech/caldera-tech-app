import winston from "winston"

// Sécurité : Vérifie si nous sommes bien dans l'environnement Node.js
const isServer = typeof window === "undefined"

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json(),
  ),
  transports: [
    ...(isServer
      ? [
          new winston.transports.File({
            filename: "logs/audit.log",
            level: "info",
          }),

          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
          }),
        ]
      : []),
  ],
})

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  )
}

export default logger
