-- Esquema MySQL de Luminar.
-- El frontend usa mysql2 para autenticación y el CRUD usa Spring Data JPA.

CREATE TABLE IF NOT EXISTS `productos` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(191) NOT NULL,
  `precio` INTEGER NOT NULL,
  `cantidad` INTEGER NOT NULL,
  `created_at` DATETIME(3) NULL,
  `updated_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pedidos` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(191) NOT NULL,
  `precio` INTEGER NOT NULL,
  `cantidad` INTEGER NOT NULL,
  `created_at` DATETIME(3) NULL,
  `updated_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `clientes` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(191) NOT NULL,
  `rfc` VARCHAR(191) NOT NULL,
  `direccion` VARCHAR(191) NOT NULL,
  `telefono` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `created_at` DATETIME(3) NULL,
  `updated_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `formaspago` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `estadosfacturas` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `estado` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `facturas` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `numero` INTEGER NOT NULL,
  `detalles` TEXT NOT NULL,
  `valor` INTEGER NOT NULL,
  `archivo` VARCHAR(191) NOT NULL,
  `idCliente` INTEGER UNSIGNED NOT NULL,
  `idforma` INTEGER UNSIGNED NOT NULL,
  `idestado` INTEGER UNSIGNED NOT NULL,
  `created_at` DATETIME(3) NULL,
  `updated_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `facturas_idCliente_fkey` FOREIGN KEY (`idCliente`) REFERENCES `clientes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `facturas_idforma_fkey` FOREIGN KEY (`idforma`) REFERENCES `formaspago` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `facturas_idestado_fkey` FOREIGN KEY (`idestado`) REFERENCES `estadosfacturas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `perfiles` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `email_verified_at` DATETIME(3) NULL,
  `password` VARCHAR(191) NOT NULL,
  `idperfil` INTEGER UNSIGNED NOT NULL,
  `remember_token` VARCHAR(191) NULL,
  `created_at` DATETIME(3) NULL,
  `updated_at` DATETIME(3) NULL,
  UNIQUE KEY `users_email_key` (`email`),
  PRIMARY KEY (`id`),
  CONSTRAINT `users_idperfil_fkey` FOREIGN KEY (`idperfil`) REFERENCES `perfiles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tablas de Better Auth (la integración usa el pool directo de mysql2).
CREATE TABLE IF NOT EXISTS `user` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `emailVerified` TINYINT(1) NOT NULL,
  `image` TEXT,
  `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `session` (
  `id` VARCHAR(36) NOT NULL,
  `expiresAt` TIMESTAMP(3) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` TIMESTAMP(3) NOT NULL,
  `ipAddress` TEXT,
  `userAgent` TEXT,
  `userId` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `session_userId_idx` (`userId`),
  CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `account` (
  `id` VARCHAR(36) NOT NULL,
  `accountId` TEXT NOT NULL,
  `providerId` TEXT NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `accessToken` TEXT,
  `refreshToken` TEXT,
  `idToken` TEXT,
  `accessTokenExpiresAt` TIMESTAMP(3) NULL,
  `refreshTokenExpiresAt` TIMESTAMP(3) NULL,
  `scope` TEXT,
  `password` TEXT,
  `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` TIMESTAMP(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `account_userId_idx` (`userId`),
  CONSTRAINT `account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `verification` (
  `id` VARCHAR(36) NOT NULL,
  `identifier` VARCHAR(255) NOT NULL,
  `value` TEXT NOT NULL,
  `expiresAt` TIMESTAMP(3) NOT NULL,
  `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `verification_identifier_idx` (`identifier`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
