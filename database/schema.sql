-- Esquema MySQL de Luminar.
-- El frontend usa mysql2 para autenticación y el CRUD usa Spring Data JPA.

CREATE DATABASE IF NOT EXISTS `crud_tienda`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `crud_tienda`;

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
  KEY `facturas_numero_idx` (`numero`),
  CONSTRAINT `facturas_idCliente_fkey` FOREIGN KEY (`idCliente`) REFERENCES `clientes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `facturas_idforma_fkey` FOREIGN KEY (`idforma`) REFERENCES `formaspago` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `facturas_idestado_fkey` FOREIGN KEY (`idestado`) REFERENCES `estadosfacturas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @facturas_numero_index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'facturas'
    AND INDEX_NAME = 'facturas_numero_idx'
);
SET @facturas_numero_index_migration = IF(
  @facturas_numero_index_exists = 0,
  'ALTER TABLE `facturas` ADD INDEX `facturas_numero_idx` (`numero`)',
  'SELECT 1'
);
PREPARE facturas_numero_index_statement FROM @facturas_numero_index_migration;
EXECUTE facturas_numero_index_statement;
DEALLOCATE PREPARE facturas_numero_index_statement;

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
  `role` VARCHAR(32) NOT NULL DEFAULT 'empleado',
  `banned` TINYINT(1) NOT NULL DEFAULT 0,
  `banReason` TEXT NULL,
  `banExpires` DATETIME(3) NULL,
  `image` TEXT,
  `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migración idempotente para instalaciones que ya tenían la tabla de usuarios.
SET @role_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'user'
    AND COLUMN_NAME = 'role'
);
SET @role_migration = IF(
  @role_column_exists = 0,
  'ALTER TABLE `user` ADD COLUMN `role` VARCHAR(32) NOT NULL DEFAULT ''empleado'' AFTER `emailVerified`',
  'SELECT 1'
);
PREPARE role_statement FROM @role_migration;
EXECUTE role_statement;
DEALLOCATE PREPARE role_statement;

ALTER TABLE `user`
  MODIFY COLUMN `role` VARCHAR(32) NOT NULL DEFAULT 'empleado';

-- Columnas requeridas por el complemento administrativo de Better Auth.
SET @banned_column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'banned'
);
SET @banned_migration = IF(
  @banned_column_exists = 0,
  'ALTER TABLE `user` ADD COLUMN `banned` TINYINT(1) NOT NULL DEFAULT 0 AFTER `role`',
  'SELECT 1'
);
PREPARE banned_statement FROM @banned_migration;
EXECUTE banned_statement;
DEALLOCATE PREPARE banned_statement;

SET @ban_reason_column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'banReason'
);
SET @ban_reason_migration = IF(
  @ban_reason_column_exists = 0,
  'ALTER TABLE `user` ADD COLUMN `banReason` TEXT NULL AFTER `banned`',
  'SELECT 1'
);
PREPARE ban_reason_statement FROM @ban_reason_migration;
EXECUTE ban_reason_statement;
DEALLOCATE PREPARE ban_reason_statement;

SET @ban_expires_column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'banExpires'
);
SET @ban_expires_migration = IF(
  @ban_expires_column_exists = 0,
  'ALTER TABLE `user` ADD COLUMN `banExpires` DATETIME(3) NULL AFTER `banReason`',
  'SELECT 1'
);
PREPARE ban_expires_statement FROM @ban_expires_migration;
EXECUTE ban_expires_statement;
DEALLOCATE PREPARE ban_expires_statement;

UPDATE `user`
SET `role` = 'empleado'
WHERE `role` IS NULL OR `role` NOT IN ('admin', 'supervisor', 'empleado');

CREATE TABLE IF NOT EXISTS `session` (
  `id` VARCHAR(36) NOT NULL,
  `expiresAt` TIMESTAMP(3) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` TIMESTAMP(3) NOT NULL,
  `ipAddress` TEXT,
  `userAgent` TEXT,
  `userId` VARCHAR(36) NOT NULL,
  `impersonatedBy` VARCHAR(36) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `session_userId_idx` (`userId`),
  CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @impersonated_by_column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'session' AND COLUMN_NAME = 'impersonatedBy'
);
SET @impersonated_by_migration = IF(
  @impersonated_by_column_exists = 0,
  'ALTER TABLE `session` ADD COLUMN `impersonatedBy` VARCHAR(36) NULL AFTER `userId`',
  'SELECT 1'
);
PREPARE impersonated_by_statement FROM @impersonated_by_migration;
EXECUTE impersonated_by_statement;
DEALLOCATE PREPARE impersonated_by_statement;

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

-- Datos de prueba idempotentes para el dashboard.
START TRANSACTION;

INSERT INTO `productos` (`nombre`, `precio`, `cantidad`, `created_at`, `updated_at`)
SELECT 'Sony Alpha 7 IV', 44999, 8, NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `productos` WHERE `nombre` = 'Sony Alpha 7 IV');

INSERT INTO `productos` (`nombre`, `precio`, `cantidad`, `created_at`, `updated_at`)
SELECT 'Sigma 24-70mm f/2.8 DG DN II', 24999, 12, NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `productos` WHERE `nombre` = 'Sigma 24-70mm f/2.8 DG DN II');

INSERT INTO `productos` (`nombre`, `precio`, `cantidad`, `created_at`, `updated_at`)
SELECT 'Rode Wireless GO II', 6999, 15, NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `productos` WHERE `nombre` = 'Rode Wireless GO II');

INSERT INTO `productos` (`nombre`, `precio`, `cantidad`, `created_at`, `updated_at`)
SELECT 'Tripode Rollei C6i', 4299, 9, NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `productos` WHERE `nombre` = 'Tripode Rollei C6i');

INSERT INTO `pedidos` (`nombre`, `precio`, `cantidad`, `created_at`, `updated_at`)
SELECT 'Sony Alpha 7 IV', 44999, 1, NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `pedidos` WHERE `nombre` = 'Sony Alpha 7 IV');

INSERT INTO `pedidos` (`nombre`, `precio`, `cantidad`, `created_at`, `updated_at`)
SELECT 'Rode Wireless GO II', 6999, 2, NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `pedidos` WHERE `nombre` = 'Rode Wireless GO II');

INSERT INTO `clientes` (`nombre`, `rfc`, `direccion`, `telefono`, `email`, `created_at`, `updated_at`)
SELECT 'Mariana Lopez', 'LOPM900101T01', 'Av. Reforma 120, CDMX', '5512345678', 'mariana.lopez@example.test', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `clientes` WHERE `email` = 'mariana.lopez@example.test');

INSERT INTO `clientes` (`nombre`, `rfc`, `direccion`, `telefono`, `email`, `created_at`, `updated_at`)
SELECT 'Estudio Norte', 'ENO210315AB2', 'Calz. Independencia 450, Guadalajara', '3312345678', 'contacto@estudionorte.test', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `clientes` WHERE `email` = 'contacto@estudionorte.test');

INSERT INTO `clientes` (`nombre`, `rfc`, `direccion`, `telefono`, `email`, `created_at`, `updated_at`)
SELECT 'Carlos Hernandez', 'HEGC880812QK4', 'Av. Universidad 88, Monterrey', '8112345678', 'carlos.hernandez@example.test', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `clientes` WHERE `email` = 'carlos.hernandez@example.test');

INSERT INTO `formaspago` (`nombre`)
SELECT 'Tarjeta'
WHERE NOT EXISTS (SELECT 1 FROM `formaspago` WHERE `nombre` = 'Tarjeta');

INSERT INTO `formaspago` (`nombre`)
SELECT 'Transferencia'
WHERE NOT EXISTS (SELECT 1 FROM `formaspago` WHERE `nombre` = 'Transferencia');

INSERT INTO `formaspago` (`nombre`)
SELECT 'Efectivo'
WHERE NOT EXISTS (SELECT 1 FROM `formaspago` WHERE `nombre` = 'Efectivo');

INSERT INTO `estadosfacturas` (`estado`)
SELECT 'Pendiente'
WHERE NOT EXISTS (SELECT 1 FROM `estadosfacturas` WHERE `estado` = 'Pendiente');

INSERT INTO `estadosfacturas` (`estado`)
SELECT 'Pagada'
WHERE NOT EXISTS (SELECT 1 FROM `estadosfacturas` WHERE `estado` = 'Pagada');

INSERT INTO `estadosfacturas` (`estado`)
SELECT 'Cancelada'
WHERE NOT EXISTS (SELECT 1 FROM `estadosfacturas` WHERE `estado` = 'Cancelada');

INSERT INTO `perfiles` (`nombre`)
SELECT 'Administrador'
WHERE NOT EXISTS (SELECT 1 FROM `perfiles` WHERE `nombre` = 'Administrador');

INSERT INTO `perfiles` (`nombre`)
SELECT 'Supervisor'
WHERE NOT EXISTS (SELECT 1 FROM `perfiles` WHERE `nombre` = 'Supervisor');

INSERT INTO `perfiles` (`nombre`)
SELECT 'Empleado'
WHERE NOT EXISTS (SELECT 1 FROM `perfiles` WHERE `nombre` = 'Empleado');

INSERT INTO `facturas` (
  `numero`, `detalles`, `valor`, `archivo`, `idCliente`, `idforma`, `idestado`, `created_at`, `updated_at`
)
SELECT
  1001,
  'Sony Alpha 7 IV - 1 pieza',
  44999,
  'factura-1001.pdf',
  cliente.id,
  forma.id,
  estado.id,
  NOW(3),
  NOW(3)
FROM `clientes` AS cliente
JOIN `formaspago` AS forma ON forma.nombre = 'Tarjeta'
JOIN `estadosfacturas` AS estado ON estado.estado = 'Pagada'
WHERE cliente.email = 'mariana.lopez@example.test'
  AND NOT EXISTS (SELECT 1 FROM `facturas` WHERE `numero` = 1001)
LIMIT 1;

INSERT INTO `facturas` (
  `numero`, `detalles`, `valor`, `archivo`, `idCliente`, `idforma`, `idestado`, `created_at`, `updated_at`
)
SELECT
  1002,
  'Rode Wireless GO II - 2 piezas',
  13998,
  'factura-1002.pdf',
  cliente.id,
  forma.id,
  estado.id,
  NOW(3),
  NOW(3)
FROM `clientes` AS cliente
JOIN `formaspago` AS forma ON forma.nombre = 'Transferencia'
JOIN `estadosfacturas` AS estado ON estado.estado = 'Pendiente'
WHERE cliente.email = 'contacto@estudionorte.test'
  AND NOT EXISTS (SELECT 1 FROM `facturas` WHERE `numero` = 1002)
LIMIT 1;

COMMIT;
